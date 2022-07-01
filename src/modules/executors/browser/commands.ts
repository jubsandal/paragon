import { Command, CommandInput } from './../adapter.js'
import cfg from './../../../config.js'
import { State } from './executable.js'
import * as cmd from './atomics.js'

export const commands: Command<State>[] = [
        {
                name: "Click",
                description: "Do click on current target page",
                inputs: [
                        {
                                position: 0,
                                type: "string",
                                description: "selector",
                                path: "selector"
                        },
                        {
                                position: 1,
                                type: "string",
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
                                type: "string",
                                description: "selector to type in",
                                path: "selector"
                        },
                        {
                                position: 1,
                                type: "string",
                                description: "iframe",
                                path: "iframe"
                        },
                        {
                                position: 2,
                                type: "string",
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
                                type: "string",
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
                                type: "string",
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
                                type: "string",
                                description: "upload button selector",
                                path: "selector"
                        },
                        {
                                position: 1,
                                type: "string",
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
                                type: "string",
                                description: "page url, \"\" for use current",
                                path: "url"
                        },
                        {
                                position: 1,
                                type: "string",
                                description: "selector to scrap from",
                                path: "selector"
                        },
                        {
                                position: 1,
                                type: "string",
                                description: "frame from",
                                path: "iframe"

                        },
                ],
                fn: cmd.Scrap
        },
        {
                name: "Dummy",
                description: "Do click on current target page",
                inputs: [],
                fn: cmd.Dummy
        },

]
