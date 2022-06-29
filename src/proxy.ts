import { assign, union, Describe, optional, array, enums, Infer, assert, boolean, object, number, string } from 'superstruct'

export const ProxyTypeSign = object({
        host: number(),
        port: number(),
        auth: optional(
                object({
                        user: string(),
                        password: string()
                })
        )
})

export class Proxy {
        constructor(private proxy: ProxyType) {

        }

        toString(): string {
                return "http://" + (this.proxy.auth ? this.proxy.auth.user + ":" + this.proxy.auth.password + "@" : "") + this.proxy.host + ":" + this.proxy.port
        }
}

export type ProxyType = Infer<typeof ProxyTypeSign>;
