import * as fs from 'fs'
import * as crypt from 'crypto'
import config from './config.js'
import { boolean, Describe, Infer, union, number, array, assert, object, string } from 'superstruct'
import { Database } from 'aloedb-node'
import { log } from './utils.js'

export namespace database {

    const ProxySign = object({
        host: string(),
        port: number(),
        auth: object({
            user: string(),
            password: string()
        })
    })

    const emailExtensionSign = object({
        imap: boolean()
    })

    const AccountSign = object({
        id: number(),
        registrationTime: number(),
        usedproxy: array(ProxySign),
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
            registrationTime: number
            usedproxy: Array<ProxySchema>
            readonly auth: {
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

                this.registrationTime = schema.registrationTime ?? -1
                this.usedproxy = schema.usedproxy ?? new Array()
                this.auth = schema.auth
            }

            async sync() {
                if (await accounts_db.findOne({ id: this.id })) {
                    return await accounts_db.updateOne({ id: this.id }, this)
                } else {
                    return await accounts_db.insertOne(this)
                }
            }

            async refresh() {
                // danger no throw
                return new Account(<AccountSchema>(await accounts_db.findOne({id: this.id})))
            }

            async markRegistred() {
                this.registrationTime = new Date().getTime()
                return await this.sync()
            }

            async markProxy(proxy: ProxySchema) {
                this.usedproxy.push(proxy)
                return await this.sync()
            }
        }
    }

    export type ProxySchema = Infer<typeof ProxySign>
    export type AccountSchema = Infer<typeof AccountSign>
    export type emailExtensionSchema = Infer<typeof emailExtensionSign>
}
