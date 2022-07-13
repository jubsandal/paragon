import { sleep } from './time.js'

export async function retrier(fn: () => Promise<boolean>, opts?: { tries?: number, wait?: number  }) {
                const default_opts = { tries: 3, wait: 700  }
        const _opts = {
                                ...default_opts,
                                ...opts
                        
        }
        for (let tryn = 0; tryn < _opts.tries; tryn++) {
                                if (await fn()) { return  } // success exit
                                await sleep(_opts.wait)
                        
        }
                throw "Unreachable action: " + fn.name
        
}
