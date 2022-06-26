import { union, Describe, optional, array, enums, Infer, assert, boolean, object, number, string } from 'superstruct'
import { readFileSync } from 'fs'
import * as fs from 'fs'

import { botConfigEntry, botAction } from './lib/Types.js'

const _cfg_path = './config.json'

// const pathTextConfigSign = 

const botConfigActionSign: Describe<botAction> = object({
    id: number(),
    name: string(),
    type: enums([ "Dummy", "Click", "Reload", "Type", "Goto", "Upload", "Copy", "Screenshot" ]),
    field: optional(string()),
    frame: optional(string()),
    url: optional(string()),
    saveAs: optional(string()),
    text: optional(
        union([
            string(),
            object({
    dataFrom: enums([ "Account", "Mail", "URL", "Page", "JSON_API", "ElementAttr" ]),
    dataPath: string(),
    dataURL:  optional(string()),
    dataAttribute: optional(string()),
    append:   optional(string()),
    prepend:  optional(string()),
})
        ])
    ),
    // TODO
    errorCondition: optional(
        object({
            noSelector: optional(string()),
        })
    ),
    // this mean that any error occured
    onUnreachable: optional(
        object({
            repeat: optional(boolean()),
            repeatMax: optional(number()),
            gotoAction: optional(number()),
            successExit: optional(boolean()),
            skip: optional(boolean())
        })
    ),
    after: object({
        delay: optional(number()),
        waitForSelectorIframe: optional(string()),
        waitForSelector: optional(string()),
        waitForNavigator: optional(boolean()),
        waitForTarget: optional(enums([ "page" ])),
        switchToTarget: optional(enums([ "Newest", "Previus", "Initial" ])),
    })
})

const botConfigEntrySign: Describe<botConfigEntry> = object({
    name: string(),
    day24limit: number(),
    url: string(),
    perAccountDelay: union([number(), string()]),
    usePreDefinedProxy: boolean(),
    maxExecutionTime: number(),
    browserAdapter: enums([ "AdsPower", "Common", "Stealth" ]),
    adsLocalIPHost: optional(string()),
    actions: array(botConfigActionSign),
})

const ConfigSign = object({
    headless: boolean(),

    path: object({
        storage: string(),
        log: string(),
    }),

    concurrency: number(),

    configs: array(botConfigEntrySign),

    proxy: array(
        object({
            host: string(),
            port: number(),
            auth: object({
                user: string(),
                password: string()
            })
        })
    )
})

if (!fs.existsSync(_cfg_path)) {
    let cfg: ConfigType = {
        headless: false,
        concurrency: 1,
        configs: new Array(),
        path: {
            log: './.log',
            storage: './storage'
        },
        proxy: []
    }
    fs.writeFileSync(_cfg_path, JSON.stringify(cfg, null, " ".repeat(4)))
}

type ConfigType = Infer<typeof ConfigSign>;

export function Config(): ConfigType {
    let config
    try {
        config = JSON.parse(readFileSync(_cfg_path).toString());
    } catch(e) {
        throw new Error("Config parse error: " + e);
    }

    assert(config, ConfigSign);

    return config;
}

const cfg = Config()

for (const path of Object.values(cfg.path)) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path)
    }
}

export default cfg
