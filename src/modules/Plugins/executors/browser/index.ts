import { actions, StateSign } from './state.js'
import { commands } from './commands.js'
import { ExecutorPlugin } from './../../../../Types/Plugin.js'

const plugin: ExecutorPlugin = {
        name: "In browser automatization commands set plugin",
        type: "Executor",
        commands: commands,
        actions: actions,
        state: StateSign,
}

export default plugin
