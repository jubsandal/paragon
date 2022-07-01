import { assign, union, Describe, optional, array, enums, Infer, assert, boolean, object, number, string } from 'superstruct'

export const ProxyTypeSign = object({
        host: string(),
        port: number(),
        auth: optional(
                object({
                        user: string(),
                        password: string()
                })
        )
})

export class Proxy implements ProxyType {
        host: string
        port: number
        auth?: {
                user: string
                password: string
        }

        constructor(proxy: ProxyType) {
                this.host = proxy.host
                this.port = proxy.port
                this.auth = proxy.auth
        }

        toString(): string {
                return "http://" + (this.auth ? this.auth.user + ":" + this.auth.password + "@" : "") + this.host + ":" + this.port
        }
}

export type ProxyType = Infer<typeof ProxyTypeSign>;
