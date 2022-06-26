import { MultiProgressBars  } from 'multi-progress-bars';
import { database } from "./database.js"
import chalk from 'chalk';

const projectname = "Subscriber"

export function accountBarID(account: database.ORM.Account) {
    return "login:"+account.auth.email.login
}

export let mpb: MultiProgressBars

export class WorkerBarHelper {
    private curTask = 0
    constructor(
        private account: database.ORM.Account,
        private tasks: Array<string>
    ) {

    }

    create() {
        mpb.addTask(accountBarID(this.account), {
            type: "percentage",
            message: "",
            barTransformFn: (m) => chalk.blueBright(m),
            percentage: 0
        })
    }

    next(i: number) {
        this.curTask = i
        mpb.updateTask(accountBarID(this.account), {
            message: this.tasks[this.curTask],
            percentage: this.curTask/this.tasks.length
        })
    }

    done(success: boolean) {
        mpb.done(accountBarID(this.account), {
            barTransformFn: (m) => chalk[(success ? "green" : "red")](m),
            message: (success ? "Success" : "Failed")
        })
    }
}

export function createMainProgress(cur: number, overall: number) {
    mpb = new MultiProgressBars({
        initMessage: ' $ ' + projectname + ' ',
        anchor: 'top',
        persist: true,
        border: true,
    })

    mpb.addTask("Progress", {
        type: "percentage",
        message: cur+"/"+overall+" 0 errors",
        barTransformFn: (m) => chalk.blueBright(m)
    })
}

export function updateMainProgress(cur: number, overall: number, errors: number) {
    mpb.updateTask("Progress", {
        message: cur+"/"+overall+" "+errors+" errors"
    })
}
