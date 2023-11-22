// import {bro} from "../scripts/main";

import { getCompleteData, getStorage, isObjEmpty, sendMsg, setStorage } from '../modules/quickMethods';
import setter from '../scripts/setter?script'

// import '../scripts/styles/root.css'
// import '../scripts/styles/keySelector.css'
// import '../scripts/styles/elementSelector.css'

const bg = {
    completeData: {
        websitesData: {},

        globalSettings: {
            extensionEnabled: true,
            darkMode: true,
            optionsPageSettings: {
                optionsPageSoundsEnabled: true,
                optionsPageLights: { overlayOpactiy: 0, left: true, right: true }
            },
        }
    },

    currentState: {
        selectorEnabledTabsIDArray: [],
    },


    turnOffSelector: function (tab) {
        chrome.tabs.sendMessage(tab.id, { action: "turnOffSelector" })
    },

    turnOnSelector: function (tabID) {
        // chrome.scripting.insertCSS({
        //     target: { tabId: tabID }, // Specify the tab where you want to inject CSS
        //     files: ["../scripts/styles/root.css", "../scripts/styles/keySelector.css", "../scripts/styles/elementSelector.css"],     // Specify the CSS file(s) to inject
        // })
        chrome.scripting.executeScript({
            target: { tabId: tabID },
            files: [setter]
        })
        chrome.tabs.sendMessage(tabID, { action: "turnOnSelector" });
    },

    getCompleteDataInBackground: async function () {
        const data = await getCompleteData()
        // // console.log(data);
        if (isObjEmpty(data)) {
            await setStorage({ ...bg.completeData })
        }
        else {
            bg.completeData = data
        }
        console.log(bg.completeData);
    },

    onDataUpdate: async function () {
        await bg.getCompleteDataInBackground()

        // await sendMsg({ msg: "dataUpdated", data: bg.completeData })

    },
    init: async function () {

        await bg.getCompleteDataInBackground()

        chrome.runtime.onInstalled.addListener(details => {
            if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
                chrome.runtime.setUninstallURL('https://mywebshortcuts.xyz/installed');
            }
        })


        chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {

            if (request.msg === "selectorDisabled") {
                // console.log("selector Disabled");
                // console.log(request);
                // console.log(sender);

                let shortcutIndex = bg.currentState.selectorEnabledTabsIDArray.indexOf(sender.tab.id);
                bg.currentState.selectorEnabledTabsIDArray.splice(shortcutIndex, 1);
            }
            else if (request.msg === "selectorEnabled") {
                // console.log("selector enabled");
                // console.log(request);
                // console.log(sender);

                bg.currentState.selectorEnabledTabsIDArray.push(sender.tab.id)

            }
            if (request.spread) {
                // console.log("Spreading");
                await chrome.tabs.sendMessage(sender.tab.id, request);
            }

            if (request.msg = "sendCompleteData") {
                // console.log("Something asked for data: ", bg.completeData);
                await bg.onDataUpdate()
                await sendResponse(bg.completeData)
            }
            if (request.action == "turnOffSelector") {
                bg.turnOffSelector(request.tab)
            }
            else if (request.action == "turnOnSelector") {
                if (!bg.currentState.selectorEnabledTabsIDArray.includes(request.tab.id)) {
                    bg.turnOnSelector(request.tab.id)
                }
            }
        }
        )

    }
}

chrome.storage.onChanged.addListener(async (changes) => {
    await bg.onDataUpdate()
})
chrome.commands.onCommand.addListener(async (command) => {
    // console.log(`Command: ${command}`);
    if (command = "startSelection") {

        await chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs && tabs[0]) {
                let currentTab = tabs[0];
                // // console.log(currentTab);
                // let url = (currentTab.url)

                if (!bg.currentState.selectorEnabledTabsIDArray.includes(currentTab.id)) {
                    bg.turnOnSelector(currentTab.id)
                }

            }
        })

        

    }
});
bg.init()