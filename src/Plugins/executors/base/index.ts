import { actions, StateSign } from './state.js'
import { commands } from './commands.js'

import { ExecutorPlugin } from './../../include.js'

const plugin: ExecutorPlugin = {
        name: "Base commands",
        type: "Executor",
        commands: commands,
        actions: actions,
        state: StateSign,
}

export default plugin
