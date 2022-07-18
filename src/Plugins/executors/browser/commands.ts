import * as ss from 'superstruct'
import { State } from './state.js'
import * as cmd from './atomics/index.js'

import { cfg, Command, CommandInput, extractableSign } from './../../include.js'

export const commands: Command<State>[] = [
        {
                name: "SetupBrowser",
                description: "Activating new browser instance",
                inputs: [
                        {
                                position: 0,
                                type: new ss.Struct({ type: "any", schema: null }),
                                description: "",
                                path: "$profile"
                        },
                        {
                                position: 1,
                                type: new ss.Struct({ type: "string", schema: null }),
                                description: "browser adapter",
                                path: "adapter"
                        },
                        {
                                position: 2,
                                type: new ss.Struct({ type: "boolean", schema: null }),
                                optional: true,
                                description: "",
                                path: "predefinedProxy"
                        },
                        {
                                position: 3,
                                type: new ss.Struct({ type: "any", schema: null }),
                                optional: true,
                                description: "",
                                path: "launchArg"
                        },
                        {
                                position: 4,
                                type: new ss.Struct({ type: "string", schema: null }),
                                optional: true,
                                description: "",
                                path: "adsLocalAPIHost"
                        },
                ],
                returnValue: ss.never(),
                fn: cmd.setupBrowser
        },

        {
                name: "Click",
                description: "Do click on current target page",
                inputs: [
                        {
                                position: 0,
                                type: extractableSign,
                                description: "selector",
                                path: "selector"
                        },
                        {
                                position: 1,
                                type: ss.array(extractableSign),
                                description: "iframe",
                                path: "iframe"
                        }
                ],
                returnValue: ss.never(),
                fn: cmd.Click
        },
        {
                name: "Type",
                description: "Do type on current target in specific",
                inputs: [
                        {
                                position: 0,
                                type: extractableSign,
                                description: "selector to type in",
                                path: "selector"
                        },
                        {
                                position: 1,
                                type: ss.array(extractableSign),
                                description: "iframe",
                                path: "iframe"
                        },
                        {
                                position: 2,
                                type: extractableSign,
                                description: "text to type",
                                path: "inputText"
                        },
                ],
                returnValue: ss.never(),
                fn: cmd.Type
        },
        {
                name: "Goto",
                description: "Do click on current target page",
                inputs: [
                        {
                                position: 0,
                                type: extractableSign,
                                description: "url",
                                path: "url"
                        }
                ],
                returnValue: ss.never(),
                fn: cmd.Goto
        },
        {
                name: "Screenshot",
                description: "Do click on current target page",
                inputs: [
                        {
                                position: 0,
                                type: extractableSign,
                                description: "output path",
                                path: "outputPath"
                        }
                ],
                returnValue: ss.never(),
                fn: cmd.Screenshot
        },
        {
                name: "Upload",
                description: "Do click on current target page",
                inputs: [
                        {
                                position: 0,
                                type: extractableSign,
                                description: "upload button selector",
                                path: "selector"
                        },
                        {
                                position: 1,
                                type: ss.array(extractableSign),
                                description: "frame from",
                                path: "iframe"

                        },
                        {
                                position: 2,
                                type: extractableSign,
                                description: "file path to upload",
                                path: "selector"
                        }
                ],
                returnValue: ss.never(),
                fn: cmd.Upload
        },
        {
                name: "Scrap",
                description: "Do click on current target page",
                inputs: [
                        {
                                position: 0,
                                type: extractableSign,
                                description: "source to scrap from",
                                path: "source"
                        },
                        {
                                position: 1,
                                type: extractableSign,
                                description: "page url, \"\" for use current",
                                path: "url"
                        },
                        {
                                position: 2,
                                type: extractableSign,
                                description: "selector to scrap from",
                                path: "selector"
                        },
                        {
                                position: 3,
                                type: ss.array(extractableSign),
                                description: "frame from",
                                path: "iframe"

                        },
                ],
                returnValue: ss.never(),
                fn: cmd.Scrap
        },
]
