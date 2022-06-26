import puppeteer from 'puppeteer'

import { database } from './database.js'
import cfg from './../config.js'
import { botConfigEntry } from './Types.js'
import * as helpers from './helpers/index.js'
import { proxy as Proxy, log, sleep, randSleep } from './utils.js'
import * as Type from './Types.js'
import * as barhelper from './bar-helper.js'

/**
 * account and actions must be valid
 */
// TODO redo with middlevare advanced logging and message delivery
export class Unit {
    private barhelper: barhelper.WorkerBarHelper
    // @ts-ignore
    private browser: puppeteer.Browser
    // @ts-ignore
    private state: Type.UnitState = {
        action_queue: [],
	cur_action_try: 0
    }


    constructor(
        private account: database.ORM.Account,
        private actions: botConfigEntry
    ) {
        this.barhelper =
            new barhelper.WorkerBarHelper(this.account, this.actions.actions.map(a => a.name))
    }

    private async smrtAction(frame: string | undefined, field: string, action: Type.botActionType, string?: string) {
        const typer = async () => {
            try {
                let root = this.state.target_page
                if (frame) {
                    let eh = await this.state.target_page.$(frame)
                    // @ts-ignore
                    root = await eh!.contentFrame()
                }
                const selector = await root.waitForSelector(field, { timeout: waitms, visible: true })
                if (selector) {
                    switch (action) {
                        case "Click":
			    await selector.hover()
                            await selector.click()
                            break;
                        case "Type":
                            try {
                                // @ts-ignore
                                await this.state.target_page.evaluate((_field) => document.querySelector(_field)!.value = '', field)
                            } catch (e) { log.echo("Non critical: Cannot erace input field:", e, field) }
                            // @ts-ignore
                            await selector.type(string)
                            break;
                        case "Upload":
				log.echo("Uploading:", string)
			    try {
				    // @ts-ignore
				    //await selector.uploadFile(string)
				    const [fileChooser] = await Promise.all([
					    this.state.target_page.waitForFileChooser(),
					    this.state.target_page.click(field),
				    ]);
				    // @ts-ignore
				    await fileChooser.accept([string])
			    } catch (e) { log.error(e); throw e; }
                            break;
                        default:
                            throw 1
                    }
                    return true
                } else {
                    throw 0
                }
            } catch (e) {
                if (typeof e === "number") {
                    if (e === 1) {
                        throw "Not valid action passed: " + action
                    }
                }
                return false
            }
            return true
        }

        const tryies = 3
        const waitms = 700
        for (let tryn = 0; tryn < tryies; tryn++) {
	log.echo("smrt", action, "Try", tryn)
            if (await typer()) {
                return
            }
            await sleep(waitms)
        }
        throw "Cannot do smrt action on field: " + field + " at this.state.target_page: " + this.state.target_page.url()
    }

    private async deserializeText(action: Type.botAction) {
        let text = ""
        if (typeof action.text === "object") {
            const typeopts = <Type.pathTextConfig>action.text
            switch (typeopts.dataFrom) {
                case "Account":
                    text = await this.account.getDataByPath(typeopts.dataPath)
                    break;
                case "URL": // TODO move to smrtAction
                    let page = await this.browser.newPage()
                    if (!action.text.dataURL) {
                        throw "No url for text source URL passed"
                    }
                    await page.goto(action.text.dataURL, { waitUntil: "domcontentloaded" })
                    await sleep(1000)
                    const tries = 5
                    const waitms = 700
                    for (let tri = 0; tri < tries; tri++) {
                        try {
                            let _text = await page.$eval(action.text.dataPath, e => e.textContent)
                            if (_text) {
                                text = _text.trim()
                                break
                            }
                        } catch (e) {}
                        await sleep(waitms)
                    }
                    await page.close()
                    break
                case "ElementAttr":
                    if (!action.text.dataPath) throw "No field passed to ElementAttr text option"
                    if (!action.text.dataAttribute) throw "No attribute passed to ElementAttr text option"
                    const _AttrName = String( (<Type.pathTextConfig>action.text)!.dataAttribute )
                    text = String(
                        await this.state.target_page.$eval(action.text.dataPath,
                            ( e, _AttrName ) => e.getAttribute(<string>_AttrName), _AttrName)
                    )
                    break
                default:
                    throw "Not implemented accessing to data to type from data source " + typeopts.dataFrom
            }
            const __text = text
            text = (action.text.prepend ?? "") + __text + (action.text.append ?? "")
        } else if (typeof action.text === "string") {
            text = action.text
        }

        return text
    }

    private async doType(action: Type.botAction) {
        const text = await this.deserializeText(action)
        if (!action.field) throw "No field for action: " + action.name
        if (!text || text === "") throw "No text for action " + action.name
        await this.smrtAction(action.frame, action.field, "Type", text)
    }

    private async doClick(action: Type.botAction) {
        if (!action.field) throw "No field for action: " + action.name
        await this.smrtAction(action.frame, action.field, "Click")
    }

    private async doGoto(action: Type.botAction) {
        if (!action.text) throw "No url path for action: " + action.name
        const text = await this.deserializeText(action)
        await this.state.target_page.goto(text)
    }

    private async doUpload(action: Type.botAction) {
        const text = await this.deserializeText(action)
        if (!action.text) throw "No url path for action: " + action.name
        if (!action.field) throw "No field for action: " + action.name
        await this.smrtAction(action.frame, action.field, "Upload", text)
    }

    private async doCopy(action: Type.botAction) {
        if (!action.field) throw "No field for action: " + action.name
        if (!action.saveAs) throw "No save as option for action: " + action.name
        switch (action.field) {
            case "URL":
                await this.account.setDataByPath(
                    action.saveAs,
                    await this.state.target_page.url()
                ).sync()
                break
            default:
                throw "No such copy field: " + action.field
        }
    }

    private async finalizeAction(action: Type.botAction) {
        if (action.after.delay && action.after.delay > 0) {
            await sleep(action.after.delay)
        }
        if (action.after.waitForNavigatior) {
            await this.state.target_page.waitForNavigation({waitUntil: 'networkidle2'/*, timeout: 10000*/})
        }
        if (action.after.waitForSelector) {
            let root = this.state.target_page
            if (action.after.waitForSelectorIframe) {
                let eh = await this.state.target_page.waitForSelector(action.after.waitForSelectorIframe, { timeout: 30000 })
                // @ts-ignore
                root = await eh!.contentFrame()
            }
            await root.waitForSelector(action.after.waitForSelector, { timeout: 30000 })
        }
        let target
        // TODO validate
        if (action.after.waitForTarget) {
            let waitForTarget: Promise<puppeteer.Page> = new Promise(( resolve, reject ) => {
                this.browser.on('targetcreated', (target: puppeteer.Target) => {
			sleep(2000).then(() => reject("Timeout"))
                    if (target.type() === action.after.waitForTarget) {
                        if (target.page() === null) {
                            reject("Target page is null")
                        }
                        // @ts-ignore
                        resolve(target.page())
                    }
                })
            })
            target = await waitForTarget
        }
        if (action.after.switchToTarget) {
            let previus_target_page = this.state.previus_target_page
            this.state.previus_target_page = this.state.target_page
            switch (action.after.switchToTarget) {
                case "Newest":
                    if (target) {
                        this.state.target_page = target
                    } else {
                        throw "No newest targets"
                    }
                    break
                case "Previus":
                    if (previus_target_page) {
                        this.state.target_page = previus_target_page
                    } else {
                        throw "No previus targets"
                    }
                    break
                case "Initial":
                    this.state.target_page = this.state.initial_target_page
                    break
                default:
                    throw "Unknown switch to target option: " + action.after.switchToTarget
            }
        }
    }

    public async exec(): Promise<{usedProxy: any}> {
	return new Promise(async (resolve, reject) => {
		    sleep(this.actions.maxExecutionTime).then(() => { reject("timeout") })
		let error = null
		this.barhelper.create()
		let proxyPool = cfg.proxy

		if (!this.account.adsUserId) {
		    if (this.actions.usePreDefinedProxy && this.account.forseProxyLink) {
			proxyPool.push(this.account.forseProxyLink)
		    }
		} else { // use ads proxy settings
		    proxyPool = []
		}

		try {
		// forse fall to throw on setup error
			let { browser, page: __page, proxy } = await helpers.browser.setupBrowser(proxyPool, this.actions, this.account)
		this.browser = browser
		this.state.target_page = __page
		this.state.initial_target_page = __page
		this.state.previus_target_page = undefined

		let curAction
		for (let i = 0; i < this.actions.actions.length; i++) {
		    const action = <Type.botAction>this.actions.actions.at(i)
		    curAction = action
		    try {
			this.barhelper.next(i)
			switch (action.type) {
			    case "Type":
				await this.doType(action)
				break
			    case "Click":
				await this.doClick(action)
				break
			    case "Goto":
				await this.doGoto(action)
				break
			    case "Upload":
				await this.doUpload(action)
				break
			    case "Copy":
				await this.doCopy(action)
				break
			    case "Reload":
				await this.state.target_page.reload({ waitUntil: "domcontentloaded" })
				break
			    case "Dummy":
				break
			    default:
				throw "Unkown action " + action.type
			}

			await this.finalizeAction(action)
			this.state.cur_action_try = 0
		    }  catch (e) {
			if (curAction.onUnreachable) {
			    if (curAction.onUnreachable.repeat) {
				    this.state.cur_action_try++
				i--
				    
				log.echo("Repeating action", curAction?.name)//, "error:", e, "error:", e)
				    if (!curAction!.onUnreachable.repeatMax) {
					    continue
				    } else if (curAction!.onUnreachable.repeatMax && curAction!.onUnreachable.repeatMax < this.state.cur_action_try) {
					    // throw
				    } else {
					continue
				    }
			    } else if (curAction.onUnreachable.gotoAction) {
				i = curAction.onUnreachable.gotoAction - 1
				log.echo("Going to action", curAction?.name)//,, "error:", e)
				continue
			    } else if (curAction.onUnreachable.successExit) {
				log.echo("Exit with success status on ureacheble action:", curAction.name)//,, "error:", e)
				break
			    } else if (curAction.onUnreachable.skip) {
				log.echo("Skiping action:", curAction.name)//,, "error:", e)
				continue
			    }
			    
			    if (curAction.onUnreachable.secondChanse) {
				    if (curAction.onUnreachable.repeat) {
					    this.state.cur_action_try = 0
						    i--

						    log.echo("Repeating action", curAction?.name)//, "error:", e, "error:", e)
					    if (!curAction!.onUnreachable.repeatMax) {
						    continue
					    } else if (curAction!.onUnreachable.repeatMax && curAction!.onUnreachable.repeatMax < this.state.cur_action_try) {
						    // throw
					    } else {
						    continue
					    }
				    } else if (curAction.onUnreachable.gotoAction) {
					    i = curAction.onUnreachable.gotoAction - 1
					    log.echo("Going to action", this.actions.actions[i+1])//,, "error:", e)
					    continue
				    } else if (curAction.onUnreachable.successExit) {
					    log.echo("Exit with success status on ureacheble action:", curAction.name)//,, "error:", e)
					    break
				    } else if (curAction.onUnreachable.skip) {
					    log.echo("Skiping action:", curAction.name)//,, "error:", e)
					    continue
				    }
			    }
			}
			log.error("Action", curAction?.name, "error:", e)
			error = e
			break
		    }
		}

		if (this.state.target_page) { await this.state.target_page.close() }
		if (browser) { await browser.close() }
		if (error) {
		    this.barhelper.done(false)
		    reject(error)
		}
		this.barhelper.done(true)
		resolve({
		    usedProxy: proxy
		})
		} catch (e) {
			reject(e)
		}
	})
    }
}
