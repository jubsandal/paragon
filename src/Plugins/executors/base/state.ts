import { database, script, scriptAction, StateBase, StateBaseSign } from './../../include.js'

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
