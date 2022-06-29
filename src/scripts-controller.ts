import { script, scriptAction } from './script.js'
// import { CommandBase } from './command.js'
import cfg from './config.js'

// export class ScriptsListCmd {
//         static description = "Show all scripts list"
//         async run() {

//         }
// }

export class ScriptsController {
        constructor() {

        }

        private findScript(name: string) {
                let filter = cfg.scripts.filter(e => e.name === name)
                if (filter.length > 0) {
                        return filter[0]
                } else {
                        return null
                }
        }

        scriptsList() {
                return cfg.scripts.map(e => e.name)
        }

        buildScript(name: string) {
                name
        }

        executeScript(name: string) {
                name
        }
}
