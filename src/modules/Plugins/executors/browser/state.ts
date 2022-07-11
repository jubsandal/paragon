import puppeteer from 'puppeteer'
import { script, scriptAction } from './../../../../Types/script.js'
import { database } from './../../../database/module-manager.js'
import { StateBase } from './../../../executors/Base.js'
import * as browserSetuper from './atomics/index.js'
import { Proxy, ProxyTypeSign } from './../../../../Types/proxy.js'

import * as ss from 'superstruct'

export const actions = [
        "Click",
        "Reload",
        "Type",
        "Goto",
        "Upload",
        "Scrap",
        "Screenshot",
        // TODO
        "WaitForSelector",
        "WaitForNavigator",
        "WaitForRedirection",
        "WaitForNewTarget"
]

export type BrowserAction = typeof actions[number]

export interface State extends StateBase {
        proxy: Proxy | null
        page: puppeteer.Page
        browser: puppeteer.Browser
        initial_page: puppeteer.Page
        previus_page?: puppeteer.Page
}

export const StateSign = ss.object({
        proxy: ProxyTypeSign,
        page: ss.any(),
        browser: ss.any(),
        initial_page: ss.any(),
        previus_page: ss.optional(ss.any())
})
