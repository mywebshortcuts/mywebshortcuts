import { toDOM } from "./domJsonConverter";


getData()

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

function getData() {
    
    chrome.storage.local.get(["elementShortcutsRelation", 'allSetShortcutsArray']).then((result) => {
        // console.log(result);

        allSetShortcutsArray = result.allSetShortcutsArray ? result.allSetShortcutsArray : []
        elementShortcutsRelation = result.elementShortcutsRelation ? result.elementShortcutsRelation : {}


        console.log(allSetShortcutsArray);
        console.log(elementShortcutsRelation);
        // console.log("Value currently is " + result);
        // console.log("Value currently is " + result.elementShortcutsRelation);
    });
}



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
