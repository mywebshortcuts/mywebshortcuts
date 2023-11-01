import { getStorage, extractCoreUrl, getCompleteData, sendMsg, getWebsiteData, isObjEmpty, setStorage } from "../modules/quickMethods";


const ucs = {
    completeData: {},

    allSetShortcutsArray: [],

    currentWebsiteData: null,

    websiteURL: extractCoreUrl(window.location.href),

    extractAndSetCurrentWebsiteData: async function () {
        const data = ucs.completeData.websitesData

        ucs.currentWebsiteData = data[ucs.websiteURL]

        ucs.allSetShortcutsArray = Object.keys(ucs.currentWebsiteData.shortcuts) || []

    },
    turnOn: function () {
        if (ucs.completeData.globalSettings.extensionEnabled && ucs.completeData.websitesData[ucs.websiteURL] && ucs.completeData.websitesData[ucs.websiteURL].settings.enabled) {
            console.log(ucs.completeData.websitesData[ucs.websiteURL].settings.enabled);
            console.log("UCS is Enabled");

            document.addEventListener('keypress', ucs.onShortcutClicker)
        }
    },


    turnOff: function () {
        console.log("UCS is disabled");
        document.removeEventListener('keypress', ucs.onShortcutClicker)
    },



    onShortcutClicker: function (event) {
        if (!ucs.currentWebsiteData.shortcuts[event.key].enabled) {
            return            
        }
        const activeElement = document.activeElement;

        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            // An input element is focused; don't execute your shortcut
            return;
        }

        const key = event.key

        if (ucs.allSetShortcutsArray.includes(key)) {
            event.preventDefault()

            // ucs will change when types are added
            let elementData = ucs.currentWebsiteData.shortcuts[key].selected
            ucs.clickElementOnPage(elementData)
        }
    },


    // This function will recursively find a parent which is clickable in case the selected element is not
    clickOnClickableElement: function (element) {
        if (element.click) {
            console.log("Trying to click on element");
            element.click()
        }
        else {
            let parentElement = element.parentElement
            if (parentElement.click) {
                console.log("Trying to click on the parent");
                parentElement.click()
            }
            else {
                clickOnClickableElement(parentElement)
            }
        }
    },

    clickElementOnPage: function (elementData) {
        let cssSelector = ""

        console.log(elementData);

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
            console.log("Neither JSON Data nor CSS Selector of the element exists.");
            return false
        }
        console.log(cssSelector);

        // Find the matching element on the page
        const matchingElement = document.querySelector(`${cssSelector}`);

        console.log(matchingElement);

        // Click the matching element if found
        if (matchingElement) {
            // matchingElement.click();
            ucs.clickOnClickableElement(matchingElement)
            return true
        } else {
            console.log("Element not found on the page.");
            return false
        }
    },


    updateData: async function () {
        // return new Promise(async (resolve, reject) => {
        // const returnedData = await getCompleteData()
        // ucs.completeData = returnedData;
        ucs.completeData = await getCompleteData();
        console.log(ucs.completeData);
        if (!isObjEmpty(ucs.completeData) && ucs.completeData.websitesData[ucs.websiteURL]) {
            ucs.extractAndSetCurrentWebsiteData();
            // resolve(ucs.completeData);
            return ucs.completeData
        }
        // });
    },


    init: async function () {
       await ucs.updateData()
    //    .then(completeData => {
            // console.log(ucs.completeData);




            // Stop if extension not enabled
            if (!ucs.completeData.globalSettings.extensionEnabled) {
                console.log("Extension is disabled everywhere");
                ucs.turnOff()
                return
            }

            // Stop if no website shortcut added yet
            if (isObjEmpty(ucs.completeData.websitesData)) {
                console.log("No website is added");
                return
            }


            if (ucs.currentWebsiteData) {// Continue if shortcut(s) for current Website exists
                // console.log("On Current Website");

                // console.log(ucs.currentWebsiteData);
                if (ucs.currentWebsiteData.settings.enabled) { // If current Website is enabled
                    ucs.turnOn()
                    chrome.runtime.onMessage.addListener(
                        async (request, sender, sendResponse) => {
                            // console.log(sender);
                            // console.log(request);
                            if (request.spread) {
                                // console.log("Hii you just spread something");
                            }

                            if (request.msg === "selectorDisabled") {
                                ucs.turnOn()
                            }
                            else if (request.msg === "selectorEnabled") {
                                ucs.turnOff()
                            }
                            // else if (request.msg === "extensionEnabledEverywhere" || ) {
                            //     ucs.init()
                            // }
                            // else if (request.msg === "extensionDisabledEverywhere") {
                            //     ucs.init()
                            // }
                            // else if (request.msg = "dataUpdated") {
                            //     console.log("Okay bro UCS update karlega apna data");
                            //     await ucs.updateData(request.data)

                            // }
                        }
                    );
                }
                else{
                    console.log("Not enabled");
                    ucs.turnOff()
                }

            }
        // })

    }


}


ucs.init()
chrome.storage.onChanged.addListener(async (changes) => {
    console.log("UCS updating data");
    await ucs.init()
})