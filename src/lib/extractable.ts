import { union, Describe, optional, array, enums, Infer, assert, boolean, object, number, string } from 'superstruct'
import puppeteer from 'puppeteer'
import { database } from './../modules/database/module-manager.js'
import { retrier, sleep } from './../utils.js'
import * as extractors from './extractors/index.js'

const AllowedExtractionSources = [
        "Profile",
        "Mail",
        "URL",
        "Page",
        "JSON_API",
        "ElementAttr" ]

export const extractableObjSign = object({
        source: enums(AllowedExtractionSources),
        path: array(string()),
        append: optional(string()),
        prepend: optional(string()),
})

export const extractableSign = union([
        string(),
        extractableObjSign
])

export type extractableObj = Infer<typeof extractableObjSign>;
export type extractable = Infer<typeof extractableSign>;

// TODO add array and obj optional extraction
// TODO make input optionaly extendable by plugins
export async function extract(extractable: extractable, account: database.ORM.Account, browser?: puppeteer.Browser, target_page?: puppeteer.Page): Promise<any> {
        let ret
        if (typeof extractable === "object") {
                const obj = <extractableObj>extractable
                switch (obj.source) {
                        case "Profile":
                                ret = await account.getDataByPath(obj.path[0])
                                break
                        case "PageElementContent": // TODO move to smrtAction
                                let new_browser = false
                                let _browser = browser
                                let page = target_page
                                if (!target_page && extractable.path[0] != "CURRENT") { throw "No page opened" }
                                if (!browser) {
                                        new_browser = true
                                        _browser = await puppeteer.launch({})
                                }
                                page = target_page ?? await _browser!.newPage()
                                ret = await extractors.fromOpenedPage.elementTextContent(page, extractable.path[0], extractable.path[1])

                                if (new_browser) {
                                        await _browser!.close()
                                }

                                break
                        case "PageElementAttribute":
                                if (!target_page) {
                                        throw "No page passed to scrap element attribute from"
                                }
                                ret = await extractors.fromOpenedPage.elementAttr(target_page, extractable.path[0], extractable.path[1])
                                break
                        default:
                                throw "Not implemented data extract from source " + obj.source
                }

                let append
                let prepend
                if (extractable.append) {
                        append = await extract(extractable.append, account, browser, target_page)
                        ret = append + ret
                }

                if (extractable.prepend) {
                        prepend = await extract(extractable.prepend, account, browser, target_page)
                        ret = ret + prepend
                }
        } else if (typeof extractable === "string") {
                ret = extractable
        } else {
                throw "Unknown extractable " + typeof extractable
        }

        return ret
}
