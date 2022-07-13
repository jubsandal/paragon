import express, { Router } from 'express'
import cfg from './config.js'
import { scriptSign } from './Types/script.js'
// import bodyParser from 'body-parser'

import * as ss from 'superstruct'
import { log } from './utils.js'

import Paragon from './Paragon.js'

export default class Server {
        private app: express.Application
        private paragon: Paragon

        constructor(private port: number) {
                this.app = express()
                this.paragon = new Paragon()
        }

        private async setup() {
                await this.paragon.applyPlguins()
                
                this.app.get("/scripts/get_scripts", (req, res, next) => {
                        // TODO move to rangeLimit interface
                        let jsonReq = JSON.parse(req.body ?? "{}")

                        let options = {
                                // only_names: false,
                                offset: 0,
                                page_limit: 10,
                                ...jsonReq
                        }

                        let ret = new Array()
                        for (let i = options.offset; i < (options.page_limit <= 0 ? cfg.scripts.length : options.page_limt); i++) {
                                if (!cfg.scripts[i]) {
                                        break
                                }
                                ret.push(cfg.scripts[i])
                        }
                        res.json({ scripts: ret })

                        next()
                })

                this.app.get("/scripts/get_plugins", (req, res, next) => {
                        let jsonReq = JSON.parse(req.body ?? "{}")

                        let options = {
                                // only_names: false,
                                offset: 0,
                                page_limit: 10,
                                ...jsonReq
                        }

                        let ret = new Array()
                        for (let i = options.offset; i < (options.page_limit <= 0 ? this.paragon.AppliedPlugins.length : ( options.page_limit <= this.paragon.AppliedPlugins.length ? options.page_limit : this.paragon.AppliedPlugins.length)); i++) {
                                ret.push(this.paragon.AppliedPlugins[i])
                        }
                        res.json({ plugins: ret })

                        next()
                })

                this.app.post("/scripts/add_scripts", (req, res) => {
                        let json = JSON.parse(req.body ?? "{}")

                        let ret = { }
                        try {
                                ss.assert(json, scriptSign)
                                cfg.scripts.push(json)
                        } catch (e: any) {
                                const error = <ss.StructError>e
                                ret = { error }
                        }

                        res.json(ret)
                })

                this.app.post("/scripts/run_script", (req, res) => {
                        let json = JSON.parse(req.body ?? "{}")

                        res.json({
                                status: "ok"
                        })
                })

                // TODO
                // this.app.post("/scripts/terminate_script", (req, res) => { })

                // @ts-ignore
                this.app.use((req, res, next) => {
                        console.log('Time:', Date.now())
                        next()
                })
        }

        async listen() {
                await this.setup()

                this.app.listen(this.port/*, "localhost"*/, () => {
                        log.echo("Server listening on", "localhost", "port", this.port)
                })
        }
}
