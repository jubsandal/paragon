import { union, Describe, optional, array, enums, Infer, assert, boolean, object, number, string } from 'superstruct'
import puppeteer from 'puppeteer'
import { database } from './modules/database/module-manager.js'
import { retrier, sleep } from './utils.js'

export const extractableObjSign = object({
        dataFrom: enums([ "Account", "Mail", "URL", "Page", "JSON_API", "ElementAttr" ]),
        dataPath: string(),
        dataURL:  optional(string()),
        dataAttribute: optional(string()),
        append:   optional(string()),
        prepend:  optional(string()),
})

export const extractableSign = union([
        string(),
        extractableObjSign
])

export type extractableObj = Infer<typeof extractableObjSign>;
export type extractable = Infer<typeof extractableSign>;

export async function extract(text: extractable, account: database.ORM.Account, browser?: puppeteer.Browser, target_page?: puppeteer.Page) {
        let ret_text = ""
        if (typeof text === "object") {
                const typeopts = <extractableObj>text
                switch (typeopts.dataFrom) {
                        case "Account":
                                text = await account.getDataByPath(typeopts.dataPath)
                                break;
                        case "URL": // TODO move to smrtAction
                                if (typeof text != "object") {
                                        throw "No text option obj, only string passed"
                                }
                                if (!browser) {
                                        throw "No browser passed for text scraping from URL"
                                }
                                let page = await browser.newPage()
                                if (!text.dataURL) {
                                        throw "No url for text source URL passed"
                                }
                                await page.goto(text.dataURL, { waitUntil: "domcontentloaded" })
                                await sleep(100)

                                await retrier(async () => {
                                        try {
                                                let _text = await page.$eval((<extractableObj>text).dataPath, e => e.textContent)
                                                if (_text) {
                                                        ret_text = _text.trim()
                                                        return true
                                                }
                                        } catch (e) {}
                                        return false
                                }, { tries: 5, wait: 700 })
                                await page.close()
                                break
                        case "ElementAttr":
                                if (!target_page) {
                                        throw "No page passed to scrap element attribute from"
                                }
                                if (!text.dataPath) throw "No field passed to ElementAttr text option"
                                if (!text.dataAttribute) throw "No attribute passed to ElementAttr text option"
                                const _AttrName = text!.dataAttribute
                                ret_text = String(
                                        await target_page.$eval(text.dataPath,
                                                ( e, _AttrName ) => e.getAttribute(<string>_AttrName), _AttrName)
                                )
                                break
                        default:
                                throw "Not implemented accessing to data to type from data source " + typeopts.dataFrom
                }
                const __text = ret_text
                ret_text = ((<extractableObj>text).prepend ?? "") + __text + ((<extractableObj>text).append ?? "")
        } else if (typeof text === "string") {
                ret_text = text
        }

        return ret_text
}
