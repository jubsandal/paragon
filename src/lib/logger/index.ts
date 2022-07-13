import { appendFileSync } from 'fs'
import chalk from 'chalk'

function logTime() {
        return '[' + new Date().toLocaleTimeString() + ']'
}

const logFileName = "./.log" + "/log_" + new Date().toLocaleDateString().replaceAll('/', '') + "_" + new Date().toLocaleTimeString("ru").replaceAll(":", '')

type ExtendedLog = {
        (...arg: any[]): void,
        echo:  (...arg: any[]) => void
        error: (...arg: any[]) => void
}
export let log = <ExtendedLog>function(...arg: any[]): void {
        appendFileSync(logFileName, logTime() + ' - ' + arg.join(" ") + "\n")
}
log.error = function(...arg: any[]) {
        log("ERROR:", ...arg)

        console.error(logTime(), '-', chalk.red(...arg))
}
log.echo = function(...arg: any[]) {
        log(...arg)
        console.log(logTime(), '-', ...arg)
}
