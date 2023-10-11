import "../forExtensionPages.css"
import "./style.css"


import { extractCoreUrl, qS, sendMsg, setEvent, setTextContent, setStorage, updateCSS, switchClass, getCompleteData, isObjEmpty, qSA } from "../modules/quickMethods"


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
        if (pop.completeData.globalSettings.extensionEnabled) {
            sendMsg({ msg: "extensionEnabledEverywhere", spread:true, tab: pop.currentTab })
        }
        else{
            sendMsg({ msg: "extensionDisabledEverywhere", spread:true, tab: pop.currentTab })
        }

    },

    
    enableDisableForWebsite: async () => {
        // If it's true make it false, and vice versa...
        pop.completeData.websitesData[pop.currentTabURL].settings.enabled = !pop.completeData.websitesData[pop.currentTabURL].settings.enabled


        await setStorage({ ...pop.completeData })

        await pop.getCompleteData()
        // pop.updateDOM()
        if (pop.currentWebsiteData.settings.enabled) {
            sendMsg({ msg: "extensionEnabledForWebsite", spread:true, tab: pop.currentTab })
        }
        else{
            sendMsg({ msg: "extensionDisabledForWebsite", spread:true, tab: pop.currentTab })
        }

    },

    
    
    enableDisableForShortcut: async (event, buttonElement) => {
        console.log(buttonElement);

        const key = buttonElement.getAttribute('data-shortcutKey')
        // If it's true make it false, and vice versa...
        pop.completeData.websitesData[pop.currentTabURL].shortcuts[key].enabled = !pop.completeData.websitesData[pop.currentTabURL].shortcuts[key].enabled



        await setStorage({ ...pop.completeData })

        await pop.getCompleteData()

    },

    

    createShortcutDivs: ()=>{
        const templateElement = document.querySelector('.shortcutDivTemplate')
        // console.log(templateElement);
        let template = templateElement.content.cloneNode(true)

        const shortcutsListDiv = qS('.shortcutsListDiv')
        // console.log(shortcutsListDiv.children);
        // console.log(shortcutsListDiv.children.length);

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
                shortcutDiv.querySelector(".shortcutEnableDisableButton").textContent = eachShortcutData.enabled ? "On" : "Off"
                shortcutDiv.querySelector(".shortcutEnableDisableButton").classList.add(eachShortcutData.enabled ? "greenButtonFilled" : "redButtonFilled")
                console.log(shortcutDiv.querySelector(".shortcutEnableDisableButton"));
                shortcutDiv.querySelector(".shortcutEnableDisableButton").setAttribute('data-shortcutKey', key)

                
                shortcutsListDiv.appendChild(shortcutDiv)

                let shortcutEnableDisableButton = shortcutsListDiv.querySelector(`.shortcutEnableDisableButton[data-shortcutKey='${key}']`)

                setEvent(shortcutEnableDisableButton, "click", (e) => {
                    // let classToRemove = eachShortcutData.enabled ? "greenButtonFilled" : "redButtonFilled"
                    // let classToAdd = eachShortcutData.enabled ? "redButtonFilled" : "greenButtonFilled"
                    
                    // console.log(classToAdd);
                    // console.log(classToRemove);
                    
                    // switchClass(shortcutEnableDisableButton, classToRemove, classToAdd)

                    // console.log(shortcutEnableDisableButton);
                    pop.enableDisableForShortcut(e, shortcutEnableDisableButton)
                })
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
            console.log("extension disabled everywhere");
        }
        else {
            setTextContent(qS('.disableEverywhereButton'), "Disable Everwhere")
            switchClass(qS('.disableEverywhereButton'), "greenButton", "redButton")
            console.log("extension enabled everywhere");
        }
        // if (pop.currentWebsiteData[pop.currentTabURL]) {
        if (pop.currentWebsiteData && !pop.currentWebsiteData.settings.enabled) {
                setTextContent(qS('.disableCurrentWebsiteButton'), "Enable For this website")
                switchClass(qS('.disableCurrentWebsiteButton'), "redButton", "greenButton")
                console.log("extension disabled on website");
            }
            else {
                setTextContent(qS('.disableCurrentWebsiteButton'), "Disable for this Website")
                switchClass(qS('.disableCurrentWebsiteButton'), "greenButton", "redButton")
                console.log("extension enabled on website");
            }
        // }

        if (!isObjEmpty(pop.currentWebsiteShortcutsData)) {
            // console.log("shortcuts are set!");
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

        // pop.updateDOM()

        setEvent(qS('.startSelectionButton'), "click", pop.startSelection)
        setEvent(qS('.disableEverywhereButton'), "click", pop.enableDisableEverwhere)
        setEvent(qS('.disableCurrentWebsiteButton'), "click", pop.enableDisableForWebsite)


        const openOptionsButton = document.querySelector('.openOptionsButton');

        openOptionsButton.addEventListener('click', pop.openOptionsPage);
    }


}

pop.init()


chrome.storage.onChanged.addListener(async (changes) => {
    console.log("Popup updating data");
    await pop.getCompleteData()
})