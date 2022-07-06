import { record, unknown, assign, union, Describe, optional, array, enums, Infer, assert, boolean, object, number, string } from 'superstruct'

export const scriptActionSign = assign(
        object({
                entryPoint: optional(boolean()),
                next: optional(number()),
                id: number(),
                command: string(),
                description: optional(string()),
        }),
        object({})
)

export const scriptSign = object({
        // identifier to assign to
        name: string(),
        // profiles to pass in script unknown for manual
        targetProfileGroup: optional(string()),
        // profiles execute count limitation
        day24limit: number(),
        // delay between pass profiles to script executor
        perAccountDelay: union([number(), string()]),
        // triger for sort profiles by proxy pre defenition, undefined for false
        usePreDefinedProxy: optional(boolean()),
        // timeout trigger
        maxExecutionTime: number(),
        // reusable procedures, identified by less then zero id
        procedures: record(string(), array(scriptActionSign)),
        // script actions, identified by grand then zero or eq to zero id
        actions: array(scriptActionSign),
        // browser type to use, undefined for Common
        browserAdapter: optional(
                enums([ "AdsPower", "Common", "Stealth" ])
        ),
        // AdsPower local API link, undefined for localhost
        adsLocalIPHost: optional(string()),
})

export type script = Infer<typeof scriptSign>;
export type scriptAction = Infer<typeof scriptActionSign>;
