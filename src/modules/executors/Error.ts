export type BaseCmdErrorTypes = "timeout" | "retries_exeed" | "unknown_error" | "paragon_timeout"

export class BaseCmdError extends Error {
        constructor(msg: string, public code: number) {
                super(msg)
        }
}
