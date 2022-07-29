
export function getDataByPath(obj: object, path: string): any {
        let ret: any = obj

        for (const node of path.split('.')) {
                ret = ret[node]
        }

        return ret
}

export function assign(obj: object, _prop: string, value: any) {
        let prop = new Array<string>()
        if (typeof _prop === "string")
                prop = _prop.split(".")

        if (prop.length > 1) {
                var e = prop.shift()
                // @ts-ignore
                this.assign(obj[e] =
                        // @ts-ignore
                        Object.prototype.toString.call(obj[e]) === "[object Object]"
                        // @ts-ignore
                        ? obj[e]
                        : {},
                        prop.join('.'),
                        value)
        } else {
                // @ts-ignore
                obj[prop[0]] = value
        }
        return obj
}
