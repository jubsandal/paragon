import { ElementHandle } from 'puppeteer'
import { appendFileSync } from 'fs'
import chalk from 'chalk'
import * as fs from 'fs'
import config from './../config.js'

export module proxy {
    export interface Proxy {
        host: string,
        port: number,
        auth: {
            user: string,
            password: string
        }
    }

    export module http {
        export function toString(proxy: Proxy): string {
            return "http://" + proxy.auth.user + ":" + proxy.auth.password + "@" + proxy.host + ":" + proxy.port
        }
    }
}

export function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

export async function randSleep(max: number = 1000, min: number = 100) {
    let ms = Math.round(Math.random() * (max-min) + min)
    return await sleep(ms)
}

export async function smrtClick(
    element: ElementHandle|null,
    params: {retries: number, idleTime: number} = {
        retries: 5,
        idleTime: 1000
    })
{
    const hoverAndClick = async () => {
        return await element!.hover()
            .then(() => {
                return element!.click();
            })
            .catch(( err: any ) => {
                if (params.retries <= 0) {
                    throw err
                }
                params.retries -= 1
                sleep(params.idleTime).then(hoverAndClick)
            });
    }

    return await hoverAndClick();
}

function logTime() {
    return '[' + new Date().toLocaleTimeString() + ']'
}

const logFileName = config.path.log + "/log_" + new Date().toLocaleDateString().replaceAll('/', '') + "_" + new Date().toLocaleTimeString("ru").replaceAll(":", '')

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

export module time {
    export type Time = {
        hour: number,
        minutes: number,
        seconds: number,
        milliseconds: number,
    }

    export function addTime(time: Partial<Time>, date = new Date()) {
        let copy = new Date(date)
        return new Date(copy.setTime(copy.getTime() +
            ( time.hour ?? 0) * 3600000 +
            ( time.minutes ?? 0) * 6000 +
            ( time.seconds ?? 0) * 1000) +
            ( time.milliseconds ?? 0))
    }

    export function toDate(date: any) {
        if (date === void 0) {
            return new Date(0);
        }
        if (isDate(date)) {
            return date;
        } else {
            return new Date(parseFloat(date.toString()));
        }
    }

    export function isDate(date: any) {
        return (date instanceof Date);
    }

    export function format(date: any, format: string) {
        var d = toDate(date);
        return format
            .replace(/Y/gm, d.getFullYear().toString())
            .replace(/m/gm, ('0' + (d.getMonth() + 1)).substr(-2))
            .replace(/d/gm, ('0' + (d.getDate() + 1)).substr(-2))
            .replace(/H/gm, ('0' + (d.getHours() + 0)).substr(-2))
            .replace(/i/gm, ('0' + (d.getMinutes() + 0)).substr(-2))
            .replace(/s/gm, ('0' + (d.getSeconds() + 0)).substr(-2))
            .replace(/v/gm, ('0000' + (d.getMilliseconds() % 1000)).substr(-3));
    }

    export function rawMS(time: Partial<Time>) {
        return ( time.hour ?? 0) * 3600000 +
            ( time.minutes ?? 0) * 6000 +
            ( time.seconds ?? 0) * 1000 +
            ( time.milliseconds ?? 0)
    }
}
