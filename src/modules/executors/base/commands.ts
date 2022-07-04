import * as ss from 'superstruct'
import { Command, CommandInput } from './../adapter.js'
import cfg from './../../../config.js'
import { State } from './state.js'
import * as cmd from './atomics/index.js'

import { extractableSign } from './../../../extractable.js'

export const commands: Command<State>[] = [
        {
                name: "SetVariable",
                description: "Activating new browser instance",
                inputs: [
                        {
                                position: 0,
                                type: new ss.Struct({ type: "string", schema: null }),
                                description: "",
                                path: "name"
                        },
                        {
                                position: 1,
                                type: new ss.Struct({ type: "any", schema: null }),
                                description: "",
                                path: "value"
                        }
                ],
                fn: cmd.Dummy
        },
        {
                name: "Dummy",
                description: "Do click on current target page",
                inputs: [],
                fn: cmd.Dummy
        },

]
