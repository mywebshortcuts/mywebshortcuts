// import {bro} from "../scripts/main";

import setter from '../scripts/setter?script'


let mwsCSS = ``


function turnOffSelector(tab) {
    // chrome.scripting.removeCSS({
    //     target: { tabId: tab.id },
    //     css: mwsCSS,
    // })
    chrome.tabs.sendMessage(tab.id, { action: "turnOffSelector" });

}

chrome.action.onClicked.addListener(async (tab) => {

    // We retrieve the action badge to check if the extension is 'ON' or 'OFF'
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    // Next state will always be the opposite
    const nextState = prevState === 'ON' ? undefined : 'ON';

    // Set the action badge to the next state
    await chrome.action.setBadgeText({
        tabId: tab.id,
        text: nextState
    });

    if (nextState === 'ON') {
        // Insert the CSS file when the user turns the extension on (UNUSED AS OF NOW)
        // chrome.scripting.insertCSS({
        //     target: { tabId: tab.id },
        //     css: mwsCSS,
        // }).then(() => {
        // })
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: [setter]
        });

        chrome.tabs.sendMessage(tab.id, { message: "start" });

    } else if (nextState === undefined) {
        turnOffSelector(tab)
    }
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action == "turnOffSelector") {
            turnOffSelector()
        }
    }
);
chrome.runtime.onInstalled.addListener(details => {
    console.log("BRooooo Hiiii you just installed meee");
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.runtime.setUninstallURL('https://www.heyprakhar.xyz');
    }
});