import { Infer,enums } from 'superstruct'
import puppeteer from 'puppeteer'

export type pathTextConfig = {
    dataFrom: string
    dataPath: string
    dataURL?: string // for dataFrom value "URL" or "Page"
    append?:  string
    prepend?: string
}

const botActionTypeSign = enums([ "Click", "Type", "Goto", "Upload", "Copy", "Screenshot" ])
// export type botActionType = ("Click" | "Type" | "Goto" | "Upload" | "Screenshot")
export type botActionType = Infer<typeof botActionTypeSign>

export type botActionTargetPage = "new page"

export interface botAction {
    id: number
    name: string
    type: botActionType

    // by type config
    field?: string
    url?: string
    text?: string | pathTextConfig
    saveAs?: string

    errorCondition?: {
        noSelector?: string
    }

    onUnreacheble?: {
        repeat?: boolean
        repeatMax?: number
        gotoAction?: number
    }

    after: {
        delay?: number
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
    browserAdapter: "AdsPower" | "Common" | "Stealth"
    adsLocalIPHost?: string
    actions: Array<botAction>
}

export interface UnitState {
    action_queue: botAction[]
    initial_target_page: puppeteer.Page
    previus_target_page?: puppeteer.Page
    target_page: puppeteer.Page
}