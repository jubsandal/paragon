import { optional, array, enums,Infer, assert, boolean, object, number, string } from 'superstruct'
import { readFileSync } from 'fs'
import * as fs from 'fs'

const _cfg_path = './config.json'

const ConfigSign = object({
    headless: boolean(),

    path: object({
        storage: string(),
        log: string(),
    }),

    concurrency: number(),

    subscribe: array(
        object({
            name: string(),
            day24limit: number(),
            url: string(),
            actions: object({
                fields: object({
                    email: string(),
                    password: string(),
                    additionalClicks: array(string())
                }),
                verification: boolean(),
                verificationOptions: object({
                    imap: optional(object({ })),
                    browser: optional(object({ }))
                })
            })
        })
    ),

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
        subscribe: new Array(),
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
    let config;
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
