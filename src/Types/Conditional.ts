import * as ss from 'superstruct'
import { CmdError } from './CmdError.js'
import { BaseInput, IBaseInputSign } from './../lib/Input.js'

export const check_base_path = "check."

export function check_path(path: string) {
        if (path[0] === '.') {
                path = path.slice(1)
        }
        return check_base_path + path
}

export type CheckFn = (cmdRet: CmdError, ...inputs: any[]) => Promise<boolean>

export interface CheckObj {
        name: string
        inputs: BaseInput[]
        fn: CheckFn
}

export const CheckFnSign = ss.func()

export const CheckObjSign = ss.object({
        name: ss.string(),
        inputs: ss.array(IBaseInputSign),
        fn: CheckFnSign
})
