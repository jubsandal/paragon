import { PathLike } from 'fs'
import { Plugin } from './../../Types/Plugin.js'
import glob from 'glob'

class PluginsLoader {
        constructor() {
        }

        async load(): Promise<Array<Plugin>> {
                return new Promise(async (resolve) => {
                        const plugSearch = process.cwd() + "/dist/modules/Plugins/*/*/index.js"
                        let plugins: Array<Plugin> = new Array()
                        await glob(plugSearch, async (_, files) => {
                                for (const file of files) {
                                        let plugin = await import(file)
                                        console.log(file)
                                        plugins.push(plugin.default)
                                }
                                resolve(plugins)
                        })
                })
        }
}

export default PluginsLoader
