import { union, Describe, optional, array, enums, Infer, assert, boolean, object, number, string } from 'superstruct'
import puppeteer from 'puppeteer'
import { database } from './../modules/database/module-manager.js'
import { retrier, sleep } from './../utils.js'

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
export async function extract(extractable: extractable, account: database.ORM.Account, browser?: puppeteer.Browser, target_page?: puppeteer.Page): Promise<any> {
        let ret
        if (typeof extractable === "object") {
                const obj = <extractableObj>extractable
                switch (obj.source) {
                        case "Profile":
                                ret = await account.getDataByPath(obj.path[0])
                                break;
                        case "URL": // TODO move to smrtAction
                                let new_browser = false
                                let _browser = browser
                                if (!browser) {
                                        new_browser = true
                                        _browser = await puppeteer.launch({})
                                }
                                let page = await _browser!.newPage()
                                if (!extractable.path) {
                                        throw "No url for text source URL passed"
                                }
                                await page.goto(extractable.path[0], { waitUntil: "domcontentloaded" })
                                await sleep(100)

                                let f = async () => {
                                        try {
                                                let _text = await page.$eval((<extractableObj>extractable).path[1], e => e.textContent)
                                                if (_text) {
                                                        ret = _text.trim()
                                                        return true
                                                }
                                        } catch (e) {}
                                        return false
                                }
                                await retrier(f, { tries: 5, wait: 700 })
                                await page.close()

                                if (new_browser) {
                                        await _browser!.close()
                                }

                                break
                        case "ElementAttr":
                                if (!target_page) {
                                        throw "No page passed to scrap element attribute from"
                                }
                                if (!extractable.path[0]) throw "No field passed to ElementAttr text option"
                                if (!extractable.path[1]) throw "No attribute passed to ElementAttr text option"
                                const _AttrName = extractable.path[1]
                                ret = await target_page.$eval(extractable.path[0],
                                        ( e, _AttrName ) => e.getAttribute(<string>_AttrName), _AttrName)
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
