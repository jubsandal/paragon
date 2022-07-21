import { CheckObj, check_path, ss } from './../../include.js'

// TODO maybe use transformers for checkers inputs instead of use check_path?
// and in 69eb61fc65c6bb6334f1c4973fd9fa62c624c01b Mon Jul 18 19:42:41 2022 inputs interpriating directly inside script executor not like in CommandExecutor<>
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
