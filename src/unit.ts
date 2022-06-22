import puppeteer from 'puppeteer'

import { database } from './database.js'
import cfg from './config.js'
import { botConfigEntry } from './Types.js'
import * as helpers from './helpers.js'
import { log, sleep, randSleep } from './utils.js'
import * as Type from './Types.js'
import * as barhelper from './lib/bar-helper.js'

/**
 * account and actions must be valid
 */
// TODO redo with middlevare advanced logging and message delivery
export class Unit {
    private barhelper: barhelper.WorkerBarHelper

    constructor(
        private account: database.ORM.Account,
        private actions: botConfigEntry
    ) {
        this.barhelper =
            new barhelper.WorkerBarHelper(this.account, this.actions.actions.map(a => a.name))
    }

    private async smrtAction(page: puppeteer.Page, field: string, action: Type.botActionType, string?: string) {
        const typer = async () => {
            try {
                const selector = await page.waitForSelector(field, { timeout: waitms })
                console.log("TRY")
                if (selector) {
                    switch (action) {
                        case "Click":
                            await selector.click()
                            break;
                        case "Type":
                            // @ts-ignore
                            await selector.type(string)
                            break;
                        case "Upload":
                            // @ts-ignore
                            await selector.uploadFile(string)
                            break;
                        default:
                            throw 1
                    }
                    return true
                } else {
                    throw 0
                }
            } catch (e) {
                if (e) {
                    throw "No must have parameter passed"
                }
                return false
            }
            return true
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

    private async finalizeAction(page: puppeteer.Page, action: Type.botAction) {
        if (action.after.delay && action.after.delay > 0) {
            await sleep(action.after.delay)
        }
        if (action.after.waitForNavigatior) {
            await page.waitForNavigation({waitUntil: 'networkidle2'/*, timeout: 10000*/})
        }
        if (action.after.waitForSelector) {
            await page.waitForSelector(action.after.waitForSelector, { timeout: 30000 })
        }
    }

    private async deserializeText(action: Type.botAction) {
        let text
        if (typeof action.text === "object") {
            const typeopts = <Type.pathTextConfig>action.text
            switch (typeopts.dataFrom) {
                case "Account":
                    text = await this.account.getDataByPath(typeopts.dataPath)
                    break;
                default:
                    throw "Not implemented accessing to data to type from data source " + typeopts.dataFrom
            }
        } else if (typeof action.text === "string") {
            text = action.text
        }

        return text
    }

    private async doType(page: puppeteer.Page, action: Type.botAction) {
        const text = await this.deserializeText(action)
        if (!action.field) throw "No field for action: " + action.name
        if (!text || text === "") throw "No text for action " + action.name
        await this.smrtAction(page, action.field, "Type", text)
    }

    private async doClick(page: puppeteer.Page, action: Type.botAction) {
        if (!action.field) throw "No field for action: " + action.name
        await this.smrtAction(page, action.field, "Click")
    }

    private async doGoto(page: puppeteer.Page, action: Type.botAction) {
        if (!action.url) throw "No url path for action: " + action.name
        await page.goto(action.url)
    }

    private async doUpload(page: puppeteer.Page, action: Type.botAction) {
        const text = await this.deserializeText(action)
        if (!action.text) throw "No url path for action: " + action.name
        if (!action.field) throw "No field for action: " + action.name
        await this.smrtAction(page, action.field, "Upload", text)
    }

    public async exec() {
        this.barhelper.create()
        let proxyPool = cfg.proxy

        if (this.actions.usePreDefinedProxy && this.account.forseProxyLink) {
            proxyPool.push(this.account.forseProxyLink)
        }

        // forse fall to throw on setup error
        let { browser, page, proxy } = await helpers.browser.setupBrowser(proxyPool)

        let curAction
        try {
            for (const action of this.actions.actions) {
                curAction = action
                this.barhelper.next()
                switch (action.type) {
                    case "Type":
                        await this.doType(page, action)
                        break
                    case "Click":
                        await this.doClick(page, action)
                        break
                    case "Goto":
                        await this.doGoto(page, action)
                        break
                    case "Upload":
                        await this.doUpload(page, action)
                        break
                    default:
                        throw "Unkown action " + action.type
                }

                await this.finalizeAction(page, action)
            }

            this.barhelper.done(true)
        }  catch (e) {
            this.barhelper.done(false)
            log.error("Action", curAction, "error:", e)
        }//  finally {
            if (browser) { browser.close() }
            return {
                usedProxy: proxy
            }
        //}
    }
}
