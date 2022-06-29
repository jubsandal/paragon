import { database } from './lib/database.js'

for (const _account of database.tables.accounts.documents.map(a => new database.ORM.Account(a))) {
        console.log(_account.adsUserId+":"+await _account.getDataByPath("customJSON.sandbox.twittUrl"))
}
