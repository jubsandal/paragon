import express, { Router } from 'express'
// import bodyParser from 'body-parser'

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

                // @ts-ignore
                this.app.use((req, res, next) => {
                        console.log('Time:', Date.now())
                        next()
                })

                this.app.get("/get_plugins", (_, res) => {
                        res.json(this.paragon.AppliedPlugins)
                })
        }

        async listen() {
                await this.setup()

                this.app.listen(this.port/*, "localhost"*/, () => {
                        log.echo("Server listening on", "localhost", "port", this.port)
                })
        }
}
