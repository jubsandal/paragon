import { checkers } from './common.js'

import { CheckerPlugin } from './../../../../Types/Plugin.js'

const plugin: CheckerPlugin = {
        name: "Base chechers",
        type: "Executor",
        checkers: checkers
}

export default plugin
