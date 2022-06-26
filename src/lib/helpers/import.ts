import * as fs from 'fs'
import { database } from './../database.js'
import { log } from './../utils.js'

export module importman {

    type delemiter = "NL" | "Space" | "Colon"

    type trimOpt = "NL" | "Space" | "Both" | "No"
    type accountOpt = "NL" | "Space" | "Colon"
    type dataOpt = "NL" | "Space"
    type dataOrderOpt = string // "L" | "LP" | "PL" | "LPI" | "PLI" | "IPL" | "ILP" | "LIP"

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
        let _account = new database.ORM.Account({
            auth: {
                email: {
                    login: "",
                    password: "",
                    extensions: {
                        imap: false
                    }
                }
            }
        })

        console.log(sub_chunks)
        let paths = opt.order.split("|")
        for (let i = 0; i < paths.length; i++) {
            const path = paths[i]
            const word = sub_chunks[i]
            _account.setDataByPath(path, word)
        }

        return _account
    }

    function readStructure(raw: string, opt: { delemiter: dataOpt, accountSize: number }) {
        let misc = raw.replaceAll(/\r/g, '').split(getDelemiter(opt.delemiter))
        let chunks = new Array<string>()

        for (let i = 0, c = 0; i < misc.length; i++) {
            c++
            if (c == opt.accountSize) {
                let data = ""
                for (let j = 1; j <= opt.accountSize; j++) {
                    console.log(misc.at(i-( opt.accountSize - j )))
                    data += <string>misc.at(i-( opt.accountSize - j ))
                    // if (j+1 != opt.accountSize) {
                    //     data += getDelemiter(opt.delemiter)
                    // }
                }
                chunks.push(data)
                console.log("")
                c = 0
            }
        }

        return chunks
    }

    // TODO add account use case group
    export async function smartImport(opts: importOpts) {
        if (opts.path.length === 0) {
            throw "No path passed"
        }

        for (const path of opts.path) {
            if (!fs.existsSync(path)) {
                log.error("File not exits:", path)
                continue
            }
            const raw = fs.readFileSync(path).toString()

            let added = 0
            let skiped = 0

            let accountSliceSize = 1
            if (opts.delemiters.data === "Space" && opts.delemiters.account === "Space") {
                accountSliceSize = opts.dataOrder.split("|").length
            } else if (opts.delemiters.account === "Space" && opts.delemiters.data === "NL") {
                accountSliceSize = 1
            }

            const structure = readStructure(raw, {
                delemiter: opts.delemiters.data,
                accountSize: accountSliceSize
            })
            console.log(structure)
            for (const chunk of structure) {
                const _a = readAccount(chunk, { delemiter: opts.delemiters.account, order: opts.dataOrder })
                // TODO add unique policy by data passed or direct settings or account use case group uniq policy
                // if (await database.tables.accounts.findOne(a => a.auth.email.login == _a.auth.email.login)) {
                //     skiped++
                //     continue
                // }
                added++
                await _a.sync()
            }
            log.echo("Imported", added, "from path:", path, "skiped", skiped, "entries")
        }
    }
}
