
import './styles/mws.css'

import { finder } from '@medv/finder'

import { toJSON } from '../modules/domJsonConverter.js'

import {
    addClass, rmClass, getElemAt, setTextContent, setInnerHTML, getAttr, setAttr, setEvent, rmEvent,
    qS, qSA, apCh, getStorage, setStorage, sendMsg, getTextContent, extractCoreUrl, getCompleteData, isObjEmpty
} from "../modules/quickMethods.js"

import elementCreator from '../modules/elementCreator'


const mws = {
    currentState: {
        elementSelectionOn: false,
        elementSelectorOpen: false,
        keyboardShortcutSelectorOpen: false,
        keyboardShortcutSelectionOn: false,
    },
    currentElement: null,
    clickedElementsArray: [],
    selectedShortcut: undefined,
    shortcutName: "",
    allShortcuts: [], // {"website":["shortcut", "shortcut"]}
    allElements: [],
    keyElementRelationObject: {},

    websiteURL: "",
    allWebsitesData: {},

    websiteData: {
        settings: {
            enabled: true,
        },
        shortcuts: {}
    },
    completeData: {},

    keyboarder: function (e) {
        e.preventDefault()
        let pressedKey = e.key;

        if (mws.currentState.keyboardShortcutSelectionOn) {
            mws.selectedShortcut = pressedKey
            setTextContent(qS('.MWS-selectedShortcutSpan'), `${mws.selectedShortcut}`)
        }
    },
    turnOnKeyboarder: () => {
        // keypress only listens to Character Key Presses and not all key presses like CTRL, Tab, F1, etc. (keydown detects all)
        // This is done to prevent any issues with pre-existing shortcuts in the browser or the OS. It may be removed 
        // with some measures in the future.
        window.addEventListener('keypress', mws.keyboarder)
    },
    turnOffKeyboarder: () => {
        window.removeEventListener('keypress', mws.keyboarder)
    },


    addRemoveborder: function (event) {
        // This function will add or Remove a class to the hovered element that gives it a border 
        let [x, y] = [event.x, event.y]


        if (mws.currentState.keyboardShortcutSelectorOpen) {
            return
        }
        if (!mws.currentState.elementSelectionOn) {
            return
        }

        // If currentElement already exists then remove the class
        if (mws.currentElement) {
            mws.currentElement.classList.remove('MWS-bordered')
        }

        if (getElemAt(x, y).classList.contains('MWS-element')) {
            mws.currentElement = undefined
            console.log("ignored");
            return
        }
        mws.currentElement = getElemAt(x, y);


        // mws.currentElement.classList.add('MWS-bordered')
        setTextContent(qS('.MWS-currentElementSpan'), finder(mws.currentElement))

        addClass(mws.currentElement, ['MWS-bordered'])

        // console.log(mws.currentElement);
        // console.log(finder(mws.currentElement));

    },

    closeKeyboardShortcutSelectionDialog: function () {
        // mws.switchOffSelector()
        const dialogElement = qS('.MWS-keyboardShortcutSelectionDialog')
        document.body.removeChild(dialogElement)
        mws.currentState.keyboardShortcutSelectorOpen = false;

        // mws.openFloatingDiv()
    },

    getSelectedType: function () {

        // Get a reference to the radio button group by its name
        const radioGroup = document.getElementsByName("elementSelectionType");

        // Initialize a variable to store the selected value
        let selectedValue;

        // Iterate through the radio buttons
        for (const radio of radioGroup) {
            if (radio.checked) {
                // If a radio button is checked, store its value
                selectedValue = radio.value;
                break; // Exit the loop since we found the selected radio
            }
        }
        return selectedValue
    },

    enableNameSetting: function () {
        mws.currentState.keyboardShortcutSelectionOn = false;
        mws.turnOffKeyboarder()
        const nameInput = qS('.MWS-shortcutNameInput')
        nameInput.disabled = false

        setEvent(nameInput, "keyup", (e) => {
            mws.shortcutName = nameInput.value
        })

    },
    disableWindowUnload: function (e) {
        console.log("Yoo it's me the unload stopperrr");
        // Cancel the event (prevent the browser from closing or reloading the page)
        e.preventDefault();
        // Chrome requires the following line to work
        e.returnValue = "";
    },
    turnOnWindowUnloadStopper: function () {
        console.log("No you cannot unload");
        window.addEventListener("beforeunload", mws.disableWindowUnload);
    },
    turnOffWindowUnloadStopper: function () {
        console.log("Yes you can unload");
        window.removeEventListener("beforeunload", mws.disableWindowUnload);
    },


    setDataOfCurrentWebsite: async function () {
        let shortcutDataMap = {
            name: "",
            enabled: true,

            // Single Element or Multiple Elements or Location on View Screen
            type: "singleElement", // Read the Readme
            // In multiElements type, all the selected elements in the array will be clicked one by one from first to last

            // Will be updated when other types are added
            properties: {
                todo: "click" // click, focus, highlight(add bright borders), scrollTo 
            },

            // Data about the element to be selected
            selected: {} // {elementJSON} OR [{elementJSON}, {elementJSON}...] OR " cssSelector.class[attribute='value'] " OR {x:20, y:20},
        }

        let shortcut = mws.selectedShortcut
        // console.log(shortcut);

        let newShortcutData = {
            name: mws.shortcutName,
            enabled: true,

            // We will use mws.getSelectedType() once other types are added
            type: "singleElement",
            properties: {
                todo: 'click'
            },

            selected: toJSON(mws.currentElement),
        }
        mws.websiteData.shortcuts[shortcut] = newShortcutData

        mws.allWebsitesData[mws.websiteURL] = mws.websiteData

        mws.completeData.websitesData = mws.allWebsitesData
        await chrome.storage.local.set({ ...mws.completeData })

    },

    keyboardShortcutValidator: function (newShortcut) {
        // This function will be updated a lot with time as we get to know shortcuts that are causing issues for MOST of the users.
        // Note that there will be specific issues for every user which they need to solve themselves. But there are a few shortcuts
        // that are universally used for something and can be an issue. 
        return true

    },
    openKeyboardShortcutSelectionDialog: function () {
        mws.turnOnKeyboarder()

        mws.currentState.keyboardShortcutSelectorOpen = true;
        mws.currentState.keyboardShortcutSelectionOn = true;
        let dialogElementData = {
            tagName: 'dialog',
            attributes: {
                classes: ['MWS-element', 'MWS-keyboardShortcutSelectionDialog']
            },
            // childElements: [spanElement, buttonElement]
            innerHTML: `
	<button class="MWS-element MWS-closeKeyboardShortcutSelectionDialogButton">
		Close
	</button>
	<p class="MWS-element MWS-shortcutShowupPara">
		Selected Shortcut:
		<span class="MWS-element MWS-selectedShortcutSpan">None</span>
	</p>
	<button class="MWS-element MWS-shortcutSelectionDoneButton">Select Shortcut</button>

	<label for="shortcutName" class="MWS-element MWS-ShortcutNameLabel"
		>Shortcut Name:
	</label>
	<input
		type="text"
		id="shortcutName"
		maxlength="20"
		class="MWS-element MWS-shortcutNameInput"
        disabled="true" />

		
		<button class="MWS-element MWS-allDoneButton">Done</button>
            `
        }
        let dialogElement = elementCreator(dialogElementData)
        document.body.appendChild(dialogElement)

        const selectionDoneButton = qS('.MWS-shortcutSelectionDoneButton')

        selectionDoneButton.addEventListener('click', (e) => {
            e.preventDefault()
            if (mws.selectedShortcut == undefined) { return }

            if (!mws.allShortcuts.includes(mws.selectedShortcut) && mws.keyboardShortcutValidator(mws.selectedShortcut)) {
                mws.allShortcuts.push(mws.selectedShortcut)
                mws.enableNameSetting()
            }
        })

        qS('.MWS-allDoneButton').addEventListener('click', async (e) => {
            e.preventDefault()

            // await mws.getExistingDataOfCurrentWebsite()
            await mws.setDataOfCurrentWebsite()

            rmClass(mws.currentElement, ['MWS-bordered'])
            mws.currentElement = undefined;

            mws.closeKeyboardShortcutSelectionDialog()
        })

        setEvent(qS('.MWS-closeKeyboardShortcutSelectionDialogButton'), 'click', (event) => {
            event.preventDefault()
            rmClass(mws.currentElement, ['MWS-bordered'])
            mws.currentElement = undefined;

            mws.closeKeyboardShortcutSelectionDialog()
        })

        dialogElement.showModal()
    },

    isElementFocusable: function (element) {
        // console.log(element.focusable);
        if (element.focusable) {
            return true;
        }
        // Check if the element has a tabIndex property
        // console.log(element.tabIndex >= -1);
        if (typeof element.tabIndex === 'number') {
            // Elements with a tabIndex greater than or equal to -1 are focusable
            return element.tabIndex >= -1;
        }

        // If the element does not have a tabIndex property, check its nodeName
        const nodeName = element.nodeName.toLowerCase();
        const focusableNodeNames = ['a', 'button', 'input', 'select', 'textarea'];
        // const unFocusableNodeNames = ['a', 'button', 'input', 'select', 'textarea'];
        console.log((focusableNodeNames.includes(nodeName)));
        if (focusableNodeNames.includes(nodeName)) {
            return true;
        }

    },

    whenClicked: function (event) {
        if (!mws.currentElement) {
            return
        }
        const clickedElement = mws.currentElement;
        if (!mws.currentState.elementSelectionOn) {
            return

        }
        if (clickedElement.classList.contains('MWS-element')) {
            return
        }
        if (!mws.isElementFocusable(clickedElement)) {
            console.log("Not Focusable");
            return
        }
        // console.log(mws.currentElement);

        event.preventDefault()
        event.stopPropagation()
        if (!mws.currentState.keyboardShortcutSelectorOpen) {
            rmClass(mws.currentElement, ['MWS-bordered'])
            // console.log(mws.currentElement);
            // mws.closeFloatingDiv()
            mws.openKeyboardShortcutSelectionDialog()
        }




        // This code will be there when multiple click functionality is added

        // clickedElement.classList.add("MWS-clicked")
        // if (!clickedElementsArray.contains(mws.currentElement)) {
        //     clickedElementsArray.push(mws.currentElement)
        //     mws.currentElement.setAttribute('data-index', `${clickedElementsArray.length}`)
        // }

    },

    switchOffSelector: function () {
        mws.currentState.elementSelectionOn = false
        mws.currentElement = undefined
        rmClass(qS('html'), ['MWS-stylesForPage'])

        window.removeEventListener('mouseover', mws.addRemoveborder);
        window.removeEventListener('click', mws.whenClicked);

        setTextContent(qS('.MWS-elementSelectionEnableDisableButton'), mws.currentState.elementSelectionOn ? "On" : "Off")
    },
    switchOnSelector: function () {
        mws.currentState.elementSelectionOn = true
        addClass(qS('html'), ['MWS-stylesForPage'])

        window.addEventListener('mouseover', mws.addRemoveborder);
        window.addEventListener('click', mws.whenClicked);

        setTextContent(qS('.MWS-elementSelectionEnableDisableButton'), mws.currentState.elementSelectionOn ? "On" : "Off")
    },

    closeFloatingDiv: () => {
        document.body.removeChild(qS('.MWS-floatingDiv'))
    },

    makeElementDraggable: function (element) {

        let offsetX, offsetY;

        const move = (e) => {
            e.preventDefault()
            element.style.left = `${e.x - offsetX}px`
            element.style.top = `${e.y - offsetY}px`
            // mws.switchOffSelector()
        }
        element.addEventListener("mousedown", (e) => {
            offsetX = e.x - element.offsetLeft;
            offsetY = e.y - element.offsetTop;
            document.addEventListener("mousemove", move)

            // setEvent(document, "mousemove", move)
        })
        function mouseUpFunc() {
            rmEvent(document, "mousemove", move)
            // mws.switchOnSelector()
        }
        document.addEventListener("mouseup", mouseUpFunc)

        // element.addEventListener('mouseleave', ()=>{
        //     document.removeEventListener("mouseup", mouseUpFunc)
        // })
    },


    openFloatingDiv: function () {

        let floatingDivData = {
            tagName: 'div',
            attributes: {
                classes: ['MWS-element', 'MWS-floatingDiv']
            },
            innerHTML: `
	<button class="MWS-element MWS-elementSelectionEnableDisableButton">On</button>
	<p class="MWS-element MWS-selectedElementPara">
		Select Element: <span class="MWS-element MWS-currentElementSpan">currentElement</span>
	</p>
<label class="MWS-element MWS-singleElementLabel">
  <input type="radio" class="MWS-element MWS-singleElementRadio" name="elementSelectionType" value="single" checked>
  Single Element
</label>

<label class="MWS-element MWS-multipleElementsLabel">
  <input type="radio" class="MWS-element MWS-multipleElementsRadio" name="elementSelectionType" value="multiple" disabled="true">
  Multiple Elements (Coming Soon)
</label>

<label class="MWS-element MWS-locationOnWindowLabel">
  <input type="radio" class="MWS-element MWS-locationOnWindowRadio" name="elementSelectionType" value="location" disabled="true">
  Location on Window (Coming Soon)
</label>

	<button class="MWS-element MWS-closeElementSelectorButton">Close</button>
            `
        }
        let floatingDiv = elementCreator(floatingDivData)
        document.body.appendChild(floatingDiv)

        mws.makeElementDraggable(floatingDiv)

        mws.currentState.elementSelectorOpen = true

        function enableDisableElementSelection() {
            if (mws.currentState.elementSelectionOn) {
                mws.currentState.elementSelectionOn = false
                // setTextContent(qS('.MWS-elementSelectionEnableDisableButton'), "Off")
                mws.switchOffSelector()
            }
            else {
                // setTextContent(qS('.MWS-elementSelectionEnableDisableButton'), "On")
                mws.currentState.elementSelectionOn = true
                mws.switchOnSelector()
            }
            setTextContent(qS('.MWS-elementSelectionEnableDisableButton'), mws.currentState.elementSelectionOn ? "On" : "Off")

        }

        setEvent(qS('.MWS-elementSelectionEnableDisableButton'), 'click', enableDisableElementSelection)

        function closeElementSelectorAndTurnOffElementSelection() {
            mws.turnOffEverything()
            // mws.closeFloatingDiv()

        }

        setEvent(qS('.MWS-closeElementSelectorButton'), 'click', closeElementSelectorAndTurnOffElementSelection)

        // dialogElement.showModal()


    },


    turnOffEverything: function () {
        mws.turnOffWindowUnloadStopper()

        mws.switchOffSelector()
        mws.turnOffKeyboarder()

        if (mws.currentElement) {
            rmClass(mws.currentElement, ['MWS-bordered'])
        }
        // console.log(mws.currentState.elementSelectorOpen);
        if (mws.currentState.elementSelectorOpen) {
            mws.closeFloatingDiv()
        }

        sendMsg({ msg: "selectorDisabled", spread: true })
    },
    turnOnEverything: function () {
        mws.getExistingDataOfCurrentWebsite()


        mws.turnOnWindowUnloadStopper()
        mws.switchOnSelector()

        mws.turnOnKeyboarder()

        mws.openFloatingDiv()

        sendMsg({ msg: "selectorEnabled", spread: true })

    },

    getExistingDataOfCurrentWebsite: async function () {

        mws.completeData = await getCompleteData()
        // console.log("I asked for data from", mws.completeData);

        mws.allWebsitesData = mws.completeData.websitesData

        if (isObjEmpty(mws.completeData) || !mws.completeData.websitesData[mws.websiteURL] || isObjEmpty(mws.completeData.websitesData[mws.websiteURL].shortcuts)) {
            console.log("Nhi h kch khaas ki aage badhe hum...");
            return
        }
        mws.websiteData = mws.allWebsitesData[mws.websiteURL]

        mws.allShortcuts = Object.keys(mws.websiteData.shortcuts) || []
        // console.log(mws.allShortcuts);

        // This logic will change when types are added
        mws.allElements = Object.values(mws.websiteData.shortcuts).map(eachShortcutObject => eachShortcutObject.selected) || []



    },
    init: async function () {
        mws.websiteURL = extractCoreUrl(window.location.href)
        // console.log(mws.websiteURL);


        sendMsg({ msg: "selectorEnabled", spread: true })

        // mws.turnOnWindowUnloadStopper()

        await mws.getExistingDataOfCurrentWebsite()
        mws.switchOnSelector()
        // mws.turnOnKeyboarder()

        mws.openFloatingDiv()



        chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
            if (message.action === "turnOffSelector") {
                console.log("Msg aaya to band hora huuuu");
                mws.turnOffEverything()
            }
            if (message.action === "turnOnSelector") {
                console.log("Msg aaya to start hora huuuu");
                mws.turnOnEverything()
            }

            // if (message.msg = "dataUpdated") {
            //     console.log("Okay bro setter update karlega apna data");
            //     await mws.getExistingDataOfCurrentWebsite(message.data)

            // }
        });

    }
}

mws.init()


chrome.storage.onChanged.addListener(async (changes) => {
    console.log("Updating SETTER data");
    await mws.getExistingDataOfCurrentWebsite()
})