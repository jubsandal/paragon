import { BaseAction, State } from './../state.js'
import puppeteer from 'puppeteer'
import { retrier, log, sleep } from './../../../../utils.js'
import * as fs from 'fs'
import { CommandInput } from './../../adapter.js'

async function SetVariable(this: State, ...inputs: any[]) {
        const var_name = inputs[0]
        const var_value = inputs[1]

        this.variables.set(var_name, var_value)
}

async function RemoveVariable(this: State, ...inputs: any[]) {
        const var_name = inputs[0]
        if (this.variables.has(var_name)) {
                this.variables.delete(var_name)
        }
}

async function ExistsVariable(this: State, ...inputs: any[]) {
        const var_name = inputs[0]
        if (!this.variables.has(var_name)) {
                throw ""
        }
}

// @ts-ignore
async function Dummy(this: State, ...inputs: any[]) { }

export {
        SetVariable,
        RemoveVariable,
        ExistsVariable,
        Dummy
}
