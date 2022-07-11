import { CheckFn, CheckObj, check_path } from './../../../checkers/Conditional.js'
import * as ss from 'superstruct'

export const checkers: CheckObj[] = [
        {
                name: "Success",
                inputs: [],
                fn: async (cmdRet) => {
                        if (cmdRet.Ok()) {
                                return true
                        }
                        return false
                }
        },
        {
                name: "Contains",
                inputs: [
                        {
                                position: 0,
                                type: new ss.Struct({ type: "string", schema: null }),
                                description: "",
                                path: check_path("value")
                        }
                ],
                fn: async (cmdRet, inputs) => {
                        if (cmdRet.returnValue && cmdRet.returnValue.includes(inputs[0])) {
                                return true
                        } else {
                                return false
                        }
                }
        },
        {
                name: "NotContains",
                inputs: [
                        {
                                position: 0,
                                type: new ss.Struct({ type: "string", schema: null }),
                                description: "",
                                path: check_path("value")
                        }
                ],
                fn: async (cmdRet, inputs) => {
                        if (cmdRet.returnValue && !cmdRet.returnValue.includes(inputs[0])) {
                                return true
                        } else {
                                return false
                        }
                }
        },
        {
                name: "Equal",
                inputs: [
                        {
                                position: 0,
                                type: new ss.Struct({ type: "string", schema: null }),
                                description: "",
                                path: check_path("value")
                        }
                ],
                fn: async (cmdRet, inputs) => {
                        if (cmdRet.returnValue && cmdRet.returnValue === inputs[0]) {
                                return true
                        } else {
                                return false
                        }
                }
        },
]
