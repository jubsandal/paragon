// TODO move to types
import * as ss from 'superstruct'
import { StateBase } from './../Types/State.js'
import { extractable, extract } from './../lib/extractable.js'
import { getDataByPath } from './../lib/data.js'

export interface IBaseInput {
        position: number
        type: ss.Struct<any, any>;
        optional?: boolean
        description?: string
        path: string
}

export class BaseInput implements IBaseInput {
        position: number
        type: ss.Struct<any, any>;
        optional?: boolean
        description?: string
        path: string

        constructor(obj: IBaseInput) {
                this.position = obj.position
                this.type = obj.type
                this.optional = obj.optional ?? false
                this.description = obj.description ?? "no description"
                this.path = obj.path
        }
}

export async function getInputs(state: StateBase | any, inputs: BaseInput[], obj: object) {
        let ret = new Array()
        for (const input of inputs) {
                let val
                if (input.path[0] == '$') {
                        const path = input.path.slice(1)
                        val = getDataByPath(state, path)
                } else {
                        try {
                                val = await extract(getDataByPath(obj, input.path), state.profile, state?.browser, state?.page)
                        } catch (e) {
                                if (!input.optional) {
                                        throw e
                                }
                        }
                }
                ret.push(val)
        }
        return ret
}

export const IBaseInputSign = ss.object({
        position: ss.number(),
        type: ss.any(),
        optional: ss.optional(ss.boolean()),
        description: ss.optional(ss.string()),
        path: ss.string()
})
