import * as fs from 'fs'
import * as crypt from 'crypto'
import config from './../../../config.js'
import { nullable, optional, boolean, Describe, Infer, union, number, array, assert, object, string } from 'superstruct'
import { Database } from 'aloedb-node'
import { log } from './../../../utils.js'
import { ProxyTypeSign, ProxyType } from './../../../Types/proxy.js'

export namespace database {

        const UserDataSign = object({
                firstname: string(),
                lastname: string(),
                middlename: string(),
                username: string(),
                birthdate: string()
        })

        const emailExtensionSign = object({
                imap: boolean()
        })

        const AccountSign = object({
                id: number(),
                forseProxyLink: optional(ProxyTypeSign),
                subscriptions: array(
                        object({
                                userdata: optional(UserDataSign),
                                usedproxy: nullable(ProxyTypeSign),
                                url: string(),
                                registrationTime: number(),
                        })
                ),
                adsUserId: optional(string()),
                customJSON: string(),
                auth: object({
                        email: object({
                                login: string(),
                                password: string(),
                                extensions: emailExtensionSign
                        }),
                })
        })

        const Validators = {
                account: (document: any) => assert(document, AccountSign)
        }

        let accounts_db = new Database<AccountSchema>({
                path: config.path.storage + "/accounts.json",
                schemaValidator: Validators.account,
                pretty: true, autoload: true, immutable: true, onlyInMemory: false,
        })

        export const tables = { accounts: accounts_db }

        export module ORM {
                function id_gen(database: Database<any & { id: number }>) {
                        if (database.documents.length == 0) {
                                return 0
                        } else {
                                return Math.max(...accounts_db.documents.map(a => <number>a.id))+1
                        }
                }

                export class Account implements AccountSchema {
                        readonly id: number
                        forseProxyLink?: ProxyType
                        subscriptions: {
                                userdata?: {
                                        firstname: string
                                        lastname: string
                                        middlename: string
                                        username: string
                                        birthdate: string
                                }
                                url: string
                                registrationTime: number
                                usedproxy: ProxyType | null
                        }[]
                        customJSON: string
                        adsUserId: string
                        auth: {
                                email: {
                                        login: string
                                        password: string
                                        extensions: emailExtensionSchema
                                }
                        }

                        constructor(schema: Partial<AccountSchema> & Pick<AccountSchema, "auth">) {
                                if (schema.id) {
                                        this.id = schema.id
                                } else {
                                        this.id = id_gen(accounts_db)
                                }

                                this.adsUserId = schema.adsUserId ?? ""
                                this.customJSON = schema.customJSON ?? "{}"
                                this.forseProxyLink = schema.forseProxyLink
                                this.auth = schema.auth
                                this.subscriptions = schema.subscriptions ?? []
                        }

                        async sync() {
                                if (await accounts_db.findOne(a => a.id == this.id)) {
                                        return await accounts_db.updateOne(a => a.id == this.id, this)
                                } else {
                                        return await accounts_db.insertOne(this)
                                }
                        }

                        async refresh() {
                                // danger no throw
                                return new Account(<AccountSchema>(await accounts_db.findOne({id: this.id})))
                        }

                        async markRegistred(url: string, proxy: ProxyType | null, userdata?: UserDataSchema) {
                                this.subscriptions.push({
                                        registrationTime: new Date().getTime(),
                                        usedproxy: proxy,
                                        url: url,
                                        userdata: userdata,
                                })
                                return await this.sync()
                        }

                        getDataByPath(path: string): Promise<any> {
                                let ret: any = this

                                for (const node of path.split('.')) {
                                        if (node === "customJSON") {
                                                console.log(this.customJSON)
                                                ret = JSON.parse(this.customJSON)
                                                continue
                                        }
                                        // @ts-ignore
                                        ret = ret[node]
                                }

                                return ret
                        }

                        private assign(obj: object, _prop: string, value: any) {
                                let prop = new Array<string>()
                                if (typeof _prop === "string")
                                        prop = _prop.split(".")

                                if (prop.length > 1) {
                                        var e = prop.shift()
                                        // @ts-ignore
                                        this.assign(obj[e] =
                                                // @ts-ignore
                                                Object.prototype.toString.call(obj[e]) === "[object Object]"
                                                // @ts-ignore
                                                ? obj[e]
                                                : {},
                                                prop.join('.'),
                                                value)
                                } else {
                                        // @ts-ignore
                                        obj[prop[0]] = value
                                }
                                return obj
                        }

                        setDataByPath(path: string, data: any) {
                                if (path.includes("customJSON")) {
                                        if (path.includes("customJSON.")) {
                                                path = path.replace('customJSON.', "")
                                        } else {
                                                path = path.replace('customJSON', "")
                                        }
                                        this.customJSON = JSON.stringify(
                                                this.assign(JSON.parse(this.customJSON), path, data))
                                } else {
                                        this.assign(this, path, data)
                                }
                                return this
                        }
                }
        }

        export type AccountSchema = Infer<typeof AccountSign>;
        export type emailExtensionSchema = Infer<typeof emailExtensionSign>;
        export type UserDataSchema = Infer<typeof UserDataSign>;
}
