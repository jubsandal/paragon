import puppeteer from 'puppeteer'
import puppeteer_extra from 'puppeteer-extra'
// @ts-ignore
import { proxyRequest } from 'puppeteer-proxy'
import puppeteer_steath from 'puppeteer-extra-plugin-stealth'
import axios from 'axios'

import { sleep } from './../utils.js'
import cfg from './../../config.js'
import { database } from './../database.js'
import * as Type from './../Types.js'
import {
    log,
    proxy as Proxy
} from './../utils.js'

export module browser {
    const _lo = () => {
        return {
            defaultViewport: null,
            headless: cfg.headless,
            // ignoreDefaultArgs: [ "--disable-extensions", "--enable-automation" ],
            // executablePath: "/usr/bin/chromium", // must be disabled on puppeteer extra stealth
            // args: [
            // '--disable-web-security',
            // '--no-sandbox',
            // '--disable-setuid-sandbox',
            // '--disable-dev-shm-usage',
            // ]
        }
    }

    const launch_opts = _lo()

    export interface AdvancedProxySchema {
        url: string
        authurl: string
        proxy: database.ProxySchema
    }

    function randomProxy(proxies: Proxy.Proxy[]): AdvancedProxySchema {
        let proxy = proxies.at(0 + Math.floor(Math.random() * cfg.proxy.length))
        if (!proxy) {
            return randomProxy(proxies)
        }
        return {
            url: "http://" + proxy.host + ":" + proxy.port,
            authurl: Proxy.http.toString(proxy),
            proxy: proxy
        }
    }

    let stealth_enabled = false

    function enablePuppeteerStealth() {
        if (!stealth_enabled) {
            puppeteer_extra.use(puppeteer_steath())
            stealth_enabled = true
        }
    }

    export async function setupBrowser(proxies: Proxy.Proxy[] | null, config: Type.botConfigEntry, account?: database.ORM.Account) {
        try {
            let proxy: AdvancedProxySchema | null = null
            if (proxies != null && proxies.length > 0) {
                proxy = randomProxy(proxies)
            }

            let browser
            switch (config.browserAdapter) {
                case "Common":
                    browser = await puppeteer.launch(launch_opts)
                    break
                case "AdsPower":
                    if (!account) {
                        throw "No account passed"
                    } else if (!account.adsUserId) {
                        throw "No ads linked to account"
                    }
                    let res
                    try {
                        res = await axios.get('http://' + ( config.adsLocalIPHost ?? "localhost" ) + ':50325/api/v1/browser/start?user_id=' + account.adsUserId)
                    } catch (e) {
                        throw "Cannot connect to AdsPower Local API " + e
                    }
                    try {
                        let puppeteerWs = <string>res.data.data.ws.puppeteer
                        if (config.adsLocalIPHost && config.adsLocalIPHost != "") {
                            puppeteerWs = puppeteerWs.replace("127.0.0.1", <string>config.adsLocalIPHost)
                        }
                        log.echo("Connecting to ads on", puppeteerWs)
                        browser = await puppeteer.connect({
                            browserWSEndpoint: puppeteerWs,
                            ...launch_opts
                        })
                    } catch (e) {
                        throw "Cannot connect to AdsPower user " + account.adsUserId + " browser " + (typeof e === "object" ? JSON.stringify(e, null, '\t') : e)
                    }
                    await sleep(4000)
                    break
                case "Stealth":
                    enablePuppeteerStealth()
                    browser = await puppeteer_extra.launch(launch_opts)
                    break
                default:
                    throw "Unknown browser adapter " + config.browserAdapter
            }

            if (!browser) {
                throw "Cannot create browser"
            }

            //const page = (await browser.pages())[0]
	    const page = await browser.newPage()

            if (proxy != null) {
                try {
                    log.echo("Proxy:", proxy)
                    await page.setRequestInterception(true)
                    page.on('request', async (request: any) => {
                        await proxyRequest({
                            page: page,
                            proxyUrl: proxy!.authurl,
                            request: request,
                        })
                    })
                } catch (e) {
                    throw "Proxy setup failed: " + e
                }
            }

            // await page
            //     .setUserAgent(
            //         'Mozilla/5.0 (X11; Linux x86_64; rv:101.0) Gecko/20100101 Firefox/101.0'
            //         // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36'
            //     )
            // await page.setExtraHTTPHeaders({
            //     'Access-Control-Allow-Origin': '*'
            //     // 'user-agent':                'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
            //     // 'upgrade-insecure-requests': '1',
            //     // 'accept':                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
            //     // 'accept-encoding':           'gzip, deflate, br',
            //     // 'accept-language':           'en-US,en;q=0.9,en;q=0.8'
            // })

            // most popular
            await page.setViewport({ width: 1920, height: 1080 })
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
            return {
                browser: browser,
                page: page,
                proxy: proxy,
            }
        } catch (err) {
            throw 'Browser initialization: ' + err
        }
    }
}
