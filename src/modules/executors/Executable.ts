import * as ss from 'superstruct'
import { script, scriptAction } from './../../Types/script.js'
import { database } from './../database/module-manager.js'
import { timeoutPromise, getDataByPath } from './../../utils.js'
import { extract } from './../../Types/extractable.js'
import { Command, CommandExecutor } from './Command.js'
import { StateBase } from './Base.js'

export interface unitObj<State extends StateBase> {
        cmd: Command<State>
        next: string
        conditional: {
                then: Command<State>
                else: Command<State>
        }
        finally: Command<State>
}

export type UnitsList<State extends StateBase> = Array<unitObj<State>>;

export class ExecutableBase<S extends StateBase> {
        protected state: S
        protected cur_action: scriptAction

        constructor(
                private script: script,
                profile: database.ORM.Account,
                private commandSet: Command<S>[]
        ) {
                this.state = Object.create({})
                this.state.profile = profile
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
                return await exec.execute()
        }

        private async _run(): Promise<void> {
                do {
                        let next: string | number | null = null
                        try {
                                await this.executeAction(this.cur_action)
                                if (this.cur_action.next) {
                                        next = this.cur_action.next
                                }               
                        } catch (e) {
                                throw "Fatal command execution error: " + e
                        }

                        if (next) {
                                if (typeof next === 'number') {
                                        let next_action = this.script.actions.find(a => a.id === next)
                                        if (!next_action) {
                                                throw "Invalid redirection from action id: " + this.cur_action.id + " to action " +  next
                                        }
                                        this.cur_action = next_action
                                } else if (typeof next === 'string'){
                                        let next_action = this.script.procedures[next][0]
                                        this._run()
                                }
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
