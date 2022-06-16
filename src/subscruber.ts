import puppeteer from 'puppeteer'
// @ts-ignore
import { proxyRequest } from 'puppeteer-proxy'
import { parse } from 'ts-command-line-args'

import { database } from './database.js'
import cfg from './config.js'
import {
    sleep,
    randSleep,
    time,
    proxy as Proxy,
    log,
} from './utils.js'
import {
    importman
} from './helpers.js'

interface cmd_opts {
    import?:      string
    concurrency?: number
    config:       string
}

const argv = parse<cmd_opts>({
    import:      { type: String, alias: 'i', optional: true },
    concurrency: { type: Number, alias: 'c', optional: true },
    config:      { type: String, alias: 'C' },
})

// TEMPORARY
if (argv.import) {
    await importman.smartImport({
        path: [ argv.import ],
        delemiters: {
            account: "NL",
            data: "NL",
            trim: "No"
        },
        dataOrder: "L"
    })
}

let found = false
for (const subscribe_config of cfg.subscribe) {
    if (subscribe_config.name === argv.config) {
        found = true
        break
    }
}
