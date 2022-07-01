import { script, scriptAction } from './../../script.js'
import { database } from './../database/module-manager.js'
import { getDataByPath } from './../../utils.js'
import { extract } from './../../extractable.js'

export interface StateBase {
        account: database.ORM.Account
        actions_list: scriptAction[]
        cur_action_try: number
}

interface ICommandInput {
        position: number
        type: string
        required?: boolean
        description?: string
        path: string
}

export class CommandInput implements ICommandInput {
        position: number
        type: string
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

// type unitFunction<State extends StateBase> = (this: State, ...inputs: string[]) => Promise<void>;

export type Command<State extends StateBase> = {
        name: string
        description: string
        inputs: CommandInput[]
        // fn: unitFunction<State>
        fn: (this: State, ...inputs: string[]) => Promise<void>
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
                        if (input.type.toLowerCase() === "extractable") {
                                inputs.push(
                                        await extract(getDataByPath(this.action, input.path), this.state.account)
                                )
                        } else if (input.type.toLowerCase() === "string") {
                                inputs.push(
                                        String(
                                                getDataByPath(this.action, input.path)
                                        )
                                )
                        } else if (input.type.toLowerCase() === "number") {
                                inputs.push(
                                        Number(
                                                getDataByPath(this.action, input.path)
                                        )
                                )
                        }
                }
                return inputs
        }

        async execute() {
                await this.cmd.fn.call(this.state, ...(await this.getInputs()))
                return this.state
        }
}

export interface unitObj<State extends StateBase> {
        cmd: Command<State>
        next: string
        onError: Command<State>
        afterFn: Command<State>
}

export type UnitsList<State extends StateBase> = Array<unitObj<State>>;

export abstract class ExecutableBase<S extends StateBase> {
        protected state: S
        constructor(script: script, account: database.ORM.Account) {
                this.state = Object.create({})
                this.state.account = account
                this.state.actions_list = script.actions
                this.state.cur_action_try = 0

                // validate all commands specified in actions
        }

        abstract run(): Promise<void>
}
