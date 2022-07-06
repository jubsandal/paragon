import { script, scriptAction } from './../../../Types/script.js'
import { StateBase } from './../Base.js'
import { database } from './../../database/module-manager.js'
import { ExecutableBase, UnitsList } from './../Executable.js'

const actions = [
        "Dummy",
        "SetVariable",
        "RemoveVariable",
        "ExistsVariable"
]

export type BaseActions = typeof actions[number]

// COPY
export interface State extends StateBase { }
