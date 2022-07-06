import { database } from './../database/module-manager.js'
import { script, scriptAction } from './../../Types/script.js'

export interface StateBase {
        profile: database.ORM.Account
        actions_list: scriptAction[]
        cur_action_try: number
        variables: Map<string, any>
        buffer: string
}
