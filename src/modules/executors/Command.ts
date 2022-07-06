import { script, scriptAction } from './../../Types/script.js'
import { CmdError } from './Error.js'
import * as ss from 'superstruct'
import { extract } from './../../Types/extractable.js'
import { StateBase } from './Base.js'
import { getDataByPath } from './../../utils.js'

interface ICommandInput {
        position: number
        type: ss.Struct<any, null>
                required?: boolean
        description?: string
        path: string
}

export class CommandInput implements ICommandInput {
        position: number
        type: ss.Struct<any, null>
                required?: boolean
        description?: string
        path: string

        constructor(obj: ICommandInput) {
                this.position = obj.position
                this.type = obj.type
                this.required = obj.required ?? false
                this.description = obj.description ?? "no description"
                this.path = obj.path
        }
}

type cmdFunction<State extends StateBase> = (this: State, ...inputs: any[]) => Promise<CmdError>;

export type Command<State extends StateBase> = {
        name: string
        description: string
        inputs: CommandInput[]
        fn: cmdFunction<State>
        // fn: (this: State, ...inputs: string[]) => Promise<void>
}

export class CommandExecutor<State extends StateBase> {
        constructor(
                private cmd: Command<State>,
                private action: scriptAction,
                private state: State
        ) {
        }

        private async getInputs() {
                let inputs = new Array()
                for (const input of this.cmd.inputs) {
                        inputs.push(
                                await extract(getDataByPath(this.action, input.path), this.state.profile)
                        )
                }
                return inputs
        }

        async execute() {
                return await this.cmd.fn.call(this.state, ...(await this.getInputs()))
        }
}

