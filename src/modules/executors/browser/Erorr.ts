import { CmdError, BaseCmdErrorTypes } from './../Error.js'

export type BrowserCmdErrorCodes = "selector_not_reachable" |
        BaseCmdErrorTypes

export class BrowserCmdError extends CmdError {
        constructor(msg: string) {
                super(msg, "")
        }
}
