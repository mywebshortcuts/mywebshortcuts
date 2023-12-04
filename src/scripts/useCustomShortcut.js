import { getStorage, extractCoreUrl, getCompleteData, sendMsg, getWebsiteData, isObjEmpty, setStorage } from "../modules/quickMethods";


const ucs = {
    completeData: {},

    allSetShortcutsArray: [],

    currentWebsiteData: null,

    allAvailableShortcuts: {},
    allMatchedUrlsShortcutsObjects: {},

    websiteURL: '',
    currentURLObject: '',

    selectorEnabled: false,


    // Data management functions

    setCurrentURL: () => {

        let url = new URL((window.location.href).replace(/\/$/, ''))
        ucs.currentURLObject = url

        ucs.websiteURL = (ucs.websiteURL).replace(/\/$/, ''); // Replace a trailing '/' with an empty string
        ucs.websiteURL = url.href


    },

    setCompleteData: async function () {
        ucs.completeData = await getCompleteData();
    },

    updateData: function () {
        // console.log(ucs.completeData);



        // This is an important part, we are going to extract all the shortcuts from the enabled urls or the same origin
        // so that one is able to access all the shortcuts that are available for the current url, if it's matched.
        // We will extract domain, page, full path (if hash & search params exist) and custom url shortcuts and merge them into 
        // one object for the onShortcutClicker to access.

        let allMatchedUrlsShortcutsObjects = []

        // Checking for Domain
        if (ucs.completeData.websitesData[ucs.currentURLObject.origin] && !isObjEmpty(ucs.completeData.websitesData[ucs.currentURLObject.origin].shortcuts)) {

            // If the current URL is NOT just the domain, simply add the shortcuts which have domainAndAllPages as their urlType
            if (ucs.currentURLObject.pathname != '/') {

                for (const key in ucs.completeData.websitesData[ucs.currentURLObject.origin].shortcuts) {
                    if (Object.hasOwnProperty.call(ucs.completeData.websitesData[ucs.currentURLObject.origin].shortcuts, key)) {
                        const shortcutObject = ucs.completeData.websitesData[ucs.currentURLObject.origin].shortcuts[key];
                        if (shortcutObject.properties.urlType == "domainAndAllPages") {
                            allMatchedUrlsShortcutsObjects[key] = shortcutObject
                        }

                    }
                }
            }
            // If the current URL is just the domain, add all shortcuts
            else {

                for (const key in ucs.completeData.websitesData[ucs.currentURLObject.origin].shortcuts) {
                    if (Object.hasOwnProperty.call(ucs.completeData.websitesData[ucs.currentURLObject.origin].shortcuts, key)) {
                        const shortcutObject = ucs.completeData.websitesData[ucs.currentURLObject.origin].shortcuts[key];
                        allMatchedUrlsShortcutsObjects[key] = shortcutObject
                    }
                }
            }
        }

        for (let websiteURL in ucs.completeData.websitesData) {

            if (Object.hasOwnProperty.call(ucs.completeData.websitesData, websiteURL)) {
                websiteURL = websiteURL
                const websiteData = ucs.completeData.websitesData[websiteURL];
                let urlObject = new URL(websiteURL)

                // Check if the url is having the same origin, is enabled and is not just the origin
                if (urlObject.origin == ucs.currentURLObject.origin && websiteData.settings.enabled && (urlObject.pathname != '/')) {

                    // Checking for Custom URLs
                    if (/~mws-[^~]+~/.test(websiteURL)) {
                        let customURL = websiteURL

                        let customURLRegex;
                        // mws-end 
                        let endTerm = "~mws-end~";
                        if (customURL.includes(endTerm)) {
                            let endIndex = customURL.indexOf(endTerm);
                            customURL = customURL.substring(0, endIndex);
                        }
                        // mws-string 
                        let stringTerm = "~mws-string~";
                        if (customURL.includes(stringTerm)) {
                            customURLRegex = customURL.replaceAll(stringTerm, '.*')
                        }

                        let regex = new RegExp('^' + customURLRegex + "$")

                        let firstSlashIndex = customURL.lastIndexOf('/')
                        // console.log("Index of first slash: ", firstSlashIndex);
                        let urlAfterFirstSlash = customURL.substring(firstSlashIndex, customURL.length)
                        // console.log("URL after the first url: ", urlAfterFirstSlash);


                        if (regex.test(websiteURL)) {
                            // console.log(customURLRegex);
                            // console.log(regex);
                            // console.log("Matched URL:", websiteURL);

                            // allMatchedUrlsShortcutsObjects.push({ ...ucs.completeData.websitesData[websiteURL].shortcuts })
                            // addWebsiteShortcuts = true

                            if (!isObjEmpty(ucs.completeData.websitesData[websiteURL].shortcuts)) {
                                for (const key in ucs.completeData.websitesData[websiteURL].shortcuts) {
                                    if (Object.hasOwnProperty.call(ucs.completeData.websitesData[websiteURL].shortcuts, key)) {
                                        const shortcutObject = ucs.completeData.websitesData[websiteURL].shortcuts[key];
                                    }
                                }
                            }
                            continue
                        }

                    }

                    // Checking for Page
                    // console.log((ucs.currentURLObject.pathname).replace(/\/$/, '') == (urlObject.pathname).replace(/\/$/, ''));
                    if (((ucs.currentURLObject.pathname).replace(/\/$/, '') == (urlObject.pathname).replace(/\/$/, '')) && !(urlObject.hash || urlObject.search)) {
                        if (!isObjEmpty(ucs.completeData.websitesData[websiteURL].shortcuts)) {
                            for (const key in ucs.completeData.websitesData[websiteURL].shortcuts) {
                                if (Object.hasOwnProperty.call(ucs.completeData.websitesData[websiteURL].shortcuts, key)) {
                                    const shortcutObject = ucs.completeData.websitesData[websiteURL].shortcuts[key];
                                    allMatchedUrlsShortcutsObjects[key] = shortcutObject
                                }
                            }
                        }
                    }
                    // Checking for Full Path
                    if ((urlObject.hash || urlObject.search) && (ucs.currentURLObject.href == urlObject.href)) {
                        // console.log("Full Path matches");
                        if (!isObjEmpty(ucs.completeData.websitesData[websiteURL].shortcuts)) {
                            for (const key in ucs.completeData.websitesData[websiteURL].shortcuts) {
                                if (Object.hasOwnProperty.call(ucs.completeData.websitesData[websiteURL].shortcuts, key)) {
                                    const shortcutObject = ucs.completeData.websitesData[websiteURL].shortcuts[key];
                                    allMatchedUrlsShortcutsObjects[key] = shortcutObject
                                }
                            }
                        }
                    }
                }
            }
        }
        ucs.allMatchedUrlsShortcutsObjects = allMatchedUrlsShortcutsObjects

        // if (!isObjEmpty(ucs.completeData) && ucs.completeData.websitesData[ucs.websiteURL]) {
        if (!isObjEmpty(ucs.completeData)) {
            ucs.extractAndSetCurrentWebsiteData();
            return ucs.completeData
        }
    },

    extractAndSetCurrentWebsiteData: async function () {
        const data = ucs.completeData.websitesData

        ucs.currentWebsiteData = data[ucs.websiteURL] || {

            settings: {
                enabled: true,
            },
            shortcuts: { ...ucs.allMatchedUrlsShortcutsObjects }

        }


        function mergeObjects(...objects) {
            const result = {};

            objects.forEach(obj => {
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                            // If the property is an object, recursively merge it
                            result[key] = mergeObjects(result[key] || {}, obj[key]);
                        } else {
                            // Otherwise, assign the value directly
                            result[key] = obj[key];
                        }
                    }
                }
            });

            return result;
        }


        // ucs.allAvailableShortcuts = mergeObjects(...ucs.allMatchedUrlsShortcutsObjects);

        // Types of URL:
        // domainAndAllPages
        // domainAndPage
        // onlyDomain
        // onlyPage
        // fullPath
        // custom
        for (const shortcutKey in ucs.allAvailableShortcuts) {
            if (Object.hasOwnProperty.call(ucs.allAvailableShortcuts, shortcutKey)) {
                const shortcutObject = ucs.allAvailableShortcuts[shortcutKey];

                // console.log(shortcutObject);
            }
        }

        // ucs.allSetShortcutsArray = Object.keys(ucs.currentWebsiteData.shortcuts) || []
        ucs.allSetShortcutsArray = Object.keys(ucs.allMatchedUrlsShortcutsObjects) || []
        // console.log(ucs.allSetShortcutsArray);


    },


    turnOn: function () {
        // if (ucs.completeData.globalSettings.extensionEnabled && ucs.completeData.websitesData[ucs.websiteURL] && ucs.completeData.websitesData[ucs.websiteURL].settings.enabled) {
        if (ucs.completeData.globalSettings.extensionEnabled && !ucs.selectorEnabled) {
            // console.log("UCS is Enabled");

            window.addEventListener('keypress', ucs.onShortcutClicker, {
                // bubbles
            })
            window.addEventListener('keyup', ucs.onKeyUp)
        }
    },


    turnOff: function () {
        // console.log("UCS is disabled");
        window.removeEventListener('keypress', ucs.onShortcutClicker)
        window.removeEventListener('keyup', ucs.onKeyUp)
    },


    onKeyUp: (e) => {
        ucs.keyup = true
    },
    keyup: false,
    doubleKeyPress: false,
    keyPresses: 0,
    lastKey: '',

    onShortcutClicker: function (event) {
        if (ucs.selectorEnabled) {
            return
        }
        ucs.keyup = false
        const key = event.key

        if (ucs.lastKey == key) {
            this.keyPresses++
        }
        else {
            this.keyPresses = 0
        }
        setTimeout(() => {
            if (this.keyPresses > 1) {
                // console.log("Multiple times pressed");
                if (ucs.keyup) {
                    ucs.doubleKeyPress = true
                    takeAction()
                }
            }
            else {
                ucs.doubleKeyPress = false
            }
            this.keyPresses = 0
        }, 200);

        ucs.lastKey = key

        // if (!ucs.currentWebsiteData.shortcuts[event.key] || !ucs.currentWebsiteData.shortcuts[event.key].enabled) {
        //     return
        // }
        if (!ucs.allSetShortcutsArray.includes(key) || !ucs.allMatchedUrlsShortcutsObjects[key].enabled) {
            return
        }

        const activeElement = document.activeElement;

        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            // An input element is focused; don't execute your shortcut
            return;
        }
        if (activeElement && activeElement.contentEditable == "true") {
            // console.log("Content editable div detected");
            return;
        }

        function takeAction() {
            if (ucs.allSetShortcutsArray.includes(key)) {
                event.preventDefault()
                event.stopImmediatePropagation()
                event.stopPropagation()

                // ucs will change when types are added
                let elementData = ucs.allMatchedUrlsShortcutsObjects[key].selected
                let action = ucs.allMatchedUrlsShortcutsObjects[key].properties.action
                ucs.performAction(elementData, action)
            }
        }
        takeAction()

    },

    isElementFocusable: function (element) {
        // console.log(element.focusable);
        if (element.focusable) {
            return true;
        }
        // Check if the element has a tabIndex property
        // console.log(element.tabIndex >= -1);
        if (typeof element.tabIndex === 'number') {
            // Elements with a tabIndex greater than or equal to -1 are focusable
            return element.tabIndex > -1;
        }

        // If the element does not have a tabIndex property, check its nodeName
        const nodeName = element.nodeName.toLowerCase();
        const focusableNodeNames = ['a', 'button', 'input', 'select', 'textarea'];
        // const unFocusableNodeNames = ['a', 'button', 'input', 'select', 'textarea'];
        // console.log((focusableNodeNames.includes(nodeName)));
        if (focusableNodeNames.includes(nodeName)) {
            return true;
        }

    },

    // This function will recursively find a parent which is clickable in case the selected element is not
    clickOnClickableElement: function (element) {
        const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        if (element.click) {
            // console.log("Trying to click on element");
            element.dispatchEvent(clickEvent);
            // element.click()
        }
        else {
            let parentElement = element.parentElement
            if (parentElement.click) {
                // console.log("Trying to click on the parent");
                element.dispatchEvent(clickEvent);
                // parentElement.click()
            }
            else {
                ucs.clickOnClickableElement(parentElement)
            }
        }
    },

    performAction: function (elementData, action) {
        let cssSelector = ""

        // Generating a CSS Selector based on the element Attributes
        if (elementData.attributes) {
            const selector = elementData.attributes
                .map(([attr, value]) => `[${attr}="${value}"]`)
                .join('');

            // Use the JSON element's tag name and attributes to create a CSS selector
            cssSelector = elementData.tagName + selector;
        }
        // Getting CSS selector (based on positiong in DOM) directly in case the element wasn't having anything else that could help in it's indentification
        else if (elementData.cssSelector) {
            cssSelector = elementData.cssSelector
        }
        else {
            // console.log("Neither JSON Data nor CSS Selector of the element exists.");
            return false
        }

        // Find the matching element on the page
        const matchingElement = document.querySelector(`${cssSelector}`);

        // console.log(matchingElement);

        // Click the matching element if found
        if (matchingElement) {
            if (action == "click") {
                document.activeElement.blur();
                if (matchingElement.tabIndex < 0) {
                    matchingElement.tabIndex = 0
                }
                setTimeout(() => {
                    matchingElement.focus();
                }, 0);
                ucs.clickOnClickableElement(matchingElement)
            }
            else if (action == "focus") {
                document.activeElement.blur();

                // const focusEvent = new MouseEvent('focus', {
                //     view: window,
                //     bubbles: true,
                //     cancelable: true
                // });
                // matchingElement.dispatchEvent(focusEvent);
                if (matchingElement.tabIndex < 0) {
                    matchingElement.tabIndex = 0
                }
                setTimeout(() => {
                    matchingElement.focus();
                }, 0);
            }

            return true

        } else {
            // console.log("Element not found on the page.");
            return false
        }
    },


    init: async function () {
        ucs.setCurrentURL()

        let currentUrl = location.href;
        function updateDataOnURLChange() {
            if (location.href !== currentUrl) {
                // console.log('URL change detected!');
                currentUrl = location.href;
                ucs.setCurrentURL()
                ucs.updateData()

            }

        }
        setInterval(updateDataOnURLChange, 500);


        await ucs.setCompleteData()
        ucs.updateData()
        //    .then(completeData => {
        // console.log(ucs.completeData);

        // Stop if extension not enabled
        if (!ucs.completeData.globalSettings.extensionEnabled) {
            // console.log("Extension is disabled everywhere");
            ucs.turnOff()
            return
        }

        // Stop if no website shortcut added yet
        if (isObjEmpty(ucs.completeData.websitesData)) {
            // console.log("No website is added");
            return
        }

        if (ucs.currentWebsiteData) {// Continue if shortcut(s) for current Website exists

            // if (ucs.currentWebsiteData.settings.enabled) { // If current Website is enabled
            if (ucs.completeData.websitesData[ucs.currentURLObject.origin] && ucs.completeData.websitesData[ucs.currentURLObject.origin].settings.enabled) { // If current domain is enabled

                if (!ucs.selectorEnabled) { // If selector is NOT enabled
                    // console.log("Turning ON UCS");
                    ucs.turnOn()
                }
                else {
                    ucs.turnOff()
                }
                chrome.runtime.onMessage.addListener(
                    async (request, sender, sendResponse) => {
                        if (request.msg === "selectorDisabled") {
                            // console.log("Selector is Disabled, UCS is Enabled");
                            ucs.selectorEnabled = false
                            // ucs.turnOn()
                            await ucs.init()
                        }
                        else if (request.msg === "selectorEnabled") {
                            // console.log("Selector is Enabled, UCS is Disabled");
                            ucs.selectorEnabled = true
                            // ucs.turn Off()
                            await ucs.init()
                        }
                    }
                );
            }
            else {
                // console.log("Domain is disabled");
                ucs.turnOff()
            }

        }
        // })

    }


}


ucs.init()
chrome.storage.onChanged.addListener(async (changes) => {
    // console.log("UCS updating data");
    await ucs.init()
})