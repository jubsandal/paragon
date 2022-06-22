import * as fs from 'fs'

const accounts = JSON.parse(fs.readFileSync("storage/accounts.json").toString())

let write_data = new Array()
for (const account of accounts) {
    write_data.push({ ...account, customJSON: "" })
}

fs.writeFileSync("./accs.json", JSON.stringify(write_data, null, '    '))
