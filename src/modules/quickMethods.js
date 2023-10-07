
export const addClass = (element, classesArray = []) => {
    classesArray.forEach((cls) => {
        return element.classList.add(cls)
    })
}
export const rmClass = (element, classesArray = []) => {
    classesArray.forEach((cls) => {
        return element.classList.remove(cls)
    })
}
export const getElemAt = (x, y) => {
    return document.elementFromPoint(x, y)
}

export const setTextContent = (element, text = "") => {
    element.textContent = text
}
export const getTextContent = (element) => {
    return element.textContent
}

export const setInnerHTML = (element, html = "") => {
    element.innerHTML = html
}

export const getAttr = (element, attribute = "") => {
    return element.getAttribute(attribute)
}
export const setAttr = (element, attribute = "", value = "") => {
    element.setAttribute(attribute, value)
}

export const setEvent = (element, eventName = "", callbackFunc, options = {}) => {
    element.addEventListener(eventName, (e) => {
        callbackFunc(e);
    }, options)
}
export const rmEvent = (element, eventName, functionAttached, options = {}) => {
    element.removeEventListener(eventName, functionAttached, options)
}

export function qS (selector, parentElement=document){    
    return parentElement.querySelector(selector)
}


export const qSA = (selector) => {
    return document.querySelectorAll(selector)
}
export const apCh = (child) => {
    document.body.appendChild(child)
}

export const getStorage = (keys = [], returnPromise = false, area = "local") => {
    if (area == "sync") {
        return returnPromise ? chrome.storage.sync.get(keys) : chrome.storage.sync.get(keys).then((data) => data)
    }
    else if (area == "session") {
        return returnPromise ? chrome.storage.session.get(keys) : chrome.storage.session.get(keys).then((data) => data)
    }
    return returnPromise ? chrome.storage.local.get(keys) : chrome.storage.local.get(keys).then((data) => data)
}
export const setStorage = (keyValues = {}, returnPromise = false, area = "local") => {
    if (area == "sync") {
        return returnPromise ? chrome.storage.sync.set(keyValues) : chrome.storage.sync.set(keyValues).then((data) => data)
    }
    else if (area == "session") {
        return returnPromise ? chrome.storage.session.set(keyValues) : chrome.storage.session.set(keyValues).then((data) => data)
    }

    return returnPromise ? chrome.storage.local.set(keyValues) : chrome.storage.local.set(keyValues).then((data) => data)
}

export const sendMsg = async function (message) {
    const response = await chrome.runtime.sendMessage(message);
    return response
}

// export default {
//     addClass, rmClass, getElemAt, setTextContent, setInnerHTML, getAttr, setAttr, setEvent, rmEvent,
//     qS, qSA, apCh, getStorage, setStorage, sendMsg
//     // dom, doc, chromeAPI
// }
