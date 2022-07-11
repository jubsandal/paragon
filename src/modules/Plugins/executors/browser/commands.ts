import * as ss from 'superstruct'
import cfg from './../../../../config.js'
import { State } from './state.js'
import * as cmd from './atomics/index.js'

import { Command, CommandInput } from './../../../executors/Command.js'

import { extractableSign } from './../../../../Types/extractable.js'

// TODO add register function to add commands from plugins

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
                                type: extractableSign,
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
                returnValue: ss.never(),
                fn: cmd.Scrap
        },
]
