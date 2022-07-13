import puppeteer from 'puppeteer'
import puppeteer_extra from 'puppeteer-extra'
// @ts-ignore
import { proxyRequest } from 'puppeteer-proxy'
import puppeteer_steath from 'puppeteer-extra-plugin-stealth'
import axios from 'axios'

import { script, scriptAction } from './../../../../../Types/script.js'
import { Proxy, ProxyType } from './../../../../../Types/proxy.js'
import { database } from './../../../../database/module-manager.js'
import { log, sleep } from './../../../../../utils.js'
import cfg from './../../../../../config.js'

import { State } from './../state.js'
import { pageConfig } from './../atomicsTypes.js'
import { CmdError } from './../../../../lib/Error.js'

let stealth_enabled = false
function enablePuppeteerStealth() {
        if (!stealth_enabled) {
                puppeteer_extra.use(puppeteer_steath())
                stealth_enabled = true
        }
}

// -*-*-*-*-*-*-*-*-*-*-*-*-*-*

async function setupCommonBrowser(script: script) {
        return await puppeteer.launch(script.browserLaunch)
}

async function setupStealthBrowser(script: script) {
        enablePuppeteerStealth()
        return await puppeteer_extra.launch(script.browserLaunch)
}

async function setupAdsBrowser(account: database.ORM.Account, script: script) {
        let browser: puppeteer.Browser
        if (!account) {
                throw "No account passed"
        } else if (!account.adsUserId) {
                throw "No ads linked to account"
        }
        let res
        try {
                res = await axios.get('http://' + ( script.adsLocalAPIHost ?? "localhost" ) + ':50325/api/v1/browser/start?user_id=' + account.adsUserId)
        } catch (e) {
                throw "Cannot connect to AdsPower Local API " + e
        }
        try {
                let puppeteerWs = <string>res.data.data.ws.puppeteer
                if (script.adsLocalAPIHost && script.adsLocalAPIHost != "") {
                        puppeteerWs = puppeteerWs.replace("127.0.0.1", <string>script.adsLocalAPIHost)
                }
                log.echo("Connecting to ads on", puppeteerWs)
                browser = await puppeteer.connect({
                        browserWSEndpoint: puppeteerWs,
                        ...script.browserLaunch
                })
        } catch (e) {
                throw "Cannot connect to AdsPower user " + account.adsUserId + " browser " + (typeof e === "object" ? JSON.stringify(e, null, '\t') : e)
        }
        await sleep(1000)
        return browser
}

async function assignProxy(this: State, ...inputs: any[]): Promise<CmdError> {
        let page: puppeteer.Page = inputs[0]
        let proxy: Proxy = inputs[1]

        try {
                log.echo("Proxy:", proxy)
                await page.setRequestInterception(true)
                const proxyUrl = proxy.toString()
                page.on('request', async (request: any) => {
                        await proxyRequest({
                                page: page,
                                proxyUrl: proxyUrl,
                                request: request,
                        })
                })
        } catch (e) {
                return new CmdError(false, "Proxy setup failed: " + e, "Proxy setup failed: " + e)
        }

        return new CmdError(true)
}

async function configurePage(this: State, ...inputs: any[]): Promise<CmdError> {
        let page: puppeteer.Page = inputs[0]
        let config: pageConfig = inputs[1]
        if (config.userAgent) {
                await page
                        .setUserAgent(
                                config.userAgent
                                // 'Mozilla/5.0 (X11; Linux x86_64; rv:101.0) Gecko/20100101 Firefox/101.0'
                                // 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36'
                        )
        }

        if (config.headers) {
                await page.setExtraHTTPHeaders({
                        ...config.headers
                        // 'Access-Control-Allow-Origin': '*'
                        // 'user-agent':                'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
                        // 'upgrade-insecure-requests': '1',
                        // 'accept':                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
                        // 'accept-encoding':           'gzip, deflate, br',
                        // 'accept-language':           'en-US,en;q=0.9,en;q=0.8'
                })
        }

        if (config.viewPort) {
                await page.setViewport(config.viewPort)
        }
        await page.setDefaultNavigationTimeout(500000);

        return new CmdError(true)
}

async function setupBrowser(this: State, ...inputs: any[]): Promise<CmdError> {
        let account = inputs[0]
        let script: script = inputs[1]
        try {
                function randomProxy(proxies: ProxyType[] | Proxy[]): Proxy {
                        let proxy = proxies.at(0 + Math.floor(Math.random() * cfg.proxy.length))
                        if (!proxy) {
                                return randomProxy(proxies)
                        }
                        return proxy
                }

                // choose proxy
                let proxy: Proxy | null = null
                if (script.browserAdapter === "AdsPower") {
                        proxy = null
                } else if (script.usePreDefinedProxy) {
                        if (account.forseProxyLink) {
                                proxy = new Proxy(account.forseProxyLink)
                        } else {
                                return new CmdError(false, "No proxy hard setup for account id " + account.id, "No proxy hard setup for account id " + account.id)
                        }
                } else if (cfg.proxy != null && cfg.proxy.length > 0) {
                        proxy = randomProxy(cfg.proxy)
                }

                let browser: puppeteer.Browser
                switch (script.browserAdapter) {
                        case "Common":
                                setupCommonBrowser(script)
                                break
                        case "AdsPower":
                                setupAdsBrowser(account, script)
                                break
                        case "Stealth":
                                setupStealthBrowser(script)
                                break
                        default:
                                return new CmdError(false, "Unknown browser adapter " + script.browserAdapter, "Unknown browser adapter " + script.browserAdapter)
                }

                // @ts-ignore
                if (!browser) {
                        return new CmdError(false, "Cannot create browser", "Cannot create browser")
                }

                let page = await browser.newPage()

                page.on('error', (err: any) => {
                        log.error('Browser error:', err.toString())
                })
                page.on('pageerror', (err: any) => {
                        log.error("Page error:", err.toString())
                })

                this.profile = account
                this.browser = browser
                this.page = page
                this.initial_page = page
                this.proxy = proxy

                return new CmdError(true)
        } catch (err) {
                return new CmdError(false, "setup browser error", "setup browser error")
        }
}

export {
        configurePage, // page: puppeteer.Page, config: configurePageType
        setupBrowser, // account: database.ORM.Account, script: script
        assignProxy // page: puppeteer.Page, proxy: Proxy
}
