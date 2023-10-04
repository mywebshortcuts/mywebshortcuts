
import './mws.css'


// import { finder } from '@medv/finder'

import elementCreator from './elementCreator'



let currentState = {
    elementSelectionOn: false,
    keyboardShortcutSelectorOpen: false

}

let clickedElementsArray = [];

let selectedShortcut;


let allShortcuts = []
let keyElementRelationObject = {}


function keyboarder() {

    window.addEventListener('keydown', (e) => {
        e.preventDefault()
        let pressedKey = e.key;
        console.log(e);

        if (currentState.keyboardShortcutSelectorOpen) {
            selectedShortcut = pressedKey
            document.querySelector('.MWS-dialogSpan').textContent="Selected Shortcut: "+ selectedShortcut
        }


    })

    window.addEventListener('keyup', (e) => {
        let k1 = e.key;

        if (k1 == "q") {
            // clickedElementsArray.forEach((element)=>{
            //     element.click()
            //     console.log(element.tagName, "clicked");
            // })

        }
    })

}



function highlighter() {


    function getElementOnCoordinates(x, y) {
        return document.elementFromPoint(x, y)
    }

    let currentElement;

    function addRemoveborder(event) {
        let [x, y] = [event.clientX, event.clientY]


        if (currentState.keyboardShortcutSelectorOpen) {
            return
        }

        if (currentElement) {
            currentElement.classList.remove('MWS-bordered')
        }

        // console.log(getElementOnCoordinates(x, y));
        // console.log(getElementOnCoordinates(x, y).classList);
        // console.log(getElementOnCoordinates(x, y).classList.contains('MWS-element'));

        if (getElementOnCoordinates(x, y).classList.contains('MWS-element')) {
            console.log("ignored");
            return
        }
        currentElement = getElementOnCoordinates(x, y);

        

        currentElement.classList.add('MWS-bordered')


    }

    function selectKeyboardShortcut() {
        // console.log(`Dialog opener function just started: ${currentElement}`);

        currentState.keyboardShortcutSelectorOpen = true;


        // let elementData = {
        //     tagName: "div",
        //     attributes: {
        //         classes: ['MWS-element'],
        //         id: undefined,
        //         otherAttributes: []
        //     },
        //     textContent: undefined,
        //     innerHTML: undefined,
        //     childElements: []
        // }


        let spanElementData = {
            tagName: 'span',
            attributes: {
                classes: ['MWS-element', "MWS-dialogSpan"]
            },
            textContent: `Selected the keyboard shortcut: ${selectedShortcut}`
        }
        let spanElement = elementCreator(spanElementData)

        let buttonElementData = {
            tagName: 'button',
            attributes: {
                classes: ["MWS-element", "MWS-dialogButton"]
            },
            textContent: "Done"
        }
        let buttonElement = elementCreator(buttonElementData)

        buttonElement.addEventListener('click',(event)=>{
            event.preventDefault()
            if (selectedShortcut==undefined) {
                return
            }
            if (!allShortcuts.includes(selectedShortcut)) {
                allShortcuts.push(selectedShortcut)
            }
            keyElementRelationObject[selectedShortcut] = currentElement

            console.log(allShortcuts);
            console.log(keyElementRelationObject);
            
            chrome.storage.local.set({ elementShortcutsRelation: keyElementRelationObject }).then(() => {
                console.log("Relations are set");
                chrome.storage.local.set({ allSetShortcutsArray: allShortcuts }).then(() => {
                    console.log("List of Set Shorcuts is set");
                });
            });



    //  chrome.runtime.sendMessage({ message: "NewShortcuts"});
            (async () => {
                const response = await chrome.runtime.sendMessage({ msg: "NewShortcuts" });
                // do something with response here, not outside the function
                console.log(response);
            })();




            currentElement.classList.remove('MWS-clicked')
            currentElement = undefined;
            dialogElement.close()
            currentState.keyboardShortcutSelectorOpen = false

            switchOffSelector()
            document.body.removeChild(dialogElement)
        })


        let dialogElementData = {
            tagName: 'dialog',
            attributes: {
                classes: ['MWS-element', 'MWS-keyboardShortcutSelectionDialog']
            },
            childElements: [spanElement, buttonElement]
        }


        let dialogElement = elementCreator(dialogElementData)

        // console.log(`Before Appending: ${currentElement}`);
        
        document.body.appendChild(dialogElement)
        // console.log(`After Appending: ${currentElement}`);
        dialogElement.showModal()
        // console.log(`After ShowModal: ${currentElement}`);
    }


    function whenClicked(event) {
        const clickedElement = currentElement;

        if (!currentElement) {
            return              
        }

        if (clickedElement.classList.contains('MWS-element')) {
            return
        }

        event.preventDefault()
        clickedElement.classList.add("MWS-clicked")
        
        
        if (!currentState.keyboardShortcutSelectorOpen) {
            console.log(
                // finder(clickedElement)

            ); 
            // console.log(`Before calling the dialog opener function: ${currentElement}`);
            selectKeyboardShortcut()            
        }

        // This code will be there when multiple click functionality is added
        // if (!clickedElementsArray.includes(currentElement)) {
        //     clickedElementsArray.push(currentElement)
        //     currentElement.setAttribute('data-index', `${clickedElementsArray.length}`)
        // }

    }


    window.addEventListener('mouseover', addRemoveborder);

    window.addEventListener('click', whenClicked)


function switchOffSelector() {

    window.removeEventListener('mouseover', addRemoveborder);
    window.removeEventListener('click', whenClicked);
}

    // Listen for messages sent from the background script.
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.message === "start") {
            // toBeOrNotToBe = true
        }
        else {
            // toBeOrNotToBe = false
            switchOffSelector()
        }
    });

}

highlighter()
keyboarder()


