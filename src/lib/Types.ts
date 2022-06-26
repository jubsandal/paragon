import { optional,object,string,union,Infer,enums } from 'superstruct'
import puppeteer from 'puppeteer'

const pathTextConfigSourceSign = enums([ "Account", "Mail", "URL", "Page", "JSON_API", "ElementAttr" ])

export type pathTextConfig = {
    dataFrom: Infer<typeof pathTextConfigSourceSign>
    dataPath: string
    dataAttribute?: string
    dataURL?: string // for dataFrom value "URL" or "Page"
    append?:  string
    prepend?: string
}

const botActionTypeSign = enums([ "Dummy", "Click", "Reload", "Type", "Goto", "Upload", "Copy", "Screenshot" ])
// export type botActionType = ("Click" | "Type" | "Goto" | "Upload" | "Screenshot")
export type botActionType = Infer<typeof botActionTypeSign>

export type botActionTargetPage = "new page"

const botActionTextUnionSign = union([
    string(),
    object({
        dataFrom: enums([ "Account", "Mail", "URL", "Page", "JSON_API", "ElementAttr" ]),
        dataPath: string(),
        dataAttribute: optional(string()),
        dataURL:  optional(string()),
        append:   optional(string()),
        prepend:  optional(string()),
    })
])

export interface botAction {
    id: number
    name: string
    type: botActionType

    // by type config
    field?: string
    frame?: string
    url?: string
    text?: Infer<typeof botActionTextUnionSign>
    saveAs?: string

    errorCondition?: {
        noSelector?: string
    }

    onUnreachable?: {
        repeat?: boolean
        repeatMax?: number
        gotoAction?: number
        successExit?: boolean
        skip?: boolean
	secondChanse?: {
		repeat?: boolean
		repeatMax?: number
		gotoAction?: number
		successExit?: boolean
		skip?: boolean
	}
    }

    after: {
        delay?: number
	waitForSelectorIframe?: string,
        waitForSelector?: string
        waitForNavigatior?: boolean
        waitForTarget?: "page"
        switchToTarget?: "Newest" | "Previus" | "Initial"
    }
}

export interface botConfigEntry {
    name: string
    url: string
    day24limit: number
    perAccountDelay: number | string
    usePreDefinedProxy: boolean
    maxExecutionTime: number
    browserAdapter: "AdsPower" | "Common" | "Stealth"
    adsLocalIPHost?: string
    actions: Array<botAction>
}

export interface UnitState {
    action_queue: botAction[]
    initial_target_page: puppeteer.Page
    previus_target_page?: puppeteer.Page
    target_page: puppeteer.Page
    cur_action_try: number
}
