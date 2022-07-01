import puppeteer from 'puppeteer'
import { script, scriptAction } from './../../../script.js'
import { database } from './../../database/module-manager.js'
import { ExecutableBase, StateBase, UnitsList } from './../adapter.js'
import * as browserSetuper from './browserSetupers.js'
import { Proxy } from './../../../proxy.js'

const actions = [ "Dummy", "Click", "Reload", "Type", "Goto", "Upload", "Scrap", "Screenshot" ]

export type BrowserAction = typeof actions[number]

export interface State extends StateBase {
        proxy: Proxy | null
        page: puppeteer.Page
        browser: puppeteer.Browser
        initial_page: puppeteer.Page
        previus_page?: puppeteer.Page
}

class Executable extends ExecutableBase<State> {
        constructor(private script: script, account: database.ORM.Account) {
                super(script, account)
        }

        private async init() {
                let { page, browser, proxy } = await browserSetuper.setupBrowser(this.state.account, this.script)
                browserSetuper.configurePage(page, {
                        viewPort: {
                                height: 1920,
                                width: 1080
                        }
                })

                this.state.page = page
                this.state.initial_page = page
                this.state.browser = browser
                this.state.proxy = proxy
        }

        async run() {
                await this.init()


        }
}
