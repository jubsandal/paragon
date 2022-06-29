import { union, Describe, optional, array, enums, Infer, assert, boolean, object, number, string } from 'superstruct'

export const scriptActionSign = object({
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
                        skip: optional(boolean()),
                        secondChanse: optional(
                                object({
                                        repeat: optional(boolean()),
                                        repeatMax: optional(number()),
                                        gotoAction: optional(number()),
                                        successExit: optional(boolean()),
                                        skip: optional(boolean()),
                                })
                        )
                })
        ),
        after: object({
                delay: optional(number()),
                waitForSelectorIframe: optional(string()),
                waitForSelector: optional(string()),
                waitForNavigator: optional(boolean()),
                waitForTarget: optional(enums([ "page" ])),
                switchToTarget: optional(enums([ "Newest", "Previus", "Initial" ])),
                switchToTargetOpts: optional(
                        object({
                                viewPort: optional(
                                        object({
                                                height: number(),
                                                width: number()
                                        })
                                )
                        })
                )
        })
})

export const scriptSign = object({
        name: string(),
        day24limit: number(),
        url: string(),
        perAccountDelay: union([number(), string()]),
        usePreDefinedProxy: boolean(),
        maxExecutionTime: number(),
        browserAdapter: enums([ "AdsPower", "Common", "Stealth" ]),
        adsLocalIPHost: optional(string()),
        actions: array(scriptActionSign),
})

export type script = Infer<typeof scriptSign>;
export type scriptAction = Infer<typeof scriptActionSign>;
