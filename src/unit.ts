import { database } from './database.js'
import cfg from './config.js'
import { subscribeAction } from './Types.js'
import * as helpers from './helpers.js'
import puppeteer from 'puppeteer'
import { log, sleep, randSleep } from './utils.js'
import * as Type from './Types.js'
import * as barhelper from './lib/bar-helper.js'

/**
 * account and actions must be valid
 */
export class Unit {
    private barhelper: barhelper.WorkerBarHelper

    constructor(
        private account: database.ORM.Account,
        private actions: subscribeAction
    ) {
        let tasks = new Array<string>()
        if (this.actions.fields.email) {
            tasks.push("Entering email")
        }
        if (this.actions.fields.password) {
            tasks.push("Entering password")
        }
        for (const action of this.actions.fields.additional) {
            tasks.push(action.name)
        }
        this.barhelper = new barhelper.WorkerBarHelper(this.account, tasks)
    }

    private async smrtAction(page: puppeteer.Page, field: string, text?: string) {
        const typer = async () => {
            const selector = await page.$(field)
            if (selector) {
                if (text) {
                    await selector.type(text)
                } else {
                    await selector.click()
                }
                return true
            } else {
                return false
            }
        }

        const tryies = 3
        const waitms = 700
        for (let tryn = 0; tryn < tryies; tryn++) {
            if (await typer()) {
                return
            }
            await sleep(waitms)
        }
        throw "Cannot do smrt action on field: " + field + " at page: " + page.url()
    }

    public async exec() {
        this.barhelper.create()
        // forse fall to throw
        let proxyPool = cfg.proxy

        if (this.actions.usePreDefinedProxy && this.account.forseProxyLink) {
            proxyPool.push(this.account.forseProxyLink)
        }

        let { browser, page, proxy } = await helpers.browser.setupBrowser(proxyPool)
        try {
            await page.goto(this.actions.url, { waitUntil: "domcontentloaded" })

            await randSleep()

            if (this.actions.fields.email) {
                await this.smrtAction(page, this.actions.fields.email, this.account.auth.email.login)
            }

            await randSleep()

            if (this.actions.fields.password) {
                this.barhelper.next()
                await this.smrtAction(page, this.actions.fields.password, this.account.auth.email.password)
            }

            await randSleep()

            for (const action of this.actions.fields.additional) {
                this.barhelper.next()
                if (action.type === "Type") {
                    if (typeof action.text === "object") {
                        const typeopts = <Type.pathTextConfig>action.text
                    }
                } else if (action.type === "Click") {
                    await this.smrtAction(page, action.field)
                } else {
                    throw "Unkown action " + action.type
                }
 
                if (action.after.delay > 0) {
                    await sleep(action.after.delay)
                }
                if (action.after.waitForNavigatior) {
                    await page.waitForNavigation({waitUntil: 'networkidle0'/*, timeout: 10000*/})
                }
                if (action.after.waitForSelector) {
                    await page.waitForSelector(action.after.waitForSelector, { timeout: 30000 })
                }
            }

            // TODO user data input

            // TODO captcha

            // TODO validate email

            if (browser) {
                browser.close()
            }
            this.barhelper.done(true)
            return {
                usedProxy: proxy
            }
        }  catch (e) {
            this.barhelper.done(false)
            if (browser) {
                browser.close()
            }
            log.error(e)
            throw e
        // }  finally {
        //     if (browser) {
        //         browser.close()
        //     }
        }
    }
}
