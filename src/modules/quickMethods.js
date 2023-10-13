
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

export const switchClass = (element, classToRemove, classToAdd) => {
    rmClass(element, [classToRemove])
    addClass(element, [classToAdd])

}

export const getElemAt = (x, y) => {
    return document.elementFromPoint(x, y)
}

export const setTextContent = (element, text = "") => {
    if (element) {
        element.textContent = text
    }
}
export const getTextContent = (element) => {
    return element.textContent
}

export const updateCSS = (element, cssObject = {}) => {
    // element.style.cssText = cssText

    for (const key in cssObject) {
        if (Object.hasOwnProperty.call(cssObject, key)) {
            const value = cssObject[key];

            // console.log(`${key}: ${value};`);
            element.style.cssText += `${key}: ${value};`

        }
    }
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
    element.addEventListener(eventName, callbackFunc, options)
}
export const rmEvent = (element, eventName, functionAttached, options = {}) => {
    element.removeEventListener(eventName, functionAttached, options)
}

export function qS(selector, parentElement = document) {
    if (selector) {
        return parentElement.querySelector(selector)
    }
}


export const qSA = (selector) => {
    return document.querySelectorAll(selector)
}
export const apCh = (child) => {
    document.body.appendChild(child)
}

export const isObjEmpty = (obj)=>{
    return Object.keys(obj).length === 0
}




// CHROME API

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
    console.log(keyValues);
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

export const setBadgeText = async function (tab, text) {
    await chrome.action.setBadgeText({
        tabId: tab.id,
        text: text
    });
}

export const getBadgeText = async function (tab) {
    await chrome.action.getBadgeText({ tabId: tab.id });
}


export const extractCoreUrl = function (url) {
    // Create a URL object to parse the input URL
    const urlObject = new URL(url);

    // Extract the protocol, host, and path (e.g., "https://www.google.com/search")
    const coreUrlWithPath = urlObject.origin;

    // Return the core URL with path without unnecessary query parameters
    return coreUrlWithPath;
}


export const getWebsiteData = function (websiteURL="", allWebsitesData={}){
    return allWebsitesData[websiteURL]
}


export const getCompleteData = async function (returnPromise = false, area = 'local') {
    return await getStorage(null, returnPromise, area)
}

// export default {
//     addClass, rmClass, getElemAt, setTextContent, setInnerHTML, getAttr, setAttr, setEvent, rmEvent,
//     qS, qSA, apCh, getStorage, setStorage, sendMsg
//     // dom, doc, chromeAPI
// }
