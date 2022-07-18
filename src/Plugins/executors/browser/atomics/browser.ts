import puppeteer from 'puppeteer'
import puppeteer_extra from 'puppeteer-extra'
// @ts-ignore
import { proxyRequest } from 'puppeteer-proxy'
import puppeteer_steath from 'puppeteer-extra-plugin-stealth'
import axios from 'axios'

import { script, scriptAction, Proxy, ProxyType, database, log, sleep, cfg, CmdError } from './../../../include.js'

import { State } from './../state.js'
import { pageConfig } from './../atomicsTypes.js'

let stealth_enabled = false
function enablePuppeteerStealth() {
        if (!stealth_enabled) {
                puppeteer_extra.use(puppeteer_steath())
                stealth_enabled = true
        }
}

// -*-*-*-*-*-*-*-*-*-*-*-*-*-*

async function setupCommonBrowser(launchArg: object) {
        return await puppeteer.launch(launchArg)
}

async function setupStealthBrowser(launchArg: object) {
        enablePuppeteerStealth()
        return await puppeteer_extra.launch(launchArg)
}

async function setupAdsBrowser(profile: database.ORM.Account, launchArg: object, adsLocalAPIHost: string) {
        let browser: puppeteer.Browser
        if (!profile) {
                throw "No profile passed"
        } else if (!profile.adsUserId) {
                throw "No ads linked to profile"
        }
        let res
        try {
                res = await axios.get('http://' + ( adsLocalAPIHost ?? "localhost" ) + ':50325/api/v1/browser/start?user_id=' + profile.adsUserId)
        } catch (e) {
                throw "Cannot connect to AdsPower Local API " + e
        }
        try {
                let puppeteerWs = <string>res.data.data.ws.puppeteer
                if (adsLocalAPIHost && adsLocalAPIHost != "") {
                        puppeteerWs = puppeteerWs.replace("127.0.0.1", <string>adsLocalAPIHost)
                }
                log.echo("Connecting to ads on", puppeteerWs)
                browser = await puppeteer.connect({
                        browserWSEndpoint: puppeteerWs,
                        ...launchArg
                })
        } catch (e) {
                throw "Cannot connect to AdsPower user " + profile.adsUserId + " browser " + (typeof e === "object" ? JSON.stringify(e, null, '\t') : e)
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
        let profile         = inputs[0]
        let adapter         = inputs[1]
        let predefinedProxy = inputs[2]
        let launchArg       = inputs[3]
        let adsLocalAPIHost = inputs[4]
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
                if (adapter) {
                        proxy = null
                } else if (predefinedProxy) {
                        if (profile.forseProxyLink) {
                                proxy = new Proxy(profile.forseProxyLink)
                        } else {
                                return new CmdError(false, "No proxy hard setup for profile id " + profile.id, "No proxy hard setup for profile id " + profile.id)
                        }
                } else if (cfg.proxy != null && cfg.proxy.length > 0) {
                        proxy = randomProxy(cfg.proxy)
                }

                let browser: puppeteer.Browser
                switch (adapter) {
                        case "Common":
                                setupCommonBrowser(launchArg)
                                break
                        case "AdsPower":
                                setupAdsBrowser(profile, launchArg, adsLocalAPIHost)
                                break
                        case "Stealth":
                                setupStealthBrowser(launchArg)
                                break
                        default:
                                return new CmdError(false, "Unknown browser adapter " + adapter, "Unknown browser adapter " + adapter)
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

                this.profile = profile
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
        configurePage,
        setupBrowser,
        assignProxy
}
