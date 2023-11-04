import "../forExtensionPages.css"
import "./style.css"


import { extractCoreUrl, qS, sendMsg, setEvent, setTextContent, setStorage, updateCSS, switchClass, getCompleteData, isObjEmpty, qSA } from "../modules/quickMethods"


import "../assets/font-awesome/css/fontawesome.css"
import "../assets/font-awesome/css/solid.css"

const pop = {
    currentTab: "",
    currentTabURL: "",

    completeData: {},


    globalSettings: {},
    currentWebsiteData: {},
    currentWebsiteSettings: {},

    currentWebsiteShortcutsData: {},


    startSelection: async function () {

        console.log("Starting selection");

        await sendMsg({ action: "turnOnSelector", tab: pop.currentTab })

        window.close()

    },

    openOptionsPage: () => {
        chrome.runtime.openOptionsPage();
    },

    updateData: async () => {
        pop.globalSettings = pop.completeData.globalSettings || {}
        console.log(pop.globalSettings);
        pop.currentWebsiteData = pop.completeData.websitesData[pop.currentTabURL] || {}
        console.log(pop.currentWebsiteData);
        console.log(isObjEmpty(pop.currentWebsiteData));
        if (!isObjEmpty(pop.currentWebsiteData)) {
            pop.currentWebsiteSettings = pop.completeData.websitesData[pop.currentTabURL].settings || {}
            console.log(pop.currentWebsiteSettings);
            pop.currentWebsiteShortcutsData = pop.completeData.websitesData[pop.currentTabURL].shortcuts || {}
            console.log(pop.currentWebsiteShortcutsData);
        }
        pop.updateDOM()
    },

    getCompleteData: async () => {
        pop.completeData = await getCompleteData()

        console.log(pop.completeData);

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
        pop.completeData.websitesData[pop.currentTabURL].settings.enabled = !pop.completeData.websitesData[pop.currentTabURL].settings.enabled


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



    enableDisableForShortcut: async (event, toggleElement) => {
        const key = toggleElement.getAttribute('data-shortcutKey')
        // If it's true make it false, and vice versa...
        pop.completeData.websitesData[pop.currentTabURL].shortcuts[key].enabled = !pop.completeData.websitesData[pop.currentTabURL].shortcuts[key].enabled



        await setStorage({ ...pop.completeData })

        await pop.getCompleteData()

    },



    createShortcutDivs: () => {
        const templateElement = document.querySelector('.shortcutDivTemplate')
        let template = templateElement.content.cloneNode(true)

        const shortcutsListDiv = qS('.shortcutsListDiv')

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
                shortcutDiv.querySelector(".shortcutKey").textContent = key
                shortcutDiv.querySelector(".shortcutEnableDisableToggle-wrapper .toggleSwitchInput").setAttribute('data-shortcutKey', key)
                shortcutDiv.querySelector(".shortcutEnableDisableToggle-wrapper .toggleSwitchInput").checked = eachShortcutData.enabled


                shortcutsListDiv.appendChild(shortcutDiv)

                let shortcutEnableDisableToggle = shortcutsListDiv.querySelector(`.shortcutEnableDisableToggle-wrapper .toggleSwitchInput[data-shortcutKey='${key}']`)

                setEvent(shortcutEnableDisableToggle, "click", (e) => {
                    pop.enableDisableForShortcut(e, shortcutEnableDisableToggle)
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
        
        if (!isObjEmpty(pop.currentWebsiteData)) {
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
                pop.currentTabURL = extractCoreUrl(pop.currentTab.url);

                // console.log(pop.currentTab);
                // console.log(pop.currentTabURL);

            }
        })
    },

    init: async function () {
        console.log("Popup opened");

        await pop.setActiveTabData()

        await pop.getCompleteData()

        // pop.updateDOM()

        setEvent(qS('.startSelectionButton'), "click", pop.startSelection)

        setEvent(qS('.disableEverywhereToggle-wrapper .toggleSwitchInput'), "change", pop.enableDisableEverwhere)
        setEvent(qS('.disableWebsiteToggle-wrapper .toggleSwitchInput'), "change", pop.enableDisableForWebsite)

        const openOptionsButton = document.querySelector('.openOptionsButton');

        openOptionsButton.addEventListener('click', pop.openOptionsPage);
    }


}

pop.init()


chrome.storage.onChanged.addListener(async (changes) => {
    console.log("Popup updating data");
    await pop.getCompleteData()
})