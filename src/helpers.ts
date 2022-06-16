import puppeteer from 'puppeteer'
// @ts-ignore
import { proxyRequest } from 'puppeteer-proxy'
import * as fs from 'fs'

import cfg from './config.js'
import { database } from './database.js'
import {
    log,
    proxy as Proxy
} from './utils.js'

export module browser {
    const _lo = () => {
        return {
            headless: cfg.headless,
            // ignoreDefaultArgs: [ "--disable-extensions", "--enable-automation" ],
            executablePath: "/usr/bin/chromium", // must be disabled on puppeteer extra stealth
            args: [
                '--disable-web-security',
                // '--no-sandbox',
                // '--disable-setuid-sandbox',
                // '--disable-dev-shm-usage',
            ]
        }
    }

    const launch_opts = _lo()

    function randomProxy(): { url: string, authurl: string, proxy: database.ProxySchema } {
        let proxy = cfg.proxy.at(0 + Math.floor(Math.random() * cfg.proxy.length))
        if (!proxy) {
            return randomProxy()
        }
        return {
            url: "http://" + proxy.host + ":" + proxy.port,
            authurl: Proxy.http.toString(proxy),
            proxy: proxy
        }
    }

    export async function setupBrowser() {
        try {
            const proxy = randomProxy()
            log.echo("Proxy:", proxy)
            const browser = await puppeteer.launch(launch_opts)

            if (!browser) {
                throw "Cannot create browser"
            }

            const page = (await browser.pages())[0]

            try {
                await page.setRequestInterception(true)
                page.on('request', async (request: any) => {
                    await proxyRequest({
                        page: page,
                        proxyUrl: proxy.authurl,
                        request: request,
                    })
                })
            } catch (e) {
                throw "Proxy setup failed: " + e
            }

            await page
                .setUserAgent(
                    // 'Mozilla/5.0 (X11; Linux x86_64; rv:101.0) Gecko/20100101 Firefox/101.0'
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36'
                )
            // await page.setExtraHTTPHeaders({
            //     'Access-Control-Allow-Origin': '*'
            //     // 'user-agent':                'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
            //     // 'upgrade-insecure-requests': '1',
            //     // 'accept':                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            //     // 'accept-encoding':           'gzip, deflate, br',
            //     // 'accept-language':           'en-US,en;q=0.9,en;q=0.8'
            // })

            // most popular
            await page.setViewport({ width: 1366, height: 768 })
            await page.setDefaultNavigationTimeout(500000);

            // await page.on('dialog', async (dialog: puppeteer.Dialog) => {
            //     console.log(dialog.message)
            //     await dialog.accept();
            // })

            page.on('error', (err: any) => {
                log.error('browser error:', err.toString())
            })
            page.on('pageerror', (err: any) => {
                log.error("page error:", err.toString())
            })
        } catch (err) {
            throw 'Page initialization failed. Reason: ' + err
        }
    }
}

export module importman {

    type delemiter = "NL" | "Space" | "Colon"

    type trimOpt = "NL" | "Space" | "Both" | "No"
    type accountOpt = "NL" | "Space" | "Colon"
    type dataOpt = "NL" | "Space"
    type dataOrderOpt = "L" | "LP" | "PL" | "LPI" | "PLI" | "IPL" | "ILP" | "LIP"

    export interface importOpts {
        delemiters: {
            trim:    trimOpt
            account: accountOpt
            data:    dataOpt
        }
        dataOrder: dataOrderOpt
        path: Array<fs.PathLike>
    }

    function getDelemiter(d: delemiter): string {
        switch (d) {
            case "NL":
                // TODO determine windows \r\n and linux \n
                return "\n"
            case "Space":
                return " "
            case "Colon":
                return ":"
        }
    }

    function readAccount(chunk: string, opt: { delemiter: accountOpt, order: dataOrderOpt }): database.ORM.Account {
        let sub_chunks = chunk.split(getDelemiter(opt.delemiter))
        let _account = {
            login: "",
            password: "",
            extensions: {
                imap: false
            }
        }

        for (let i = 0; i < opt.order.length; i++) {
            const ch = opt.order.at(i)
            const word = sub_chunks.at(i)
            switch (ch) {
                case "L":
                    _account.login = <string>word
                    break;
                case "P":
                    _account.password = <string>word
                    break;
                case "I":
                    _account.extensions.imap = Boolean(word)
                    break;
            }
        }

        return new database.ORM.Account({ auth: { email: {..._account} } })
    }

    function readStructure(raw: string, opt: { delemiter: dataOpt, accountSize: number }) {
        let misc = raw.split(getDelemiter(opt.delemiter))
        let chunks = new Array<string>()

        for (let i = 0, c = 0; i < misc.length; i++, c++) {
            if (c == opt.accountSize-1) {
                let data = ""
                for (let j = 0; j < opt.accountSize; j++) {
                    data += <string>misc.at(i-( opt.accountSize - j ))
                    if (j+1 != opt.accountSize) {
                        data += getDelemiter(opt.delemiter)
                    }
                }
                chunks.push(data)
                c = 0
            }
        }

        return chunks
    }

    export async function smartImport(opts: importOpts) {
        if (opts.path.length === 0) {
            throw "No path passed"
        }

        for (const path of opts.path) {
            const raw = fs.readFileSync(path).toString()

            const structure = readStructure(raw, { delemiter: opts.delemiters.data, accountSize: opts.dataOrder.length })
            for (const chunk of structure) {
                const _a = readAccount(chunk, { delemiter: opts.delemiters.account, order: opts.dataOrder })
                if (await database.tables.accounts.findOne(a => a.auth.email.login == _a.auth.email.login)) {
                    continue
                }
                await _a.sync()
            }
        }
    }
}
