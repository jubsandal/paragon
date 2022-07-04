import { script, scriptAction } from './../../../script.js'
import { database } from './../../database/module-manager.js'
import { ExecutableBase, StateBase, UnitsList } from './../adapter.js'

const actions = [ "Dummy", "SetVariable" ]

export type BaseAction = typeof actions[number]

// COPY
export interface State extends StateBase { }
