import { toDOM } from "../modules/domJsonConverter";

import { getStorage, setEvent } from "../modules/quickMethods";


// chrome.runtime.onMessage.addListener(
//     function (request, sender, sendResponse) {
//         if (request.msg === "NewShortcuts")
//             // sendResponse({ farewell: "goodbye" });
//         getData()
//     }
// );

chrome.storage.onChanged.addListener((changes)=>{
    // console.log(changes);
    getData()
}
)


let allSetShortcutsArray =[];


let elementShortcutsRelation;

async function getData() {
    
    // chrome.storage.local.get(["elementShortcutsRelation", 'allSetShortcutsArray']).then((result) => {
        // console.log(result);
        
        const data = await getStorage(["elementShortcutsRelation", 'allSetShortcutsArray'])

    allSetShortcutsArray = data.allSetShortcutsArray ? data.allSetShortcutsArray : []
    elementShortcutsRelation = data.elementShortcutsRelation ? data.elementShortcutsRelation : {}


        console.log(allSetShortcutsArray);
        console.log(elementShortcutsRelation);
        // console.log("Value currently is " + result);
        // console.log("Value currently is " + result.elementShortcutsRelation);
    // });
}
getData()



document.addEventListener('keypress', (event)=>{
    // console.log(event.key);
    let key = event.key
    if (allSetShortcutsArray.includes(key)) {
        // console.log("yes bro");
        // console.log(elementShortcutsRelation[key]);
         
        let element = toDOM(elementShortcutsRelation[key])

        console.log(element);

        element.click()
    }
})
