import puppeteer from 'puppeteer'

export interface pageConfig {
        viewPort?: puppeteer.Viewport;
        userAgent?: string;
        headers?: Record<string, string>
}

