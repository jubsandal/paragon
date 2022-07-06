import * as ss from 'superstruct'
import { Command, CommandInput } from './../Command.js'
import cfg from './../../../config.js'
import { State } from './state.js'
import * as cmd from './atomics/index.js'

import { extractableSign } from './../../../Types/extractable.js'

export const commands: Command<State>[] = [
        {
                name: "SetupBrowser",
                description: "Activating new browser instance",
                inputs: [
                        {
                                position: 0,
                                type: new ss.Struct({ type: "any", schema: null }),
                                description: "",
                                path: "account"
                        }
                ],
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
                                type: extractableSign,
                                description: "iframe",
                                path: "iframe"
                        }
                ],
                // fn: cmd.Click
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
                                type: extractableSign,
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
                                type: extractableSign,
                                description: "file path to upload",
                                path: "selector"
                        }
                ],
                fn: cmd.Upload
        },
        {
                name: "Scrap",
                description: "Do click on current target page",
                inputs: [
                        {
                                position: 0,
                                type: extractableSign,
                                description: "page url, \"\" for use current",
                                path: "url"
                        },
                        {
                                position: 1,
                                type: extractableSign,
                                description: "selector to scrap from",
                                path: "selector"
                        },
                        {
                                position: 2,
                                type: extractableSign,
                                description: "frame from",
                                path: "iframe"

                        },
                ],
                fn: cmd.Scrap
        },
]
