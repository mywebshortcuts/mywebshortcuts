import "../forExtensionPages.css"
import "./style.css"


import { extractCoreUrl, qS, sendMsg, setEvent, setTextContent, setStorage, updateCSS, switchClass, getCompleteData, isObjEmpty, qSA, setAttr, setInnerHTML } from "../modules/quickMethods"


import "../assets/font-awesome/css/fontawesome.css"
import "../assets/font-awesome/css/solid.css"

const pop = {
    currentTab: "",
    currentTabURL: "",
    currentTabURLObject: "",

    completeData: {},


    globalSettings: {},
    currentWebsiteData: {},
    currentWebsiteSettings: {},

    currentWebsiteShortcutsData: {},


    startSelection: async function () {
        pop.playSoundEffect('click2')

        setTimeout(async () => {
            // console.log("Starting selection");
    
            await sendMsg({ action: "turnOnSelector", tab: pop.currentTab })
    
            window.close()
            
        }, 200);

    },

    openOptionsPage: (e) => {
        // pop.playSoundEffect('gear', 0.5)
        pop.playSoundEffect('click2', 0.5)

        e.srcElement.textContent = "Opening Options Page..."
        setTimeout(() => {
            chrome.runtime.openOptionsPage();
        }, 200);
    },

    updateData: async () => {
        pop.globalSettings = pop.completeData.globalSettings || {}
        pop.currentWebsiteData = pop.completeData.websitesData[pop.currentTabURLObject.origin] || {}



        // This is an important part, we are going to extract all the shortcuts from the enabled urls or the same origin
        // so that one is able to access all the shortcuts that are available for the current url, if it's matched.
        // We will extract domain, page, full path (if hash & search params exist) and custom url shortcuts and merge them into 
        // one object for the onShortcutClicker to access.

        let allMatchedUrlsShortcutsObjects = []

        // Checking for Domain
        if (pop.completeData.websitesData[pop.currentTabURLObject.origin] && !isObjEmpty(pop.completeData.websitesData[pop.currentTabURLObject.origin].shortcuts)) {

            // If the current URL is NOT just the domain, simply add the shortcuts which have domainAndAllPages as their urlType
            if (pop.currentTabURLObject.pathname != '/') {

                for (const key in pop.completeData.websitesData[pop.currentTabURLObject.origin].shortcuts) {
                    if (Object.hasOwnProperty.call(pop.completeData.websitesData[pop.currentTabURLObject.origin].shortcuts, key)) {
                        let shortcutObject = pop.completeData.websitesData[pop.currentTabURLObject.origin].shortcuts[key];
                        shortcutObject.properties.url = pop.currentTabURLObject.origin
                        if (shortcutObject.properties.urlType == "domainAndAllPages") {
                            allMatchedUrlsShortcutsObjects[key] = shortcutObject
                        }

                    }
                }
            }
            // If the current URL is just the domain, add all shortcuts
            else {

                for (const key in pop.completeData.websitesData[pop.currentTabURLObject.origin].shortcuts) {
                    if (Object.hasOwnProperty.call(pop.completeData.websitesData[pop.currentTabURLObject.origin].shortcuts, key)) {
                        let shortcutObject = pop.completeData.websitesData[pop.currentTabURLObject.origin].shortcuts[key];
                        shortcutObject.properties.url = pop.currentTabURLObject.origin
                        allMatchedUrlsShortcutsObjects[key] = shortcutObject
                    }
                }
            }
        }

        for (let websiteURL in pop.completeData.websitesData) {

            if (Object.hasOwnProperty.call(pop.completeData.websitesData, websiteURL)) {
                websiteURL = websiteURL
                const websiteData = pop.completeData.websitesData[websiteURL];
                let urlObject = new URL(websiteURL)

                // Check if the url is having the same origin, is enabled and is not just the origin
                if (urlObject.origin == pop.currentTabURLObject.origin && (urlObject.pathname != '/')) {

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

                            // allMatchedUrlsShortcutsObjects.push({ ...pop.completeData.websitesData[websiteURL].shortcuts })
                            // addWebsiteShortcuts = true

                            if (!isObjEmpty(pop.completeData.websitesData[websiteURL].shortcuts)) {
                                for (const key in pop.completeData.websitesData[websiteURL].shortcuts) {
                                    if (Object.hasOwnProperty.call(pop.completeData.websitesData[websiteURL].shortcuts, key)) {
                                        const shortcutObject = pop.completeData.websitesData[websiteURL].shortcuts[key];
                                        shortcutObject.properties.url = websiteURL
                                        allMatchedUrlsShortcutsObjects[key] = shortcutObject
                                    }
                                }
                            }
                            continue
                        }

                    }

                    // Checking for Page
                    // // console.log((pop.currentTabURLObject.pathname).replace(/\/$/, '') == (urlObject.pathname).replace(/\/$/, ''));
                    if (((pop.currentTabURLObject.pathname).replace(/\/$/, '') == (urlObject.pathname).replace(/\/$/, '')) && !(urlObject.hash || urlObject.search)) {
                        if (!isObjEmpty(pop.completeData.websitesData[websiteURL].shortcuts)) {
                            for (const key in pop.completeData.websitesData[websiteURL].shortcuts) {
                                if (Object.hasOwnProperty.call(pop.completeData.websitesData[websiteURL].shortcuts, key)) {
                                    const shortcutObject = pop.completeData.websitesData[websiteURL].shortcuts[key];
                                    shortcutObject.properties.url = websiteURL
                                    allMatchedUrlsShortcutsObjects[key] = shortcutObject
                                }
                            }
                        }
                    }
                    // Checking for Full Path
                    if ((urlObject.hash || urlObject.search) && (pop.currentTabURLObject.href == urlObject.href)) {
                        // console.log("Full Path matches");
                        if (!isObjEmpty(pop.completeData.websitesData[websiteURL].shortcuts)) {
                            for (const key in pop.completeData.websitesData[websiteURL].shortcuts) {
                                if (Object.hasOwnProperty.call(pop.completeData.websitesData[websiteURL].shortcuts, key)) {
                                    const shortcutObject = pop.completeData.websitesData[websiteURL].shortcuts[key];
                                    shortcutObject.properties.url = websiteURL
                                    allMatchedUrlsShortcutsObjects[key] = shortcutObject
                                }
                            }
                        }
                    }
                }
            }
        }
        pop.allMatchedUrlsShortcutsObjects = allMatchedUrlsShortcutsObjects
        // console.log(allMatchedUrlsShortcutsObjects);



        if (!isObjEmpty(pop.currentWebsiteData)) {
            pop.currentWebsiteSettings = pop.completeData.websitesData[pop.currentTabURLObject.origin].settings || {}
            // pop.currentWebsiteShortcutsData = pop.completeData.websitesData[pop.currentTabURL].shortcuts || {}
        }
        pop.currentWebsiteShortcutsData = pop.allMatchedUrlsShortcutsObjects || {}


        

        pop.updateDOM()
    },

    getCompleteData: async () => {
        pop.completeData = await getCompleteData()

        // console.log(pop.completeData);

        await pop.updateData()
    },

    enableDisableEverwhere: async () => {
        // If it's true make it false, and vice versa...
        pop.completeData.globalSettings.extensionEnabled = !pop.completeData.globalSettings.extensionEnabled

        await setStorage({ ...pop.completeData })

        await pop.getCompleteData()
        if (pop.completeData.globalSettings.extensionEnabled) {
            sendMsg({ msg: "extensionEnabledEverywhere", spread: true, tab: pop.currentTab })
        }
        else {
            sendMsg({ msg: "extensionDisabledEverywhere", spread: true, tab: pop.currentTab })
        }

    },


    enableDisableForWebsite: async () => {
        // If it's true make it false, and vice versa...
        pop.completeData.websitesData[pop.currentTabURLObject.origin].settings.enabled = !pop.completeData.websitesData[pop.currentTabURLObject.origin].settings.enabled


        await setStorage({ ...pop.completeData })

        await pop.getCompleteData()
        // pop.updateDOM()
        if (pop.currentWebsiteData.settings.enabled) {
            sendMsg({ msg: "extensionEnabledForWebsite", spread: true, tab: pop.currentTab })
        }
        else {
            sendMsg({ msg: "extensionDisabledForWebsite", spread: true, tab: pop.currentTab })
        }

    },



    enableDisableForShortcut: async (event, toggleElement, urlOfShortcut) => {
        const key = toggleElement.getAttribute('data-shortcutKey')
        // If it's true make it false, and vice versa...
        pop.completeData.websitesData[urlOfShortcut].shortcuts[key].enabled = !pop.completeData.websitesData[urlOfShortcut].shortcuts[key].enabled

        await setStorage({ ...pop.completeData })

        await pop.getCompleteData()

    },


    prevAudio: '',
    playSoundEffect: function (soundEffectName = 'click', volume = 1) {
        if (!pop.completeData.globalSettings.optionsPageSettings.optionsPageSoundsEnabled) {
            return
        }
        let audio;

        if (pop.prevAudio && audio.src == pop.prevAudio.src) {
            audio = pop.prevAudio
        }
        else {
            let audioFileLink = chrome.runtime.getURL(`src/assets/sounds/${soundEffectName}.mp3`);
            audio = new Audio(audioFileLink)
        }
        audio.currentTime = 0; // Reset the audio to the beginning
        audio.volume = volume
        audio.play(); // Play the audio file
    },


    createShortcutDivs: () => {
        const templateElement = document.querySelector('.shortcutDivTemplate')
        let template = templateElement.content.cloneNode(true)

        const shortcutsListDiv = qS('.shortcutsListDiv')
        if ((Object.keys(pop.currentWebsiteShortcutsData)).length > 0) {
            const numOfShortcuts = qS('.numOfShortcuts')
            numOfShortcuts.innerText = `(${(Object.keys(pop.currentWebsiteShortcutsData)).length})`
        }

        // Remove all the existing shortcut divs and create new ones (ignoring the one inside template as it's needed)
        function removeChildrenExceptTemplate(element) {
            const children = element.children;

            for (let i = children.length - 1; i >= 0; i--) {
                const child = children[i];

                // Check if the child does not have the class 'shortcutDivTemplate'
                if (child !== templateElement) {
                    element.removeChild(child);
                }
            }
        }
        if (shortcutsListDiv.children.length > 0) {
            removeChildrenExceptTemplate(shortcutsListDiv);
        }

        let shortcutsData = pop.currentWebsiteShortcutsData

        for (const key in shortcutsData) {
            if (Object.hasOwnProperty.call(shortcutsData, key)) {
                let shortcutDiv = templateElement.content.cloneNode(true)

                let eachShortcutData = shortcutsData[key];

                shortcutDiv.querySelector(".shortcutName").textContent = eachShortcutData.name
                shortcutDiv.querySelector(".shortcutNameDiv").title = eachShortcutData.name
                
                if ((eachShortcutData.name).length > 10) {
                    shortcutDiv.querySelector(".shortcutName").textContent = (eachShortcutData.name).substring(0, 7) + '...'
                }

                shortcutDiv.querySelector(".shortcutKey").textContent = key
                shortcutDiv.querySelector(".shortcutKeyDiv").title = key
                shortcutDiv.querySelector(".shortcutEnableDisableToggle-wrapper .toggleSwitchInput").setAttribute('data-shortcutKey', key)
                shortcutDiv.querySelector(".shortcutEnableDisableToggle-wrapper .toggleSwitchInput").checked = eachShortcutData.enabled

                const urlOfShortcut = eachShortcutData.properties.url

                const optionsPageURL = chrome.runtime.getURL('src/options/options.html');


                let shortcutSettingsURL = `${optionsPageURL}?url=${urlOfShortcut}#${key}`
                
                if (eachShortcutData.properties.urlType == "domainAndAllPages") {
                    // console.log("It's a domainAndAllPages");
                    // shortcutSettingsURL = `${optionsPageURL}?url=${pop.currentTabURLObject.origin}#${key}`
                    shortcutSettingsURL = `${optionsPageURL}?url=${urlOfShortcut}#${key}`
                }
                
                const shortcutDivElement = qS('.shortcutDiv', shortcutDiv)
                setAttr(shortcutDivElement, 'data-shortcutSettingsURL', shortcutSettingsURL)

                const shortcutNameElement = qS('.shortcutName', shortcutDiv)
                const shortcutKeyDivElement = qS('.shortcutKeyDiv', shortcutDiv)

                setEvent(shortcutNameElement, "click", (e) => {
                    chrome.tabs.create({ url: shortcutSettingsURL }, (newTab) => {
                        // console.log("New tab created with ID:", newTab.id);
                    });
                })
                setEvent(shortcutKeyDivElement, "click", (e) => {
                    chrome.tabs.create({ url: shortcutSettingsURL }, (newTab) => {
                        // console.log("New tab created with ID:", newTab.id);
                    });
                })

                shortcutDivElement.addEventListener('mouseenter',(e)=>{
                    // console.log(e);
                    // console.log(e.fromElement);
                    if (!(e.fromElement.classList.contains('toggleSwitchSpan'))) {
                        pop.playSoundEffect('hover')
                    }
                })

                let toggleSwitchInput = qS('.toggleSwitchInput', shortcutDivElement)
                toggleSwitchInput.addEventListener('change', (e) => {
                    if (e.srcElement.checked) {
                        pop.playSoundEffect('switchOn')
                    }
                    else {
                        pop.playSoundEffect('switchOff')
                    }
                })

                shortcutsListDiv.appendChild(shortcutDiv)
                let shortcutEnableDisableToggle = shortcutsListDiv.querySelector(`.shortcutEnableDisableToggle-wrapper .toggleSwitchInput[data-shortcutKey='${key}']`)

                setEvent(shortcutEnableDisableToggle, "click", (e) => {
                    pop.enableDisableForShortcut(e, shortcutEnableDisableToggle, urlOfShortcut)
                })
            }
        }
    },

    updateDOM: () => {
        if (isObjEmpty(pop.currentWebsiteData)) {
            updateCSS(qS('.disableForThisSiteToggleWithText-wrapper'), { display: "none" })
            updateCSS(qS('.disableEverywhereToggleWithText-wrapper'), { "border-radius": "1rem" })
        }
        if (!pop.globalSettings.extensionEnabled) {
            qS('.disableEverywhereToggle-wrapper .toggleSwitchInput').checked = !pop.globalSettings.extensionEnabled
        }
        else {
            qS('.disableEverywhereToggle-wrapper .toggleSwitchInput').checked = !pop.globalSettings.extensionEnabled
        }

        if (!isObjEmpty(pop.currentWebsiteShortcutsData)) {
            if (!pop.currentWebsiteData.settings.enabled) {
                qS('.disableWebsiteToggle-wrapper .toggleSwitchInput').checked = !pop.currentWebsiteData.settings.enabled
            }
            else {
                qS('.disableWebsiteToggle-wrapper .toggleSwitchInput').checked = !pop.currentWebsiteData.settings.enabled
            }
            // }
        }
        if (!isObjEmpty(pop.currentWebsiteShortcutsData)) {
            if (qS('.displayMessageDiv')) {
                qS('.displayMessageDiv').remove()
            }
            pop.createShortcutDivs()
        }

    },

    setActiveTabData: async function () {

        await chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs && tabs[0]) {
                pop.currentTab = tabs[0];

                let url = new URL((pop.currentTab.url).replace(/\/$/, ''))
                pop.currentTabURLObject = url
                pop.currentTabURL = (pop.currentTab.url).replace(/\/$/, '')

                // pop.currentTabURL = (pop.currentTab.url).replace(hash, "");
                pop.currentTabURL = (pop.currentTabURL).replace(/\/$/, ''); // Replace a trailing '/' with an empty string
                // console.log(pop.currentTabURL);

                // // console.log(pop.currentTab);
                // // console.log(pop.currentTabURL);

            }
        })
    },

    init: async function () {
        // console.log("Popup opened");

        await pop.setActiveTabData()

        await pop.getCompleteData()

        // pop.updateDOM()

        setEvent(qS('.startSelectionButton'), "click", pop.startSelection)

        setEvent(qS('.startSelectionButton'), "mouseenter",(e)=>{
            pop.playSoundEffect('hover')
        })

        setEvent(qS('.disableEverywhereToggle-wrapper .toggleSwitchInput'), "change", pop.enableDisableEverwhere)
        setEvent(qS('.disableWebsiteToggle-wrapper .toggleSwitchInput'), "change", pop.enableDisableForWebsite)
        setInnerHTML(qS('.disableForThisSiteToggleWithText-wrapper .disableWebsiteSpan'), `Disable for domain <em>${(pop.currentTabURLObject.origin).replace(/^(https?|ftp):\/\//, '')}</em>`)

        qSA('.disableButtonsDiv .toggleSwitchInput').forEach(toggleSwitchInput=>{
            toggleSwitchInput.addEventListener('change', (e) => {
                if (e.srcElement.checked) {
                    pop.playSoundEffect('switchOn')
                }
                else{
                    pop.playSoundEffect('switchOff')
                }
            })

        })


        const openOptionsButton = document.querySelector('.openOptionsButton');

        openOptionsButton.addEventListener('click', pop.openOptionsPage);
        openOptionsButton.addEventListener('mouseenter', ()=>{
            // this.playSoundEffect('hover', 0.5)
            pop.playSoundEffect('gear', 0.5)
        });
    }


}

pop.init()


chrome.storage.onChanged.addListener(async (changes) => {
    // console.log("Popup updating data");
    await pop.setActiveTabData()
    await pop.getCompleteData()
})

