import { any, func, record, unknown, assign, union, Describe, optional, array, enums, Infer, assert, boolean, object, number, string } from 'superstruct'
import * as fs from 'fs'
import cfg from './../config.js'
import path from "path"

export const scriptActionNextSign = union([number(), string()])

// extendable by cmd plugins inputs parameter
// TODO add profile schema
export const scriptActionSign = union([
        object({
                // access
                id: number(),
                // for logging
                description: optional(string()),
                // entry point
                entryPoint: optional(boolean()),
                // next action or procedure if conditional undefined
                next: optional(scriptActionNextSign),
                command: string(), // command to be executed
                conditional: optional(
                        // if else emulation.
                        // next action will be executed on first TRUE return from checkFn
                        // checkFn - string to one of plugged in check functions
                        // full execution process will be terminated if no one will return TRUE
                        array(
                                // extendable for custom inputs
                                assign(
                                        object({
                                                checkFn: string(),
                                                next: scriptActionNextSign
                                        }),
                                        object({})
                                )
                        )
                )
        }),
        any()
])

// procedure name: actions array
// actions id must be not intercept other ids
export const scriptProcedureSign = record(string(), array(scriptActionSign))

// AdsPower - will be use an running AdsPower API instance to open browser and pass control to paragon
// Common - will open preinstalled chroium browser instance or browser passed in script
// Stealth - will open an Common instance but use stealth pluggin
export const scriptBrowserAdaptersSign = enums([ "AdsPower", "Common", "Stealth" ])

// TODO move all browser options to inputs of browser plugin;
// browser options added here at moment where browser automatization was be the main purpose of this program
export const scriptSign = object({
        // identifier to assign to
        name: string(),

        // triger for sort profiles by proxy pre defenition, undefined for false
        usePreDefinedProxy: optional(boolean()),

        // timeout trigger
        maxExecutionTime: number(),

        // reusable procedures, identified by name
        procedures: scriptProcedureSign,

        // script actions
        actions: array(scriptActionSign),

        // finally procedure
        finally: optional(string()),

        // browser type to use, undefined for Common
        browserAdapter: optional(scriptBrowserAdaptersSign),

        // browser launch settings
        browserLaunch: optional(
                object({
                        Viewport: object({
                                deviceScaleFactor: optional(number()),
                                width: number(),
                                height: number()
                        }),
                        args: array(string()),
                        headless: optional(boolean()),
                        userDataDir: optional(string()),
                        executablePath: optional(string()),
                        waitForInitialPage: optional(boolean()),
                })
        ),

        // TODO add optional headers, userAgent and other options...

        // AdsPower local API link, undefined for localhost
        adsLocalAPIHost: optional(string()),
})

export type script = Infer<typeof scriptSign>;
export type scriptAction = Infer<typeof scriptActionSign>;

export function readScript(file: string): script {
        return JSON.parse(fs.readFileSync(cfg.path.scripts + path.delimiter + file).toString())
}

export function saveScript(file: string, script: script) {
        fs.writeFileSync(cfg.path.scripts + path.delimiter + file, JSON.stringify(script))
}
