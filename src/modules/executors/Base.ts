// TODO move to types
import { database } from './../database/module-manager.js'
import { script, scriptAction } from './../../Types/script.js'
import * as ss from 'superstruct'
import { scriptActionSign } from './../../Types/script.js'

export interface StateBase {
        profile: database.ORM.Account
        actions_list: scriptAction[]
        variables: Map<string, any>
        buffer: string
        cur_action_try: number
}

export const StateBaseSign = ss.object({
        profile: ss.any(),
        actions_list: ss.array(scriptActionSign),
        variables: ss.map(ss.string(), ss.any()),
        buffer: ss.string(),
        cur_action_try: ss.number()
})
