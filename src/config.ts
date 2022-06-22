import { union, Describe, optional, array, enums, Infer, assert, boolean, object, number, string } from 'superstruct'
import { readFileSync } from 'fs'
import * as fs from 'fs'

import { botConfigEntry } from './Types.js'

const _cfg_path = './config.json'

const botConfigEntrySign: Describe<botConfigEntry> = object({
    name: string(),
    day24limit: number(),
    url: string(),
    perAccountDelay: union([number(), string()]),
    usePreDefinedProxy: boolean(),
    actions: array(
        object({
            id: number(),
            name: string(),
            type: enums([ "Click", "Type", "Goto", "Upload", "Screenshot" ]),
            field: optional(string()),
            url: optional(string()),
            text: optional(
                union([
                    string(),
                    object({
                        dataFrom: enums([ "Account", "Mail", "URL", "Page", "JSON_API" ]),
                        dataPath: string()
                    })
                ])
            ),
            after: object({
                delay: optional(number()),
                waitForSelector: optional(string()),
                waitForNavigator: optional(boolean()),
            })
        })
    ),
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
