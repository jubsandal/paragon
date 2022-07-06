import puppeteer from 'puppeteer'
import { script, scriptAction } from './../../../Types/script.js'
import { database } from './../../database/module-manager.js'
import { StateBase } from './../Base.js'
import { ExecutableBase, UnitsList } from './../Executable.js'
import * as browserSetuper from './atomics/index.js'
import { Proxy } from './../../../Types/proxy.js'

const actions = [ "Dummy", "Click", "Reload", "Type", "Goto", "Upload", "Scrap", "Screenshot" ]

export type BrowserAction = typeof actions[number]

export interface State extends StateBase {
        proxy: Proxy | null
        page: puppeteer.Page
        browser: puppeteer.Browser
        initial_page: puppeteer.Page
        previus_page?: puppeteer.Page
}
