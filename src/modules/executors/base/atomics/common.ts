import { BaseActions, State } from './../state.js'
import { CmdError } from './../../Error.js'
import puppeteer from 'puppeteer'
import { retrier, log, sleep } from './../../../../utils.js'
import * as fs from 'fs'
import { CommandInput } from './../../Command.js'

async function SetVariable(this: State, ...inputs: any[]) {
        const var_name = inputs[0]
        const var_value = inputs[1]

        this.variables.set(var_name, var_value)
        return new CmdError()
}

async function RemoveVariable(this: State, ...inputs: any[]) {
        const var_name = inputs[0]
        if (this.variables.has(var_name)) {
                this.variables.delete(var_name)
        }
        return new CmdError()
}

async function ExistsVariable(this: State, ...inputs: any[]) {
        const var_name = inputs[0]
        if (!this.variables.has(var_name)) {
                return new CmdError("Not exists", "Variable \"" + var_name + "\" not exists")
        }
        return new CmdError()
}

// @ts-ignore
async function Dummy(this: State, ...inputs: any[]) {
        return new CmdError()
}

export {
        SetVariable,
        RemoveVariable,
        ExistsVariable,
        Dummy
}
