
import { writable } from "svelte/store";
import type { IProfile } from "./users/service";
interface IUser {
    uid: string
}

let session = writable({}as IUser)
let userRole = writable({} as IProfile)

export {
    session,
    userRole
}