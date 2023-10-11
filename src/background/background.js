// import {bro} from "../scripts/main";

import { getCompleteData, getStorage, isObjEmpty, sendMsg, setStorage } from '../modules/quickMethods';
import setter from '../scripts/setter?script'


const bg = {
    completeData: {
        websitesData: {},

        globalSettings: {
            extensionEnabled: true,
            darkMode: true,

        }
    },


    turnOffSelector: function (tab) {
        chrome.tabs.sendMessage(tab.id, { action: "turnOffSelector" })
    },

    turnOnSelector: function (tab) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: [setter]
        })

        chrome.tabs.sendMessage(tab.id, { action: "turnOnSelector" });
    },

    getCompleteDataInBackground: async function () {
        const data = await getCompleteData()
        console.log(data);
        if (isObjEmpty(data)) {
            // console.log(data);
            await setStorage({...bg.completeData})
        }
        else{
            bg.completeData = data
        }
    },

    onDataUpdate: async function () {
        await bg.getCompleteDataInBackground()

        // await sendMsg({ msg: "dataUpdated", data: bg.completeData })

    },
    init: async function () {

        await bg.getCompleteDataInBackground()

        chrome.runtime.onInstalled.addListener(details => {
            console.log("BRooooo Hiiii you just installed meee");
            if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
                chrome.runtime.setUninstallURL('https://www.heyprakhar.xyz');
            }
        })


        chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {

            if (request.spread) {
                console.log("Spreading");
                chrome.tabs.sendMessage(sender.tab.id, request);
            }
            
            if (request.msg = "sendCompleteData") {
                console.log("Something asked for data: ",bg.completeData);
                await bg.onDataUpdate()
                await sendResponse(bg.completeData)
            }
            if (request.action == "turnOffSelector") {
                bg.turnOffSelector(request.tab)
            }
            else if (request.action == "turnOnSelector") {
                bg.turnOnSelector(request.tab)
            }
        }
        )

    }
}

chrome.storage.onChanged.addListener(async (changes) => {
    console.log("Data updated");
    await bg.onDataUpdate()
})

bg.init()

