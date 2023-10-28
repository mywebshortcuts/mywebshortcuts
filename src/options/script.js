
import "../forExtensionPages.css"
import { addClass, getAttr, qS, qSA, rmClass, setEvent } from "../modules/quickMethods";
import "./style.css"

// Import Font Awesome
import "../assets/font-awesome/css/fontawesome.css"
import "../assets/font-awesome/css/solid.css"

const opt = {
    currentState:{

        activeGroup:1
    },

    clearAllData: ()=>{
        chrome.storage.local.clear(() => {
            console.log('All data in local storage has been cleared.');
            chrome.runtime.reload();
        });
    },
    updateDOM:()=>{
        qSA('.settingsGroup').forEach((settingsGroup)=>{
            if (settingsGroup.id == opt.currentState.activeGroup) {
                // Remove old styles
                const previousGroup = qS('.settingsGroup.active')
                console.log(previousGroup);
                rmClass(previousGroup, ['active'])
                
                const previousActiveGroupButton = qS(`.navigationButton.active`)
                console.log(previousActiveGroupButton);
                rmClass(previousActiveGroupButton, ['active'])
                
                
                console.log(`.navigationButton[data-groupID="${settingsGroup.id}"]`);
                const activeGroupButton = qS(`.navigationButton[data-groupID="${settingsGroup.id}"]`)
                console.log(activeGroupButton);
                
                addClass(settingsGroup, ['active'])     
                addClass(activeGroupButton, ['active']) 
            }
        })
    },

    init: function(){
        qS('.clearAllDataButton').addEventListener('click', opt.clearAllData)

        opt.updateDOM()

        qSA('.navigationButton').forEach((navigationButton)=>{
            setEvent(navigationButton, 'click', ()=>{
                const groupID = getAttr(navigationButton, 'data-groupID')
                opt.currentState.activeGroup = groupID
                opt.updateDOM()
            })
        })
        // setEvent('click', qS('.clearAllDataButton'), opt.clearAllData)



    }
}

opt.init()