// TODO move to types
export type BaseCmdErrorTypes = "timeout" | "retries_exeed" | "unknown_error" | "paragon_timeout"

export class CmdError {
        constructor(
                public ok: boolean = false,
                public readonly returnValue?: any,
                public readonly msg?: string
        ) {
        }

        Ok() {
                return this.ok
        }
}
