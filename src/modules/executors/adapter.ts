import * as ss from 'superstruct'
import { script, scriptAction } from './../../script.js'
import { database } from './../database/module-manager.js'
import { timeoutPromise, getDataByPath } from './../../utils.js'
import { extract } from './../../extractable.js'

export interface StateBase {
        account: database.ORM.Account
        actions_list: scriptAction[]
        cur_action_try: number
        variables: Map<string, any>
        buffer: string
}

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

type cmdFunction<State extends StateBase> = (this: State, ...inputs: any[]) => Promise<void>;

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
                                await extract(getDataByPath(this.action, input.path), this.state.account)
                        )
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

export class ExecutableBase<S extends StateBase> {
        protected state: S
        protected cur_action: scriptAction

        constructor(
                private script: script,
                account: database.ORM.Account,
                private commandSet: Command<S>[]
        ) {
                this.state = Object.create({})
                this.state.account = account
                this.state.actions_list = script.actions
                this.state.cur_action_try = 0

                let ep = this.script.actions.find(a => a.entryPoint)
                if (!ep) {
                        throw "No entry point in script"
                }
                this.cur_action = ep

                // validate all commands specified in actions
        }

        private findCommand(name: string) {
                const cmd = this.commandSet.find(cmd => cmd.name == name)
                // this check must do a validator on startup
                if (!cmd) {
                        throw "No such command: " + name
                }
                return cmd
        }

        private async executeAction(action: scriptAction) {
                const cmd = this.findCommand(action.command)
                let exec = await new CommandExecutor<S>(cmd, action, this.state)
        }

        private async _run(): Promise<void> {
                do {
                        let next: number | null = null
                        try {
                                await this.executeAction(this.cur_action)
                                if (this.cur_action.next) {
                                        next = this.cur_action.next
                                }               
                        } catch (e) {
                        }

                        if (next) {
                                let next_action = this.script.actions.find(a => a.id === next)
                                if (!next_action) {
                                        throw "Invalid redirection from action id: " + this.cur_action.id + " to action " +  next
                                }
                                this.cur_action = next_action
                        } else {
                                break
                        }
                } while (true)
        }

        async run(): Promise<void> {
                return await Promise.race([
                        this._run(),
                        timeoutPromise(this.script.maxExecutionTime)
                ])
        }
}
