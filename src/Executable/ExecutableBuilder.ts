import * as ss from 'superstruct'

import {
        Plugin,
        ExecutorPlugin,
        CheckerPlugin,
        DatabasePlugin
} from './../Types/Plugin.js'

import { database } from './../Database/module-manager.js'
import { script } from './../Types/script.js'
import { Executable } from './../Executable/Executable.js'

export class ExecutableBuilder {
        constructor(
                private plugins: Plugin[],
                private script: script,
                private profile: database.ORM.Account
        ) {
        }

        private async pluginsMegre() {
                let commands = [  ]
                let states = [  ]
                let actions = [  ]
                let checkers = [  ]
                for (const plugin of this.plugins) {
                        if (plugin.type === "Executor") {
                                let eplugin: ExecutorPlugin = <ExecutorPlugin>plugin
                                states.push(eplugin.state)
                                // @ts-ignore
                                commands.push(...eplugin.commands)
                                actions.push(...eplugin.actions)
                        } else if (plugin.type === "Checker") {
                                let chplugin: CheckerPlugin = <CheckerPlugin>plugin
                                // @ts-ignore
                                checkers.push(...chplugin.checkers)
                        } else if (plugin.type === "Database") {
                                // TODO
                        } else {
                                // TODO
                        }
                }

                const mergedEPlugin: ExecutorPlugin = {
                        name: "MergedEPlugin",
                        commands: commands,
                        type: "Merged",
                        actions: actions
                }

                const mergedChPlugin: CheckerPlugin = {
                        name: "MergedChPlugin",
                        type: "Merged",
                        checkers: checkers
                }

                // TODO
                const mergedDbPlugin: DatabasePlugin = {
                        name: "MergedDbPlugin",
                        type: "Merged",
                }

                return {
                        executors: mergedEPlugin,
                        checkers: mergedChPlugin,
                        database: mergedDbPlugin
                }
        }

        async build() {
                const plugins = await this.pluginsMegre()
                // @ts-ignore
                let executable = new Executable<typeof plugins.executors.state>(this.script, this.profile, plugins.executors.commands, plugins.checkers.checkers)
                return executable
        }
}
