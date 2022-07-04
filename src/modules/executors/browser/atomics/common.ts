import { BrowserAction, State } from './../state.js'
import puppeteer from 'puppeteer'
import { retrier, log, sleep } from './../../../../utils.js'
import * as fs from 'fs'
import { CommandInput } from './../../adapter.js'

async function captureSelector(page: puppeteer.Page, field: string, frame?: string) {
        let root = page
        if (frame) {
                let eh = await page.$(frame)
                // @ts-ignore
                root = await eh!.contentFrame()
        }
        return await root.waitForSelector(field, { timeout: 1000, visible: true })
}

async function Click(this: State, ...inputs: string[]) {
        const f = async () => {
                try {
                        const selector = await captureSelector(this.page, inputs[0], inputs[1])
                        if (selector) {
                                await selector.hover()
                                await selector.click()
                                return true
                        } else {
                                return false
                        }
                } catch (e) {
                        return false
                }
        }
        f.name = "Click"
        await retrier(f)
}

async function Type(this: State, ...inputs: string[]) {
        const f = async () => {
                try {
                        const selector = await captureSelector(this.page, inputs[0], inputs[1])
                        if (selector) {
                                try {
                                        // @ts-ignore
                                        await this.state.target_page.evaluate((_field) => document.querySelector(_field)!.value = '', field)
                                } catch (e) {
                                        log.echo("Non critical: Cannot erace input field:", e, inputs[0])
                                }
                                await selector.type(inputs[3])
                                return true
                        } else {
                                return false
                        }
                } catch (e) {
                        return false
                }
        }
        f.name = "Type"
        await retrier(f)
}

async function Upload(this: State, ...inputs: string[]) {
        if (!fs.existsSync(inputs[3])) {
                throw "Cannot upload unexists file: " + inputs[3]
        }
        const f = async () => {
                try {
                        const selector = await captureSelector(this.page, inputs[0], inputs[1])
                        if (selector) {
                                const [fileChooser] = await Promise.all([
                                        this.page.waitForFileChooser(),
                                        await selector.click()
                                ]);
                                // @ts-ignore
                                await fileChooser.accept([inputs[3]])
                                return true
                        } else {
                                return false
                        }
                } catch (e) {
                        return false
                }
        }
        f.name = "Upload"
        await retrier(f)
}

async function Scrap(this: State, ...inputs: string[]) {
        switch (inputs[0]) {
            case "URL":
                await this.account.setDataByPath(
                    inputs[1],
                    await this.page.url()
                ).sync()
                break
            default:
                throw "No such copy field: " + inputs[0]
        }
}

async function Goto(this: State, ...inputs: string[]) {
        await this.page.goto(inputs[0], { waitUntil: 'domcontentloaded' })
}

async function Screenshot(this: State, ...inputs: string[]) {
        await this.page.screenshot({
                path: inputs[0] ?? "~/paragon-screenshot-" +
                        new Date().toLocaleDateString().replaceAll('/', '') + "-" + new Date().toLocaleTimeString("ru").replaceAll(":", '')
        })
}

async function Dummy() { }

export {
        Goto,
        Screenshot,
        Click,
        Type,
        Scrap,
        Upload,
        Dummy
}
