import "../forExtensionPages.css"
import "./style.css"


import { extractCoreUrl, qS, sendMsg, setEvent, setTextContent, setStorage, updateCSS, switchClass, getCompleteData, isObjEmpty } from "../modules/quickMethods"


const pop = {
    currentTab: "",
    currentTabURL: "",

    completeData: {},


    globalSettings: {},
    currentWebsiteData: null,
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

    updateData: () => {
        pop.globalSettings = pop.completeData.globalSettings || {}
        pop.currentWebsiteData = pop.completeData.websitesData[pop.currentTabURL] || null
        if (pop.currentWebsiteData) {
            pop.currentWebsiteSettings = pop.completeData.websitesData[pop.currentTabURL].settings || {}
            pop.currentWebsiteShortcutsData = pop.completeData.websitesData[pop.currentTabURL].shortcuts || {}
        }
        pop.updateDOM()
    },

    getCompleteData: async () => {
        pop.completeData = await getCompleteData()

        pop.updateData()
    },

    enableDisableEverwhere: async () => {
        // If it's true make it false, and vice versa...
        pop.completeData.globalSettings.extensionEnabled = !pop.completeData.globalSettings.extensionEnabled

        await setStorage({ ...pop.completeData })

        await pop.getCompleteData()
        pop.updateDOM()
        if (pop.completeData.globalSettings.extensionEnabled) {
            sendMsg({ msg: "extensionEnabledEverywhere", spread:true, tab: pop.currentTab })
        }
        else{
            sendMsg({ msg: "extensionDisabledEverywhere", spread:true, tab: pop.currentTab })
        }

    },

    

    createShortcutDivs: ()=>{
        const templateElement = document.querySelector('.shortcutDivTemplate')
        console.log(templateElement);
        let template = templateElement.content.cloneNode(true)

        const shortcutsListDiv = qS('.shortcutsListDiv')
        // console.log(shortcutsListDiv.children);
        console.log(shortcutsListDiv.children.length);

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

                console.log(eachShortcutData);
                console.log(eachShortcutData.enabled);

                console.log(template);
                console.log(template.querySelector(".shortcutName"));

                shortcutDiv.querySelector(".shortcutName").textContent = eachShortcutData.name
                shortcutDiv.querySelector(".shortcutKey").textContent = key
                shortcutDiv.querySelector(".shortcutEnableDisableButton").textContent = eachShortcutData.enabled ? "On" : "Off"

                shortcutsListDiv.appendChild(shortcutDiv)

                console.log("Shortcut Data",eachShortcutData);
                
            }
        }

        // console.log(template);
        // console.log(template.querySelector('.shortcutName'));
    },

    updateDOM: () => {
        if (!pop.currentWebsiteData) {
            // updateCSS(qS('.activeWebsiteShortcutsDiv'), { display: "none" })
        }
        if (!pop.globalSettings.extensionEnabled) {
            setTextContent(qS('.disableEverywhereButton'), "Enable Everwhere")
            switchClass(qS('.disableEverywhereButton'), "redButton", "greenButton")
            console.log("extension disabled");
        }
        else {
            setTextContent(qS('.disableEverywhereButton'), "Disable Everwhere")
            switchClass(qS('.disableEverywhereButton'), "greenButton", "redButton")
            console.log("extension enabled");
        }

        if (!isObjEmpty(pop.currentWebsiteShortcutsData)) {
            console.log("shortcuts are set!");
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

                console.log(pop.currentTab);
                console.log(pop.currentTabURL);

            }
        })
    },

    init: async function () {
        console.log("Popup opened");

        await pop.setActiveTabData()

        await pop.getCompleteData()

        pop.updateDOM()

        setEvent(qS('.startSelectionButton'), "click", pop.startSelection)
        setEvent(qS('.disableEverywhereButton'), "click", pop.enableDisableEverwhere)

        const openOptionsButton = document.querySelector('.openOptionsButton');

        openOptionsButton.addEventListener('click', pop.openOptionsPage);
    }


}

pop.init()


chrome.storage.onChanged.addListener(async (changes) => {
    console.log("Popup updating data");
    await pop.getCompleteData()
})