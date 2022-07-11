import { BrowserAction, State } from './../state.js'
import puppeteer from 'puppeteer'
import { retrier, log, sleep } from './../../../../../utils.js'
import * as fs from 'fs'
import { CommandInput } from './../../../../executors/Command.js'
import { CmdError } from './../../../../lib/Error.js'

async function captureSelector(page: puppeteer.Page, field: string, frame?: string[]) {
        let root = page
        if (frame) {
                for (const _frame of frame) {
                        let eh = await page.$(_frame)
                        // @ts-ignore
                        root = await eh!.contentFrame()
                }
        }
        return await root.waitForSelector(field, { timeout: 1000, visible: true })
}

async function Click(this: State, ...inputs: any[]) {
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
        try {
                await retrier(f)
        } catch (e) {
                return new CmdError(false, "Max tries exeed", "Max tries exeed")
        }
        return new CmdError(true)
}

async function Type(this: State, ...inputs: any[]) {
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
        try {
                await retrier(f)
        } catch (e) {
                return new CmdError(false, "Max tries exeed", "Max tries exeed")
        }

        return new CmdError(true)
}

async function Upload(this: State, ...inputs: any[]) {
        if (!fs.existsSync(inputs[3])) {
                return new CmdError(false, "Unexists", "File unexists")
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
        try {
                await retrier(f)
        } catch (e) {
                return new CmdError(false, "Max retrier exeed", "Max retrier exeed")
        }
        return new CmdError(true)
}

async function Scrap(this: State, ...inputs: string[]) {
        switch (inputs[0]) {
            case "URL":
                await this.profile.setDataByPath(
                    inputs[1],
                    await this.page.url()
                ).sync()
                break
            default:
                return new CmdError(false, "Unavalible Operation", "Unavalible Operation")
        }
        return new CmdError(true)
}

async function Goto(this: State, ...inputs: string[]) {
        try {
                await this.page.goto(inputs[0], { waitUntil: 'domcontentloaded' })
        } catch (e) {
                return new CmdError(false, "error", String(e))
        }
        return new CmdError(true)
}

async function Screenshot(this: State, ...inputs: string[]) {
        try {
        await this.page.screenshot({
                path: inputs[0] ?? "~/paragon-screenshot-" +
                        new Date().toLocaleDateString().replaceAll('/', '') + "-" + new Date().toLocaleTimeString("ru").replaceAll(":", '')
        })
        } catch (e) {
                return new CmdError(false, "error", String(e))
        }
        return new CmdError(true)
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
