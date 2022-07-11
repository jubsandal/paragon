// TODO move to types
import { script, scriptAction } from './../../Types/script.js'
import { CmdError } from './../lib/Error.js'
import * as ss from 'superstruct'
import { extract } from './../../Types/extractable.js'
import { StateBase } from './Base.js'
import { getDataByPath } from './../../utils.js'
import { IBaseInputSign, IBaseInput, BaseInput, getInputs } from './../lib/Input.js'

interface ICommandInput extends IBaseInput {
}

export class CommandInput extends BaseInput implements ICommandInput {
        constructor(obj: ICommandInput) {
                super(obj)
        }
}

type cmdFunction<State extends StateBase> = (this: State, ...inputs: any[]) => Promise<CmdError>;

export type Command<State extends StateBase> = {
        name: string
        description: string
        inputs: CommandInput[]
        returnValue: ss.Struct<any, null> | ss.Struct<never, null>
        fn: cmdFunction<State>
        // fn: (this: State, ...inputs: string[]) => Promise<void>
}

export const CommandSign = ss.object({
        name: ss.string(),
        description: ss.string(),
        inputs: ss.array(IBaseInputSign),
        returnValue: ss.union([ ss.any() ]),
        fn: ss.func()
})

export class CommandExecutor<State extends StateBase> {
        constructor(
                private cmd: Command<State>,
                private action: scriptAction,
                private state: State
        ) {
        }

        private async getInputs() {
                return await getInputs(this.state, this.cmd.inputs, this.action)
                // let inputs = new Array()
                // for (const input of this.cmd.inputs) {
                //         inputs.push(
                //                 // @ts-ignore :(
                //                 await extract(getDataByPath(this.action, input.path), this.state.profile, this.state?.browser, this.state?.page)
                //         )
                // }
                // return inputs
        }

        async execute() {
                return await this.cmd.fn.call(this.state, ...(await this.getInputs()))
        }
}

