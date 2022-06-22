export type pathTextConfig = {
    dataFrom: string
    dataPath: string
}

export type botActionType = ("Click" | "Type" | "Goto" | "Upload")

export interface botAction {
    id: number
    name: string
    type: string | botActionType // todo

    // by type config
    field?: string
    url?: string
    text?: string | pathTextConfig

    after: {
        delay?: number
        waitForSelector?: string
        waitForNavigatior?: boolean
    }
}

export interface botConfigEntry {
    name: string
    url: string
    day24limit: number
    perAccountDelay: number | string
    usePreDefinedProxy: boolean
    actions: botAction[]
}
