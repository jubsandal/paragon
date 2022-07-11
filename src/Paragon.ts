import PluginsLoader from './modules/lib/pluginsLoader.js'
import { Plugin } from './Types/Plugin.js'
import ExecutableBuilder from './ExecutableBuilder.js'

export default class Paragon {
        // @ts-ignore
        private plugins: Plugin[]

        constructor() {
        }

        get AppliedPlugins() {
                return this.plugins
        }

        async applyPlguins() {
                let pluginsLoader = new PluginsLoader()
                this.plugins = await pluginsLoader.load()
        }
}
