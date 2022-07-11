import { script, scriptAction } from './../../../../Types/script.js'
import { StateBase, StateBaseSign } from './../../../executors/Base.js'
import { database } from './../../../database/module-manager.js'

export const actions = [
        "Dummy",
        "SetVariable",
        "RemoveVariable",
        "ExistsVariable",

        // TODO
        "Sleep",
]

export type BaseActions = typeof actions[number]

export interface State extends StateBase { }
export const StateSign = StateBaseSign
