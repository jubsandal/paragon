
export function getDataByPath(obj: object, path: string): any {
        let ret: any = obj

        for (const node of path.split('.')) {
                ret = ret[node]
        }

        return ret
}
