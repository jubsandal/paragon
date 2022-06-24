import * as fs from 'fs'
import { database } from './../database.js'

export module importman {

    type delemiter = "NL" | "Space" | "Colon"

    type trimOpt = "NL" | "Space" | "Both" | "No"
    type accountOpt = "NL" | "Space" | "Colon"
    type dataOpt = "NL" | "Space"
    type dataOrderOpt = "L" | "LP" | "PL" | "LPI" | "PLI" | "IPL" | "ILP" | "LIP"

    export interface importOpts {
        delemiters: {
            trim:    trimOpt
            account: accountOpt
            data:    dataOpt
        }
        dataOrder: dataOrderOpt
        path: Array<fs.PathLike>
    }

    function getDelemiter(d: delemiter): string {
        switch (d) {
            case "NL":
                // TODO determine windows \r\n and linux \n
                return "\n"
            case "Space":
                return " "
            case "Colon":
                return ":"
        }
    }

    function readAccount(chunk: string, opt: { delemiter: accountOpt, order: dataOrderOpt }): database.ORM.Account {
        let sub_chunks = chunk.split(getDelemiter(opt.delemiter))
        let _account = {
            login: "",
            password: "",
            extensions: {
                imap: false
            }
        }

        for (let i = 0; i < opt.order.length; i++) {
            const ch = opt.order.at(i)
            const word = sub_chunks.at(i)
            switch (ch) {
                case "L":
                    _account.login = <string>word
                    break;
                case "P":
                    _account.password = <string>word
                    break;
                case "I":
                    _account.extensions.imap = Boolean(word)
                    break;
            }
        }

        return new database.ORM.Account({ auth: { email: {..._account} } })
    }

    function readStructure(raw: string, opt: { delemiter: dataOpt, accountSize: number }) {
        let misc = raw.replaceAll(/\r/g, '').split(getDelemiter(opt.delemiter))
        let chunks = new Array<string>()

        for (let i = 0, c = 0; i < misc.length; i++) {
            c++
            if (c == opt.accountSize) {
                let data = ""
                for (let j = 1; j <= opt.accountSize; j++) {
                    data += <string>misc.at(i-( opt.accountSize - j ))
                    if (j+1 != opt.accountSize) {
                        data += getDelemiter(opt.delemiter)
                    }
                }
                chunks.push(data)
                c = 0
            }
        }

        return chunks
    }

    export async function smartImport(opts: importOpts) {
        if (opts.path.length === 0) {
            throw "No path passed"
        }

        for (const path of opts.path) {
            const raw = fs.readFileSync(path).toString()

            const structure = readStructure(raw, { delemiter: opts.delemiters.data, accountSize: opts.dataOrder.length })
            for (const chunk of structure) {
                const _a = readAccount(chunk, { delemiter: opts.delemiters.account, order: opts.dataOrder })
                if (await database.tables.accounts.findOne(a => a.auth.email.login == _a.auth.email.login)) {
                    continue
                }
                await _a.sync()
            }
        }
    }
}
