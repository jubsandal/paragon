import puppeteer from 'puppeteer'
import { database } from './../../../modules/database/module-manager.js'
import { retrier, sleep } from './../../../utils.js'
import { extractableObj } from './../../extractable.js'

export module fromOpenedPage {
    export async function elementAttr(page: puppeteer.Page, element: string, attrName: string) {
        let ret: any
        ret = await page.$eval(element,
            ( e, attrName ) => {
                e.getAttribute(<string>attrName)
            }, attrName)
        return ret
    }

    export async function elementTextContent(page: puppeteer.Page, url: string, element: string) {
        let ret: any
        if (url === "CURRENT") {
            await page.goto(url, { waitUntil: "domcontentloaded" })
        }
        await sleep(100)

        let f = async () => {
            try {
                let _text = await page.$eval(element, e => e.textContent)
                if (_text) {
                    ret = _text.trim()
                    return true
                }
            } catch (e) {}
            return false
        }
        await retrier(f, { tries: 5, wait: 700 })
        if (url !== "CURRENT") {
            await page.close()
        }
        return ret
    }
}

export module fromStaticPage {

}
