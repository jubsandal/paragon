import { script, scriptAction } from './../../Types/script.js'
import { StateBase } from './Base.js'

type Modify<T, R> = Omit<T, keyof R> & R

export class Builder {
        constructor(
                private script: script,
                private states: StateBase[]
        ) {

        }

        private async buildState() {
                let state = {}
                for (const _state of this.states) {
                        let __state = {
                                ...state,
                                ..._state
                        }
                        state = __state
                }
        }

        async build() {
                let state = await this.buildState()


        }
}
