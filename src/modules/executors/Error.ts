export type BaseCmdErrorTypes = "timeout" | "retries_exeed" | "unknown_error" | "paragon_timeout"

export class CmdError {
        private ok = true
        constructor(
                public readonly code?: string,
                public readonly msg?: string
        ) {
                if (msg) this.ok = false
        }

        Ok() {
                return this.ok
        }
}
