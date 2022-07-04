import { BaseCmdError, BaseCmdErrorTypes } from './../Error.js'

export type BrowserCmdErrorCodes = "selector_not_reachable" |
        BaseCmdErrorTypes

export class BrowserCmdError extends BaseCmdError {
        constructor(msg: string, code: number) {
                super(msg, code)
        }
}
