import * as ss from 'superstruct'
import { Command, CommandInput } from './../Command.js'
import cfg from './../../../config.js'
import { State } from './state.js'
import * as cmd from './atomics/index.js'

import { extractableSign } from './../../../Types/extractable.js'

export const commands: Command<State>[] = [
        {
                name: "SetVariable",
                description: "Settings new variable or updating an exists",
                inputs: [
                        {
                                position: 0,
                                type: new ss.Struct({ type: "string", schema: null }),
                                description: "Variable name",
                                path: "name"
                        },
                        {
                                position: 1,
                                type: new ss.Struct({ type: "any", schema: null }),
                                description: "Variable value",
                                path: "value"
                        }
                ],
                fn: cmd.SetVariable
        },
        {
                name: "ExistsVariable",
                description: "Check for variable existance",
                inputs: [
                        {
                                position: 0,
                                type: new ss.Struct({ type: "string", schema: null }),
                                description: "Variable name",
                                path: "name"
                        }
                ],
                fn: cmd.ExistsVariable
        },
        {
                name: "RemoveVariable",
                description: "Removing variable",
                inputs: [
                        {
                                position: 0,
                                type: new ss.Struct({ type: "string", schema: null }),
                                description: "Variable name",
                                path: "name"
                        }
                ],
                fn: cmd.RemoveVariable
        },
        {
                name: "Dummy",
                description: "Do click on current target page",
                inputs: [],
                fn: cmd.Dummy
        },

]
