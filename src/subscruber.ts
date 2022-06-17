import puppeteer from 'puppeteer'
// @ts-ignore
import { proxyRequest } from 'puppeteer-proxy'
import { parse } from 'ts-command-line-args'
import progress from 'progress'

import * as barhelper from './lib/bar-helper.js'
import { Unit } from './unit.js'
import { database } from './database.js'
import { importman, Validator } from './helpers.js'
import cfg from './config.js'
import {
    sleep,
    randSleep,
    time,
    proxy as Proxy,
    log,
} from './utils.js'

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
    log.echo("Importing accounts from pathes:", argv.import)
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

let selected_config
for (const subscribe_config of cfg.subscribe) {
    if (subscribe_config.name === argv.config) {
        selected_config = subscribe_config
        break
    }
}

if (!selected_config) {
    console.error("Invalid config selected:", argv.config)
    console.error("Now avalible only:")
    for (const config of cfg.subscribe) {
        console.error(" ::", config.name)
    }
    process.exit(-1)
}

const accounts = database.tables.accounts.documents.map(a => new database.ORM.Account(a))
let validAccounts = new Array<database.ORM.Account>()
let registredLast24h = 0
for (const account of accounts) {
    // check validity for selected config
    if (Validator.validateAccountFor(selected_config.action, account)) {
        let already_registred = false
        // check account for unsubscribet to current config target
        for (const subscription of account.subscriptions) {
            if (subscription.url == selected_config.action.url) {
                already_registred = true
                if (new Date().getTime() - subscription.registrationTime <= time.rawMS({ hour: 24 })) {
                    registredLast24h++
                }
                break
            }
        }
        if (!already_registred) {
            validAccounts.push(account)
        }
    }
}

console.log("registred:",registredLast24h)
if (selected_config.day24limit > 0) {
    const remaining = selected_config.day24limit - registredLast24h
    if (remaining > 0) {
        validAccounts.splice(remaining)
    } else {
        validAccounts = []
    }
}

log.echo("Valid accounts for config:", validAccounts.length)

let cur = 0
let err = 0
const total = validAccounts.length
barhelper.createMainProgress(cur, total)
for (const account of validAccounts) {
    const unit = new Unit(account, selected_config.action)
    try {
        let ret = await unit.exec()
        await account.markRegistred(selected_config.action.url, ret.usedProxy?.proxy ?? null)
    } catch (e) {
        err++
        log.error("Account", account.auth.email.login, "Error:", e)
    }
    cur++
    barhelper.updateMainProgress(cur, total, err)
    await sleep(selected_config.action.delay * 60 * 1000)
}
