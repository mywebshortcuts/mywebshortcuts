
getData()

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.msg === "NewShortcuts")
            // sendResponse({ farewell: "goodbye" });
        getData()
    }
);



function getData() {
    
    chrome.storage.local.get(["elementShortcutsRelation", 'allSetShortcutsArray']).then((result) => {
        console.log(result);
        // console.log("Value currently is " + result);
        // console.log("Value currently is " + result.elementShortcutsRelation);
    });
}




