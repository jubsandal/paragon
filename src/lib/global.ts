import { MultiProgressBars  } from 'multi-progress-bars';
import { database } from "./../database.js"

const projectname = "Subscriber"

export let mpb: MultiProgressBars = new MultiProgressBars({
    initMessage: ' $ ' + projectname + ' ',
    anchor: 'top',
    persist: true,
    border: true,
})

export function accountBarID(account: database.ORM.Account) {
    return "login:"+account.auth.email.login
}
