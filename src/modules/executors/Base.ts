import { database } from './../database/module-manager.js'
import { script, scriptAction } from './../../Types/script.js'

export interface StateBase {
        profile: database.ORM.Account
        actions_list: scriptAction[]
        variables: Map<string, any>
        buffer: string
        cur_action_try: number
}
