export type pathTextConfig = {
    dataFrom: string
    dataPath: string
}

export interface subscribeAction {
    url: string
    delay: number
    usePreDefinedProxy: boolean
    fields: {
        email: string
        password: string
        additional: Array<{
            name: string
            type: string | ("Click" | "Type")
            field: string
            text?: string | pathTextConfig
            after: {
                delay: number
                waitForSelector: string
                waitForNavigatior: boolean
            }
        }>
    }
    verification: {
        needed: boolean
        settings: {
            imap?: string
            browser?: string
        }
    }
}
