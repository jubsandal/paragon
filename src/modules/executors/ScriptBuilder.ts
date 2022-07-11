import { script, scriptAction } from './../../Types/script.js'
import { StateBase } from './Base.js'
import glob from 'glob'

type Modify<T, R> = Omit<T, keyof R> & R

export class Builder {
        constructor(
                private script: script,
                private states: StateBase[]
        ) {

        }

        private async applyPlugins(pluginsDir: string) {
                let plugins: Record<string, any> = await import(pluginsDir+'/*')
        }

        private buildState() {
                let state = {}
                for (const _state of this.states) {
                        let __state = {
                                ...state,
                                ..._state
                        }
                        state = __state
                }
                return this.states
        }

        private megreCommands() {

        }

        private megreCheckers() {

        }

        async build() {
                let state = this.buildState()
        }
}
