
import "../forExtensionPages.css"
import { qS, setEvent } from "../modules/quickMethods";
import "./style.css"


const opt = {

    clearAllData: ()=>{
        chrome.storage.local.clear(() => {
            console.log('All data in local storage has been cleared.');
            chrome.runtime.reload();
        });
    },

    init: function(){
        console.log(qS('.clearAllDataButton'));
        qS('.clearAllDataButton').addEventListener('click', opt.clearAllData)
        // setEvent('click', qS('.clearAllDataButton'), opt.clearAllData)

    }
}

opt.init()