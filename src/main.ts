import { parse } from 'ts-command-line-args'

import * as barhelper from './lib/bar-helper.js'
import * as Type from './lib/Types.js'
import { Unit } from './lib/unit.js'
import { database } from './lib/database.js'
import { importman, Validator } from './lib/helpers/index.js'
import cfg from './config.js'
import { sleep, time, log } from './lib/utils.js'

interface cmd_opts {
    import?:      string
    list?:        boolean
    concurrency?: number
    config?:      string
}

const argv = parse<cmd_opts>({
    import:      { type: String,  alias: 'i', optional: true },
    concurrency: { type: Number,  alias: 'c', optional: true },
    config:      { type: String,  alias: 'C', optional: true },
    list:        { type: Boolean, alias: 'l', optional: true }
})

if (argv.list) {
    for (const config of cfg.configs) {
        console.log(config.name, "url:", config.url, "actions:", config.actions.length)
    }
    process.exit(0)
}

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

if (!argv.config) {
    log.error("No config passed")
    process.exit(1)
}

const _search = cfg.configs.filter(e => e.name == argv.config)
let selected_config: Type.botConfigEntry

if (_search.length === 0) {
    log.error("Invalid config selected:", argv.config)
    log.error("Now avalible only:")
    for (const config of cfg.configs) {
        log.error(" ::", config.name)
    }
    process.exit(-1)
} else if (_search.length > 1) {
    log.error("There are more then one configs with name", argv.config, ". Please, recheck config file")
    process.exit(-1)
} else {
    selected_config = _search[0]
}

const accounts = database.tables.accounts.documents.map(a => new database.ORM.Account(a))
let validAccounts = new Array<database.ORM.Account>()
let registredLast24h = 0
for (const account of accounts) {
    // check validity for selected config
    if (Validator.validateAccountFor(selected_config, account)) {
        let already_registred = false
        // check account for unsubscribet to current config target
        for (const subscription of account.subscriptions) {
            if (subscription.url == selected_config.url) {
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

let perAccountDelayWaiter: (arg:any)=>void

if (selected_config.perAccountDelay === "stratch") {
    // @ts-ignore
    perAccountDelayWaiter = async (arg: any) => { return await sleep(0) } // TODO day24limit/validAccounts.length ...
} else if (typeof selected_config.perAccountDelay === "number") {
    if (selected_config.perAccountDelay < 0) {
        throw "Negative per account delay setting: " + selected_config.perAccountDelay
    }
    // @ts-ignore
    perAccountDelayWaiter = async (arg: any) => { return await sleep(<number>selected_config.perAccountDelay * 60 * 1000) }
} else {
    throw "Unknown per account delay setting: " + selected_config.perAccountDelay
}

let cur = 0
let err = 0
const total = validAccounts.length
barhelper.createMainProgress(cur, total)
for (const account of validAccounts) {
    const unit = new Unit(account, selected_config)
    const startTime = new Date().getTime()
    try {
        let ret = await unit.exec()
        await account.markRegistred(selected_config.url, ret.usedProxy?.proxy ?? null)
    } catch (e) {
        err++
    }
    cur++
    const elapced = new Date().getTime() - startTime
    log.echo("Elapced:", elapced)
    barhelper.updateMainProgress(cur, total, err)
    await perAccountDelayWaiter(elapced)
}
