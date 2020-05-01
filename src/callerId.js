import uniqid from "uniqid"

export function getCallerId() {
    // let callerId = window.localStorage.getItem('caller-id')
    // if (!callerId) {
    //     callerId = uniqid()
    //     window.localStorage.setItem('caller-id', callerId)
    // }
    // return callerId
    return window.location.search
}
