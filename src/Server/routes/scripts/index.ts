import { Router } from 'express'
import cfg from './../../config.js'

// let router = Router()

// router.get("/get_scripts", (req, res, next) => {
//         // TODO move to rangeLimit interface
//         let jsonReq = JSON.parse(req.body)

//         let options = {
//                 // only_names: false,
//                 offset: 0,
//                 page_limit: 10,
//                 ...jsonReq
//         }

//         let ret = new Array()
//         for (let i = options.offset; i < (options.page_limit <= 0 ? cfg.scripts.length : options.page_limt); i++) {
//                 if (!cfg.scripts[i]) {
//                         break
//                 }
//                 ret.push(cfg.scripts[i])
//         }
//         res.json({ scripts: ret })

//         next()
// })

// router.get("/get_plugins", (req, res, next) => {
//         let jsonReq = JSON.parse(req.body)

//         let options = {
//                 // only_names: false,
//                 offset: 0,
//                 page_limit: 10,
//                 ...jsonReq
//         }

//         let ret = new Array()
//         for (let i = options.offset; i < (options.page_limit <= 0 ? cfg.scripts.length : options.page_limt); i++) {
//                 if (!cfg.scripts[i]) {
//                         break
//                 }
//                 ret.push(cfg.scripts[i])
//         }

//         next()
// })
