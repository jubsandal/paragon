export module Validator {
    /**
     * return false if validation failed
     */
    // @ts-ignore
    export function validateAccountFor(actions: Type.botConfigEntry, account: database.ORM.Account | database.AccountSchema) {
        if (!actions.url) {
            return false
        }

        try {
            new URL(actions.url) // throw catch validation
        } catch (e) {
            console.log(e)
            return false
        }

        // TODO

        return true
    }
}
