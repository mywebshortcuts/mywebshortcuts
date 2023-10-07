
import './styles/mws.css'

// import { finder } from '@medv/finder'

import { toJSON } from '../modules/domJsonConverter.js'

import {
    addClass, rmClass, getElemAt, setTextContent, setInnerHTML, getAttr, setAttr, setEvent, rmEvent,
    qS, qSA, apCh, getStorage, setStorage, sendMsg
} from "../modules/quickMethods.js"

import elementCreator from '../modules/elementCreator'


const mws = {
    // dom: {
    //     addClass: (element, classesArray = []) => {

    //         classesArray.forEach((cls) => {
    //             return element.classList.add(cls)
    //         })
    //     },
    //     rmClass: (element, classesArray = []) => {
    //         classesArray.forEach((cls) => {
    //             return element.classList.remove(cls)
    //         })
    //     },
    //     getElemAt: (x, y) => {
    //         return document.elementFromPoint(x, y)
    //     },

    //     setTextContent: (element, text = "") => {
    //         element.textContent = text
    //     },
    //     setInnerHTML: (element, html = "") => {
    //         element.innerHTML = html
    //     },



    //     getAttr: (element, attribute = "") => {
    //         return element.getAttribute(attribute)
    //     },
    //     setAttr: (element, attribute = "", value = "") => {
    //         element.setAttribute(attribute, value)
    //     },

    //     setEvent: (element, eventName = "", callbackFunc, options = {}) => {
    //         element.addEventListener(eventName, (e) => {
    //             callbackFunc(e);
    //         }, options)
    //     },
    //     rmEvent:(element, eventName, functionAttached, options={}) =>{
    //         element.removeEventListener(eventName, functionAttached, options)
    //     }
    // },


    // doc: {
    //     qS: (selector) => {
    //         return document.querySelector(selector)
    //     },
    //     qSA: (selector) => {
    //         return document.querySelectorAll(selector)
    //     },
    //     apCh: (child) => {
    //         document.appendChild(child)
    //         return true
    //     }
    // },

    // chrome: {
    //     getStorage: function (keys = [], area="local",returnPromise = false) {
    //         if (area=="sync") {
    //             return returnPromise ? chrome.sync.local.get(keys) : chrome.sync.local.get(keys).then((data) => data)
    //         }
    //         else if(area=="session"){
    //             return returnPromise ? chrome.storage.session.get(keys) : chrome.storage.session.get(keys).then((data) => data)
    //         }
    //         return returnPromise ? chrome.local.session.get(keys) : chrome.local.session.get(keys).then((data) => data)
    //     },
    //     setStorage: function (keyValues = {}, area="local",returnPromise = false) {
    //         if (area=="sync") {
    //             return returnPromise ? chrome.storage.sync.set(keyValues) : chrome.storage.sync.set(keyValues).then((data) => data)
    //         }
    //         else if(area=="session"){
    //             return returnPromise ? chrome.storage.session.set(keyValues) : chrome.storage.session.set(keyValues).then((data) => data)
    //         }
    //         return returnPromise ? chrome.storage.local.set(keyValues) : chrome.storage.local.set(keyValues).then((data) => data)
    //     },
    //     sendMsg: async (message) => {
    //         const response = await chrome.runtime.sendMessage(message);
    //         return response
    //     },
    // },

    currentState: {
        elementSelectionOn: false,
        keyboardShortcutSelectorOpen: false

    },

    currentElement: null,
    clickedElementsArray: [],
    selectedShortcut: undefined,
    allShortcuts: [], // {"website":["shortcut", "shortcut"]}
    keyElementRelationObject: {},
    /*

    keyElementRelationObject =
    // {
        "website":{
            Single Element or Multiple Elements or Location on View Screen
            "shortcut":{
                type:"",
                properties:{
    
                },

                selected: {elementJSON} OR [{elementJSON}, {elementJSON}...] OR {x:20, y:20},

            }
            



        }
    }

    */


    /*

    */

    keyboarder: function () {

        // setEvent(window, 'keydown', )
        window.addEventListener('keydown', (e) => {
            e.preventDefault()
            let pressedKey = e.key;

            if (mws.currentState.keyboardShortcutSelectorOpen) {
                mws.selectedShortcut = pressedKey

                // document.querySelector('.MWS-dialogSpan').textContent = "Selected Shortcut: " + selectedShortcut
                setTextContent(qS('.MWS-dialogSpan'), `Selected Shortcut: ${mws.selectedShortcut}`)
            }


        })

    },


    addRemoveborder: function (event) {
        let [x, y] = [event.x, event.y]


        if (mws.currentState.keyboardShortcutSelectorOpen) {
            return
        }

        // If current Element already exists then remove the class
        if (mws.currentElement) {
            mws.currentElement.classList.remove('MWS-bordered')
        }

        if (getElemAt(x, y).classList.contains('MWS-element')) {
            console.log("ignored");
            return
        }
        mws.currentElement = getElemAt(x, y);
        // mws.currentElement.classList.add('MWS-bordered')

        addClass(mws.currentElement, ['MWS-bordered'])

    },

    selectKeyboardShortcut: function () {
        function  closeDialog() {
            console.log("Closing Selector");
            dialogElement.close()
            document.body.removeChild(dialogElement)

            mws.currentState.keyboardShortcutSelectorOpen = false;

        }

        mws.currentState.keyboardShortcutSelectorOpen = true;

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


        let dialogElementData = {
            tagName: 'dialog',
            attributes: {
                classes: ['MWS-element', 'MWS-keyboardShortcutSelectionDialog']
            },
            // childElements: [spanElement, buttonElement]
            innerHTML: `
	<button class="MWS-element MWS-closeDialogButton"}>Close</button>


	<span class="MWS-element MWS-dialogSpan">Selected Shortcut: a</span>

	<button class="MWS-element MWS-selectionDoneButton">Done</button>
            
            `
        }
        let dialogElement = elementCreator(dialogElementData)



        document.body.appendChild(dialogElement)


        qS('.MWS-selectionDoneButton').addEventListener('click', async (event) => {
            event.preventDefault()
            if (mws.selectedShortcut == undefined) { return }

            if (!mws.allShortcuts.includes(mws.selectedShortcut)) {
                mws.allShortcuts.push(mws.selectedShortcut)
            }
            mws.keyElementRelationObject[mws.selectedShortcut] = toJSON(mws.currentElement)


            const result = await getStorage(["elementShortcutsRelation", 'allSetShortcutsArray'])

            let previousData = {
                allSetShortcutsArray: result.allSetShortcutsArray ? result.allSetShortcutsArray : [],
                elementShortcutsRelation: result.elementShortcutsRelation ? result.elementShortcutsRelation : {}
            }

            let updatedData = {
                allSetShortcutsArray: (previousData.allSetShortcutsArray).concat(mws.allShortcuts),
                keyElementRelationObject: { ...previousData.elementShortcutsRelation, ...mws.keyElementRelationObject }
            }

            await setStorage({ elementShortcutsRelation: updatedData.keyElementRelationObject, allSetShortcutsArray: updatedData.allSetShortcutsArray })

            chrome.runtime.sendMessage({ msg: "NewShortcuts" });
            chrome.runtime.sendMessage({ action: "turnOffSelector" });



            rmClass(mws.currentElement, ['MWS-bordered'])
            mws.currentElement = undefined;

            mws.currentState.keyboardShortcutSelectorOpen = false

            mws.switchOffSelector()

            closeDialog()
        })

        // setEvent(qS('.MWS-closeDialogButton'), 'click', closeDialog)

        dialogElement.showModal()
    },


    whenClicked: function (event) {

        // document.addEventListener('contextmenu', (e) => {
        // e.preventDefault();
        // });


        event.preventDefault()
        // event.stopPropagation()
        const clickedElement = mws.currentElement;

        if (!mws.currentElement) {
            return
        }

        if (clickedElement.classList.contains('MWS-element')) {
            return
        }

        clickedElement.classList.add("MWS-clicked")


        if (!mws.currentState.keyboardShortcutSelectorOpen) {
            mws.selectKeyboardShortcut()
        }

        // This code will be there when multiple click functionality is added
        // if (!clickedElementsArray.contains(mws.currentElement)) {
        //     clickedElementsArray.push(mws.currentElement)
        //     mws.currentElement.setAttribute('data-index', `${clickedElementsArray.length}`)
        // }

    },

    switchOffSelector: function () {
        window.removeEventListener('mouseover', mws.addRemoveborder);
        window.removeEventListener('click', mws.whenClicked);

        rmClass(qS('html'), ['MWS-stylesForPage'])

    },


    openFloatingDiv: function () {

        let dialogElementData = {
            tagName: 'dialog',
            attributes: {
                classes: ['MWS-element', 'MWS-keyboardShortcutSelectionDialog']
            },
            // childElements: [spanElement, buttonElement]
            innerHTML: `
<dialog class="MWS-element MWS-keyboardShortcutSelectionDialog" open="">
	<button class="MWS-element MWS-closeDialogButton">X</button>
	<span class="MWS-element MWS-dialogSpan">Selected Shortcut: a</span>
	<button class="MWS-element MWS-selectionDoneButton">Done</button>
</dialog>
            
            `
        }
        let dialogElement = elementCreator(dialogElementData)



        document.body.appendChild(dialogElement)


        qS('.MWS-selectionDoneButton').addEventListener('click', async (event) => {
        })

        dialogElement.showModal()
    },

    init: function () {
        window.addEventListener('mouseover', mws.addRemoveborder);
        window.addEventListener('click', mws.whenClicked)

        mws.keyboarder()
        addClass(qS('html'), ['MWS-stylesForPage'])


        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.message === "turnOffSelector") {
                mws.switchOffSelector()

            }
        });

    }
}

mws.init()




// ----------ORIGINAL CODE-----------------------------------

// let currentState = {
//     elementSelectionOn: false,
//     keyboardShortcutSelectorOpen: false

// }

// let clickedElementsArray = [];

// let selectedShortcut;


// let allShortcuts = []
// let keyElementRelationObject = {}


// function keyboarder() {

//     window.addEventListener('keydown', (e) => {
//         e.preventDefault()
//         let pressedKey = e.key;
//         console.log(e);

//         if (currentState.keyboardShortcutSelectorOpen) {
//             selectedShortcut = pressedKey
//             document.querySelector('.MWS-dialogSpan').textContent="Selected Shortcut: "+ selectedShortcut
//         }


//     })


// }



// function highlighter() {


//     function getElementOnCoordinates(x, y) {
//         return document.elementFromPoint(x, y)
//     }

//     let currentElement;

//     function addRemoveborder(event) {
//         let [x, y] = [event.clientX, event.clientY]


//         if (currentState.keyboardShortcutSelectorOpen) {
//             return
//         }

//         if (currentElement) {
//             currentElement.classList.remove('MWS-bordered')
//         }

//         // console.log(getElementOnCoordinates(x, y));
//         // console.log(getElementOnCoordinates(x, y).classList);
//         // console.log(getElementOnCoordinates(x, y).classList.contains('MWS-element'));

//         if (getElementOnCoordinates(x, y).classList.contains('MWS-element')) {
//             console.log("ignored");
//             return
//         }
//         currentElement = getElementOnCoordinates(x, y);


//         // console.log(finder(currentElement));

//         // console.log(toJSON(currentElement));

//         // console.log(toDOM(toJSON(currentElement)));


//         currentElement.classList.add('MWS-bordered')


//     }

//     function selectKeyboardShortcut() {
//         // console.log(`Dialog opener function just started: ${currentElement}`);

//         currentState.keyboardShortcutSelectorOpen = true;


//         // let elementData = {
//         //     tagName: "div",
//         //     attributes: {
//         //         classes: ['MWS-element'],
//         //         id: undefined,
//         //         otherAttributes: []
//         //     },
//         //     textContent: undefined,
//         //     innerHTML: undefined,
//         //     childElements: []
//         // }


//         let spanElementData = {
//             tagName: 'span',
//             attributes: {
//                 classes: ['MWS-element', "MWS-dialogSpan"]
//             },
//             textContent: `Selected the keyboard shortcut: ${selectedShortcut}`
//         }
//         let spanElement = elementCreator(spanElementData)

//         let buttonElementData = {
//             tagName: 'button',
//             attributes: {
//                 classes: ["MWS-element", "MWS-dialogButton"]
//             },
//             textContent: "Done"
//         }
//         let buttonElement = elementCreator(buttonElementData)

//         buttonElement.addEventListener('click',(event)=>{
//             event.preventDefault()
//             if (selectedShortcut==undefined) {
//                 return
//             }

//             if (!allShortcuts.contains(selectedShortcut)) {
//                 allShortcuts.push(selectedShortcut)
//             }
//             keyElementRelationObject[selectedShortcut] = toJSON(currentElement)

//             console.log(allShortcuts);
//             console.log(keyElementRelationObject);

//             chrome.storage.local.get(["elementShortcutsRelation", 'allSetShortcutsArray']).then((result) => {

//                 let previousData = {
//                     allSetShortcutsArray: result.allSetShortcutsArray ? result.allSetShortcutsArray : [],
//                     elementShortcutsRelation: result.elementShortcutsRelation ? result.elementShortcutsRelation : {}
// }


//                 let updatedData = {
//                     allSetShortcutsArray: (previousData.allSetShortcutsArray).concat(allShortcuts),
//                     keyElementRelationObject: { ...previousData.elementShortcutsRelation, ...keyElementRelationObject }
//                 } 
//                 chrome.storage.local.set({ elementShortcutsRelation: updatedData.keyElementRelationObject }).then(() => {
//                     console.log("Relations are set");
//                     chrome.storage.local.set({ allSetShortcutsArray: updatedData.allSetShortcutsArray }).then(() => {
//                         console.log("List of Set Shorcuts is set");
//                     });
//                 });
//             });




//     //  chrome.runtime.sendMessage({ message: "NewShortcuts"});
//             (async () => {
//                 const response = await chrome.runtime.sendMessage({ msg: "NewShortcuts" });
//                 // do something with response here, not outside the function
//                 console.log(response);
//             })();




//             currentElement.classList.remove('MWS-clicked')
//             currentElement = undefined;
//             dialogElement.close()
//             currentState.keyboardShortcutSelectorOpen = false

//             switchOffSelector()
//             document.body.removeChild(dialogElement)
//         })


//         let dialogElementData = {
//             tagName: 'dialog',
//             attributes: {
//                 classes: ['MWS-element', 'MWS-keyboardShortcutSelectionDialog']
//             },
//             childElements: [spanElement, buttonElement]
//         }


//         let dialogElement = elementCreator(dialogElementData)

//         // console.log(`Before Appending: ${currentElement}`);

//         document.body.appendChild(dialogElement)
//         // console.log(`After Appending: ${currentElement}`);
//         dialogElement.showModal()
//         // console.log(`After ShowModal: ${currentElement}`);
//     }


//     function whenClicked(event) {
//         const clickedElement = currentElement;

//         if (!currentElement) {
//             return              
//         }

//         if (clickedElement.classList.contains('MWS-element')) {
//             return
//         }

//         event.preventDefault()
//         clickedElement.classList.add("MWS-clicked")


//         if (!currentState.keyboardShortcutSelectorOpen) {
//             // console.log(`Before calling the dialog opener function: ${currentElement}`);
//             selectKeyboardShortcut()            
//         }

//         // This code will be there when multiple click functionality is added
//         // if (!clickedElementsArray.contains(currentElement)) {
//         //     clickedElementsArray.push(currentElement)
//         //     currentElement.setAttribute('data-index', `${clickedElementsArray.length}`)
//         // }

//     }


//     window.addEventListener('mouseover', addRemoveborder);

//     window.addEventListener('click', whenClicked)


// function switchOffSelector() {

//     window.removeEventListener('mouseover', addRemoveborder);
//     window.removeEventListener('click', whenClicked);
// }

//     // Listen for messages sent from the background script.
//     chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//         if (message.message === "start") {
//             // toBeOrNotToBe = true
//         }
//         else {
//             // toBeOrNotToBe = false
//             switchOffSelector()
//         }
//     });

// }

// highlighter()
// keyboarder()

// ----------ORIGINAL CODE-----------------------------------

