
// import './styles/root.css'
// import './styles/elementSelector.css'
// import './styles/keySelector.css'

// import { toJSON } from '../modules/domJsonConverter.js'

import { finder } from '@medv/finder'

import {
    addClass, rmClass, getElemAt, setTextContent, getAttr, setAttr, setEvent, rmEvent,
    qS, qSA, sendMsg, getCompleteData, isObjEmpty, switchClass, updateCSS
} from "../modules/quickMethods.js"

import elementCreator from '../modules/elementCreator'
import { confirmationDialogOpener } from '../modules/domElements.js'


let cssToImportArray = [
    'src/assets/font-awesome/css/fontawesome.css',
    'src/assets/font-awesome/css/solid.css',
    'src/scripts/styles/root.css',
    'src/scripts/styles/elementSelector.css',
    'src/scripts/styles/keySelector.css',
]

cssToImportArray.forEach(fileURL => {
    let link = document.createElement('link');
    link.href = chrome.runtime.getURL(fileURL);
    link.rel = 'stylesheet';
    document.head.appendChild(link);
})





const mws = {

    // Set of variables to track the state of various things in order to allow or prevent actions
    currentState: {
        elementSelectionOn: false,
        elementSelectorOpen: false,
        keyboardShortcutSelectorOpen: false,
        keyboardShortcutSelectionOn: false,

        elementSelectionPaused: false,

        requiredShortcutDataFilled: false,
    },

    // Global Variables

    // Selector variables
    currentElement: null,
    selectedElement: null, // Used by key selector
    clickedElementsArray: [], // Useful when multi-elements functionality is added
    selectedShortcut: undefined,
    shortcutName: "",


    selectedURL: '',
    customURL: '',
    selectedURLType: 'domainAndAllPages',
    selectedAction: 'click',

    extensionElementsInnerHTML: {
        elementSelectorDiv: null,
        keyboardShortcutSelectorDialog: null,
    },

    // Data variables
    completeData: {},
    allWebsitesData: {},

    // Website Data 
    websiteURL: "",
    currentURLObject: {},
    websiteShortcuts: [], // {"website":["shortcut", "shortcut"]}
    websiteData: {
        settings: {
            enabled: true,
        },
        shortcuts: {}
    },

    // Full Path data
    fullPathData: {},

    // Domain Data
    domainURL: "",
    domainShortcuts: [], // {"website":["shortcut", "shortcut"]}

    domainData: {
        settings: {
            enabled: true,
        },
        shortcuts: {}
    },

    // Shortcuts Available for current website
    allShortcuts: [],



    // DATA MANAGEMENT FUNCTIONS: These funcs get data from the storage, update the respective variable values, and update the storage 

    resetDataVariables: () => {
        mws.websiteData = {
            settings: {
                enabled: true,
            },
            shortcuts: {}
        }
        mws.allShortcuts = []

    },

    setCurrentURL: () => {
        let url = new URL((window.location.href).replace(/\/$/, ''))
        mws.currentURLObject = url
        mws.customURL = ''

        mws.selectedURL = mws.currentURLObject.origin

        mws.domainURL = mws.currentURLObject.origin

        mws.websiteURL = window.location.href
        mws.websiteURL = (mws.websiteURL).replace(/\/$/, ''); // Replace a trailing '/' with an empty string


        let currentUrl = location.href;
        setInterval(async () => {
            if (location.href !== currentUrl) {
                currentUrl = location.href;
                // doSomething();
                // console.log('URL change detected!');
                mws.setCurrentURL()
                await mws.getExistingDataOfCurrentWebsite()
            }
        }, 500);
    },



    // Gets data from the storage and stores it in respective variables
    getExistingDataOfCurrentWebsite: async function () {

        // Getting Complete Data
        mws.completeData = await getCompleteData()
        mws.allWebsitesData = mws.completeData.websitesData

        if (isObjEmpty(mws.completeData)) {
            // console.log("No Data");
            mws.resetDataVariables()
            return
        }

        // Getting the Page Data
        let pageUrl = mws.domainURL + (mws.currentURLObject.pathname).replace(/\/$/, '')
        if (!mws.completeData.websitesData[pageUrl] || isObjEmpty(mws.completeData.websitesData[pageUrl].shortcuts)) {
            // console.log("No Page Data");
            mws.resetDataVariables()
        }
        else {
            mws.websiteData = mws.allWebsitesData[pageUrl]
        }

        // Getting the Full path Data (if hash or search queries exist)
        if (mws.currentURLObject.search || mws.currentURLObject.hash) {
            let fullPathUrl = mws.currentURLObject.href
            if (!mws.completeData.websitesData[fullPathUrl] || isObjEmpty(mws.completeData.websitesData[fullPathUrl].shortcuts)) {
                // console.log("No Full Path Data");

                mws.fullPathData = {
                    settings: {
                        enabled: true,
                    },
                    shortcuts: {}
                }
            }
            else {
                mws.fullPathData = mws.allWebsitesData[fullPathUrl]
            }
        }


        // Object.keys(mws.websiteData.shortcuts)
        // Getting Domain Data
        if (!mws.completeData.websitesData[mws.domainURL] || isObjEmpty(mws.completeData.websitesData[mws.domainURL].shortcuts)) {
            // console.log("No Domain Data");

            mws.domainData = {
                settings: {
                    enabled: true,
                },
                shortcuts: {}
            }
            // mws.domainShortcuts = []
        }
        else {
            mws.domainData = mws.allWebsitesData[mws.domainURL]
            // mws.domainShortcuts = Object.keys(mws.domainData.shortcuts) || []
        }


        // const domainShortcutsAvailableForCurrentWebsite = []
        // if (!(mws.currentURLObject.pathname == '/') && mws.domainShortcuts.length > 0) {
        //     // Website shortcuts + Domain Shortcuts that have domainAndAllPages as their urlType
        //     for (const key in mws.allWebsitesData[mws.domainURL].shortcuts) {
        //         if (Object.hasOwnProperty.call(mws.allWebsitesData[mws.domainURL].shortcuts, key)) {
        //             const keyObject = mws.allWebsitesData[mws.domainURL].shortcuts[key];
        //             if (keyObject.properties.urlType == "domainAndAllPages") {
        //                 domainShortcutsAvailableForCurrentWebsite.push(key)
        //             }

        //         }
        //     }
        // }


        // This is an important part, we are going to extract all the shortcuts from the enabled urls or the same origin
        // so that one is able to access all the shortcuts that are available for the current url, if it's matched.
        // We will extract domain, page, full path (if hash & search params exist) and custom url shortcuts and merge them into 
        // one object for the onShortcutClicker to access.

        let allMatchedUrlsShortcutsObjects = []

        // Checking for Domain
        if (mws.completeData.websitesData[mws.currentURLObject.origin] && !isObjEmpty(mws.completeData.websitesData[mws.currentURLObject.origin].shortcuts)) {

            // If the current URL is NOT just the domain, simply add the shortcuts which have domainAndAllPages as their urlType
            if (mws.currentURLObject.pathname != '/') {

                for (const key in mws.completeData.websitesData[mws.currentURLObject.origin].shortcuts) {
                    if (Object.hasOwnProperty.call(mws.completeData.websitesData[mws.currentURLObject.origin].shortcuts, key)) {
                        const shortcutObject = mws.completeData.websitesData[mws.currentURLObject.origin].shortcuts[key];
                        if (shortcutObject.properties.urlType == "domainAndAllPages") {
                            allMatchedUrlsShortcutsObjects[key] = shortcutObject
                        }

                    }
                }
            }
            // If the current URL is just the domain, add all shortcuts
            else {

                for (const key in mws.completeData.websitesData[mws.currentURLObject.origin].shortcuts) {
                    if (Object.hasOwnProperty.call(mws.completeData.websitesData[mws.currentURLObject.origin].shortcuts, key)) {
                        const shortcutObject = mws.completeData.websitesData[mws.currentURLObject.origin].shortcuts[key];
                        allMatchedUrlsShortcutsObjects[key] = shortcutObject
                    }
                }
            }
        }

        for (let websiteURL in mws.completeData.websitesData) {

            if (Object.hasOwnProperty.call(mws.completeData.websitesData, websiteURL)) {
                websiteURL = websiteURL
                const websiteData = mws.completeData.websitesData[websiteURL];
                let urlObject = new URL(websiteURL)

                // Check if the url is having the same origin, is enabled and is not just the origin
                if (urlObject.origin == mws.currentURLObject.origin && (urlObject.pathname != '/')) {

                    // Checking for Custom URLs
                    if (/~mws-[^~]+~/.test(websiteURL)) {
                        let customURL = websiteURL

                        let customURLRegex;
                        // mws-end 
                        let endTerm = "~mws-end~";
                        if (customURL.includes(endTerm)) {
                            let endIndex = customURL.indexOf(endTerm);
                            customURL = customURL.substring(0, endIndex);
                        }
                        // mws-string 
                        let stringTerm = "~mws-string~";
                        if (customURL.includes(stringTerm)) {
                            customURLRegex = customURL.replaceAll(stringTerm, '.*')
                        }

                        let regex = new RegExp('^' + customURLRegex + "$")

                        let firstSlashIndex = customURL.lastIndexOf('/')
                        // console.log("Index of first slash: ", firstSlashIndex);
                        let urlAfterFirstSlash = customURL.substring(firstSlashIndex, customURL.length)
                        // console.log("URL after the first url: ", urlAfterFirstSlash);


                        if (regex.test(websiteURL)) {
                            // console.log(customURLRegex);
                            // console.log(regex);
                            // console.log("Matched URL:", websiteURL);

                            // allMatchedUrlsShortcutsObjects.push({ ...mws.completeData.websitesData[websiteURL].shortcuts })
                            // addWebsiteShortcuts = true

                            if (!isObjEmpty(mws.completeData.websitesData[websiteURL].shortcuts)) {
                                for (const key in mws.completeData.websitesData[websiteURL].shortcuts) {
                                    if (Object.hasOwnProperty.call(mws.completeData.websitesData[websiteURL].shortcuts, key)) {
                                        const shortcutObject = mws.completeData.websitesData[websiteURL].shortcuts[key];
                                    }
                                }
                            }
                            continue
                        }

                    }

                    // Checking for Page
                    // // console.log((mws.currentURLObject.pathname).replace(/\/$/, '') == (urlObject.pathname).replace(/\/$/, ''));
                    if (((mws.currentURLObject.pathname).replace(/\/$/, '') == (urlObject.pathname).replace(/\/$/, '')) && !(urlObject.hash || urlObject.search)) {
                        if (!isObjEmpty(mws.completeData.websitesData[websiteURL].shortcuts)) {
                            for (const key in mws.completeData.websitesData[websiteURL].shortcuts) {
                                if (Object.hasOwnProperty.call(mws.completeData.websitesData[websiteURL].shortcuts, key)) {
                                    const shortcutObject = mws.completeData.websitesData[websiteURL].shortcuts[key];
                                    allMatchedUrlsShortcutsObjects[key] = shortcutObject
                                }
                            }
                        }
                    }
                    // Checking for Full Path
                    if ((urlObject.hash || urlObject.search) && (mws.currentURLObject.href == urlObject.href)) {
                        if (!isObjEmpty(mws.completeData.websitesData[websiteURL].shortcuts)) {
                            for (const key in mws.completeData.websitesData[websiteURL].shortcuts) {
                                if (Object.hasOwnProperty.call(mws.completeData.websitesData[websiteURL].shortcuts, key)) {
                                    const shortcutObject = mws.completeData.websitesData[websiteURL].shortcuts[key];
                                    allMatchedUrlsShortcutsObjects[key] = shortcutObject
                                }
                            }
                        }
                    }
                }
            }
        }
        mws.allMatchedUrlsShortcutsObjects = allMatchedUrlsShortcutsObjects

        mws.allShortcuts = Object.keys(mws.allMatchedUrlsShortcutsObjects)
        // console.log(mws.allShortcuts);

    },


    // Sets the new data (updated variables) to storage
    setDataOfCurrentWebsite: async function () {

        // Verifying if the entered data is valid, this is to prevent if the user does some mischief with the html code to crash the extension XD
        // Still one can crash it in someway, if you find another way, please report it immediately!
        if (mws.shortcutName.length > 20) {
            mws.shortcutName = mws.shortcutName.substring(0, 20);
        }
        let validActionsList = ['click', 'focus']
        if (!validActionsList.includes(mws.selectedAction)) {
            mws.selectedAction = 'click'
        }
        let validURLTypeList = ['domainAndAllPages', 'domainAndPage', 'onlyDomain', 'onlyPage', 'fullPath']
        if (!validURLTypeList.includes(mws.selectedURLType)) {
            mws.selectedURLType = 'domainAndAllPages'
        }

        // SAVING THE DATA
        let newShortcutData = {
            name: mws.shortcutName,
            enabled: true,

            // We will use mws.getSelectedType() once other types are added
            type: "singleElement",
            properties: {
                action: mws.selectedAction,
                urlType: mws.selectedURLType
            },

            // selected: { cssSelector: finder(mws.currentElement, { seedMinLength:5 , attr : (name, value)=>{return true}}) },
            selected: { cssSelector: mws.selectedElement},
        }


        // If it's just the domain
        if (mws.currentURLObject.pathname == '/' && (!mws.currentURLObject.hash && !mws.currentURLObject.search)) {
            mws.domainData.shortcuts[mws.selectedShortcut] = newShortcutData
            mws.allWebsitesData[mws.domainURL] = mws.domainData
        }
        // If not just the domain
        else {
            // Adding shortcut to domain if the urlType is having any of the domain values
            if (mws.selectedURLType == "domainAndPage" || mws.selectedURLType == "onlyDomain" || mws.selectedURLType == "domainAndAllPages") {
                // Checking if Shortcut exists for the domain or not
                if (!mws.domainData.shortcuts[mws.selectedShortcut]) { // Shortcut doesn't exist for domain
                    mws.domainData.shortcuts[mws.selectedShortcut] = newShortcutData
                    mws.allWebsitesData[mws.domainURL] = mws.domainData
                }
                else {  // Shortcut exists for domain
                    if (await confirmationDialogOpener(`The shortcut <kbd class="mws-element">${mws.selectedShortcut}</kbd class="mws-element"> already  exists for the domain, do you want to overwrite it?`)) {
                        mws.domainData.shortcuts[mws.selectedShortcut] = newShortcutData
                        mws.allWebsitesData[mws.domainURL] = mws.domainData
                    }
                    else {
                        return false
                    }
                }
            }

            // If shortcut is NOT supposed to be set only for the domain, only then set it in the pages
            if (!(mws.selectedURLType == "onlyDomain") && !(mws.selectedURLType == "domainAndAllPages")) {
                // If we need to set it for the page but the URL is having hash or search params then it's a problem, so this condition prevents that.
                // Else the data of full path would have overwritten the data of the page.
                if (mws.selectedURLType == "onlyPage" || mws.selectedURLType == "domainAndPage") {
                    mws.websiteData.shortcuts[mws.selectedShortcut] = newShortcutData
                    mws.allWebsitesData[mws.selectedURL] = mws.websiteData
                }
                else if (mws.selectedURLType == "fullPath") {
                    mws.fullPathData.shortcuts[mws.selectedShortcut] = newShortcutData
                    mws.allWebsitesData[mws.selectedURL] = mws.fullPathData
                }
            }
        }


        mws.completeData.websitesData = mws.allWebsitesData
        // console.log(mws.allWebsitesData);
        await chrome.storage.local.set({ ...mws.completeData })

        return true
    },


    // --------- EVENT FUNCTIONS ---------

    // This function will add or Remove a class to the hovered element that gives it a border 
    addRemoveborder: function (event) {
        let [x, y] = [event.x, event.y]


        if (mws.currentState.keyboardShortcutSelectorOpen) {
            return
        }
        if (!mws.currentState.elementSelectionOn) {
            return
        }

        // If currentElement already exists then remove the class
        if (mws.currentElement) {
            mws.currentElement.classList.remove('mws-bordered')
        }

        if (getElemAt(x, y) && getElemAt(x, y).classList.contains('mws-element')) {
            mws.currentElement = undefined
            setTextContent(qS('.mws-currentElementSpan'), 'No Element Selected')
            qS('.mws-selectElementButton').disabled = true
            return
        }
        mws.currentElement = getElemAt(x, y);
        qS('.mws-selectElementButton').disabled = false


        // mws.currentElement.classList.add('mws-bordered')
        if ((mws.currentElement).tagName) {
            setTextContent(qS('.mws-currentElementSpan'), (mws.currentElement).tagName)
        }

        addClass(mws.currentElement, ['mws-bordered'])

        // // console.log(mws.currentElement);
        // // console.log(finder(mws.currentElement));

    },

    // This func tracks when a user clicks anywhere in the window, mainly used to select the clicked elements
    whenClicked: function (event) {
        if (!mws.currentElement) {
            return
        }
        const clickedElement = mws.currentElement;
        if (!mws.currentState.elementSelectionOn) {
            return

        }
        if (clickedElement.classList.contains('mws-element')) {
            return
        }
        if (mws.currentState.elementSelectionPaused) {
            return

        }
        // if (!mws.isElementFocusable(clickedElement)) {
        //     // console.log("Not Focusable");
        //     return
        // }
        // // console.log(mws.currentElement);

        if (!mws.currentState.keyboardShortcutSelectorOpen) {
            event.preventDefault()
            event.stopPropagation()
            rmClass(mws.currentElement, ['mws-bordered'])
            mws.openKeyboardShortcutSelectionDialog()
        }

        // This code will be there when multiple click functionality is added

        // clickedElement.classList.add("mws-clicked")
        // if (!clickedElementsArray.contains(mws.currentElement)) {
        //     clickedElementsArray.push(mws.currentElement)
        //     mws.currentElement.setAttribute('data-index', `${clickedElementsArray.length}`)
        // }

    },


    // Track keyboard key for shortcut selection when the dialog is open 
    keyboarder: function (e) {
        // console.log(e);
        let pressedKey = e.key;

        if (mws.currentState.keyboardShortcutSelectionOn) {
            const keyCode = e.keyCode || e.which;


            // console.log(keyCode);
            // console.log((keyCode >= 65 && keyCode <= 90));
            // console.log((keyCode >= 48 && keyCode <= 57));
            // console.log((keyCode >= 186 && keyCode <= 192));
            // console.log((keyCode >= 219 && keyCode <= 222));
            // Check if it's a character key (alphabets and numbers)
            if (
                (keyCode >= 65 && keyCode <= 90) ||   // A-Z
                (keyCode >= 48 && keyCode <= 57) ||   // 0-9
                (keyCode >= 186 && keyCode <= 192) || // Special characters like ";", "=", ",", ".", "/", etc.
                (keyCode >= 219 && keyCode <= 222)    // Punctuation characters like "[", "]", "\", and "'"
            ) {    // 0-9
                // It's a character key

                if (!mws.allShortcuts.includes(pressedKey)) {
                    e.preventDefault()

                    mws.selectedShortcut = pressedKey
                    setTextContent(qS('.mws-selectedShortcutKBD'), `${pressedKey}`)

                    rmClass(qS('.mws-selectedShortcutKBD'), ['active'])
                    rmClass(qS('.mws-selectedShortcutKBD'), ['shortcutExists'])


                    const selectionDoneButton = qS('.mws-shortcutSelectionDoneButton')

                    switchClass(selectionDoneButton, 'onSelection', 'editSelection')

                    mws.enableOtherSettings()

                    mws.currentState.keyboardShortcutSelectionOn = false;
                    mws.playSoundEffect('keyAccepted')
                    // console.log("Pressed Key:", pressedKey);
                }
                else {
                    addClass(qS('.mws-selectedShortcutKBD'), ['shortcutExists'])
                    setTextContent(qS('.mws-selectedShortcutKBD'), `${pressedKey}`)

                }
            }
        }
    },

    sendSelectorDisabledMsg: async function (e) {
        // console.log("Sending Selector Disabled message");
        await sendMsg({ msg: "selectorDisabled", spread: true })
    },

    pauseResumeSelection: (e) => {
        if (mws.currentState.elementSelectionOn) {
            // e.preventDefault()
            // // console.log(e);
            if (e.type == "keydown") {
                // keyCode of both ControlLeft and ControlRight is 17, bcoz obv both are Control keys
                if (e.keyCode == 17) {
                    if (mws.currentState.elementSelectionPaused) {
                        window.addEventListener('mouseover', mws.addRemoveborder);
                        mws.currentState.elementSelectionPaused = false
                        qS(".mws-disableElementSelectionSpan").innerText = (qS(".mws-disableElementSelectionSpan").innerText).replace(' (Paused)', '')
                        mws.playSoundEffect('unpause', 0.2)
                        // qS('.mws-selectElementButton').style.display = 'none'
                        updateCSS(qS('.mws-selectElementButton'), { display: "none !important" })
                        // // console.log(qS('.mws-element button.mws-selectElementButton').style.display);
                    }
                    else {
                        // qS('.mws-element button.mws-selectElementButton').style.display = 'flex'
                        updateCSS(qS('.mws-selectElementButton'), { display: "flex !important" })
                        // console.log(qS('.mws-selectElementButton').style.display);
                        mws.playSoundEffect('pause', 0.2)
                        window.removeEventListener('mouseover', mws.addRemoveborder);
                        mws.currentState.elementSelectionPaused = true
                        qS(".mws-disableElementSelectionSpan").innerText = qS(".mws-disableElementSelectionSpan").innerText + " (Paused)"
                    }
                }

            }
            // if (e.type == "keyup") {
            //     if (e.keyCode == 17) {
            //         window.addEventListener('mouseover', mws.addRemoveborder);
            //     }
            // }

        }
    },

    // Turner Functions: These functions add or remove events from window/DOM elements

    turnOnKeyboardEvents: () => {
        window.addEventListener('keydown', mws.keyboarder)

    },
    turnOffKeyboardEvents: () => {
        window.removeEventListener('keydown', mws.keyboarder)
    },

    accidentalUnloadPreventer: function (e) {
        e.preventDefault();
        e.returnValue = '';
    },


    turnOnWindowUnloadStopper: function () {
        window.addEventListener("beforeunload", mws.accidentalUnloadPreventer);
    },
    turnOffWindowUnloadStopper: function () {
        window.removeEventListener("beforeunload", mws.accidentalUnloadPreventer);
    },



    // HELPER FUNCTIONS: These functions are used by other functions in order to do a specific task like 

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

    removeAllEventListenersOfElements: function (elementsArray = []) {
        elementsArray.forEach(element => {
            const clonedElement = element.cloneNode(true);
            element.parentNode.replaceChild(clonedElement, element);
        })
    },

    enableOtherSettings: function () {
        const nameInput = qS('.mws-shortcutNameInput')
        nameInput.disabled = false
        // Set the selection range to the end of the text
        nameInput.selectionStart = nameInput.value.length;
        nameInput.selectionEnd = nameInput.value.length;
        nameInput.focus()

        const urlTypeSelect = qS('.mws-urlTypeSelect')
        urlTypeSelect.disabled = false
        const actionSelect = qS('.mws-actionSelect')
        actionSelect.disabled = false


        setEvent(nameInput, "keyup", (e) => {
            mws.shortcutName = nameInput.value

            if (nameInput.value.length > 0) {
                qS('.mws-allDoneButton').disabled = false
            }
            else {
                qS('.mws-allDoneButton').disabled = true
            }
        })

    },
    disableOtherSettings: function () {

        qS('.mws-allDoneButton').disabled = true

        const nameInput = qS('.mws-shortcutNameInput')
        nameInput.disabled = true
        const urlTypeSelect = qS('.mws-urlTypeSelect')
        urlTypeSelect.disabled = true
        const actionSelect = qS('.mws-actionSelect')
        actionSelect.disabled = true

        mws.removeAllEventListenersOfElements([nameInput])

        // setEvent(nameInput, "keyup", (e) => {mws.shortcutName = nameInput.value})

    },




    prevAudio: '',
    playSoundEffect: function (soundEffectName = 'click', volume = 1) {
        if (!mws.completeData.globalSettings.optionsPageSettings.optionsPageSoundsEnabled) {
            return
        }
        let audio;

        if (mws.prevAudio && audio.src == mws.prevAudio.src) {
            audio = mws.prevAudio
        }
        else {
            let audioFileLink = chrome.runtime.getURL(`src/assets/sounds/${soundEffectName}.mp3`);
            audio = new Audio(audioFileLink)
        }
        audio.currentTime = 0; // Reset the audio to the beginning
        audio.volume = volume
        audio.play(); // Play the audio file
    },

    openKeyboardShortcutSelectionDialog: async function () {
        // mws.selectedElement = mws.currentElement
        // mws.selectedElement = finder((mws.currentElement), { seedMinLength: 5, attr: (name, value) => { return true } })
        mws.selectedElement = finder(mws.currentElement)
        mws.selectedElement = (mws.selectedElement).replace('mws-bordered', '')

        mws.turnOnKeyboardEvents()

        mws.currentState.keyboardShortcutSelectorOpen = true;
        mws.currentState.keyboardShortcutSelectionOn = true;

        mws.switchOffSelector()

        const keySelectorHTMLFileURL = chrome.runtime.getURL('src/scripts/keySelector.html');
        await fetch(keySelectorHTMLFileURL).then(response => response.text()).then(html => {
            mws.extensionElementsInnerHTML.keyboardShortcutSelectorDialog = html
        });

        let dialogElementData = {
            tagName: 'dialog',
            attributes: {
                classes: ['mws-element', 'mws-keyboardShortcutSelectionDialog']
            },
            // childElements: [spanElement, buttonElement]
            innerHTML: mws.extensionElementsInnerHTML.keyboardShortcutSelectorDialog
        }

        let dialogElement = elementCreator(dialogElementData)
        mws.addClassToChildElements(dialogElement, 'mws-element');


        qSA('button', dialogElement).forEach((buttonElement) => {
            buttonElement.addEventListener('click', () => {
                mws.playSoundEffect('click')
            })
            buttonElement.addEventListener('mouseenter', () => {
                if (!buttonElement.disabled && !buttonElement.classList.contains('onSelection')) {
                    mws.playSoundEffect('hover', 0.3)
                }
            })
        })


        qSA('select', dialogElement).forEach((selectTag) => {
            selectTag.addEventListener('mouseenter', () => {
                if (!selectTag.disabled) {
                    mws.playSoundEffect('hover', 0.3)
                }
            })
        })



        document.body.appendChild(dialogElement)
        mws.playSoundEffect('click2')

        mws.turnOnKeyboardEvents()
        mws.disableOtherSettings()


        const selectionDoneButton = qS('.mws-shortcutSelectionDoneButton')
        selectionDoneButton.addEventListener('click', (e) => {
            e.preventDefault()
            if (mws.currentState.keyboardShortcutSelectionOn) {
                switchClass(selectionDoneButton, 'onSelection', 'editSelection')
                mws.enableOtherSettings()
                rmClass(qS('.mws-selectedShortcutKBD'), ['active'])
            }
            else {
                mws.playSoundEffect('enterKey')
                addClass(qS('.mws-selectedShortcutKBD'), ['active'])
                switchClass(selectionDoneButton, 'editSelection', 'onSelection')
                mws.disableOtherSettings()
            }
            mws.currentState.keyboardShortcutSelectionOn = !mws.currentState.keyboardShortcutSelectionOn
            // if (mws.selectedShortcut == undefined) { return }

        })


        // URL TYPE SELECTOR
        const urlTypeSelectInput = qS('.mws-urlTypeSelect', dialogElement)
        if (mws.currentURLObject.pathname == "/") {
            qS('option[value="custom"]', urlTypeSelectInput).disabled = true
            qS('option[value="domainAndPage"]', urlTypeSelectInput).disabled = true
            qS('option[value="onlyPage"]', urlTypeSelectInput).disabled = true
        }
        if (!mws.currentURLObject.hash && !mws.currentURLObject.search) {
            qS('option[value="fullPath"]', urlTypeSelectInput).disabled = true

        }
        urlTypeSelectInput.addEventListener('change', (e) => {
            let selectedValue = e.srcElement.value
            let urlToSetFor;
            mws.selectedURLType = selectedValue

            let editCustomShortcutButton = qS('.mws-editCustomShortcutButton')
            editCustomShortcutButton.style.display = 'none'

            qS('.mws-allDoneButton').disabled = false

            if (selectedValue == 'domainAndAllPages') {
                urlToSetFor = mws.currentURLObject.origin
            }
            else if (selectedValue == 'domainAndPage') {
                urlToSetFor = mws.currentURLObject.origin + mws.currentURLObject.pathname
            }
            else if (selectedValue == 'onlyDomain') {
                urlToSetFor = mws.currentURLObject.origin
            }
            else if (selectedValue == 'onlyPage') {
                urlToSetFor = mws.currentURLObject.origin + mws.currentURLObject.pathname

            }
            else if (selectedValue == 'fullPath') {
                urlToSetFor = mws.currentURLObject.href
            }
            else if (selectedValue == 'custom') {

                let customURLEditorDialog = qS('.mws-customURLEditorDialog')

                const customURLEditorWrapper = qS('.mws-customURLEditor-wrapper', customURLEditorDialog)
                const confirmCustomURLButton = qS('.mws-confirmCustomURLButton', customURLEditorDialog)
                confirmCustomURLButton.disabled = true


                function openCustomURLEditorDialog() {
                    confirmCustomURLButton.disabled = true
                    customURLEditorDialog.style.display = "flex"
                    customURLEditorDialog.showModal()
                }

                editCustomShortcutButton.style.display = 'flex'


                editCustomShortcutButton.addEventListener('click', (e) => {
                    if (mws.customURL) {
                        openCustomURLEditorDialog()
                    }
                })

                let customURL;
                if (!mws.customURL) {
                    qS('.mws-allDoneButton').disabled = true

                    customURLEditorWrapper.innerHTML = ''
                    let originSpan = document.createElement('span')
                    originSpan.innerText = mws.currentURLObject.origin
                    customURLEditorWrapper.appendChild(originSpan)

                    // Pages
                    let pagesArray = (mws.currentURLObject.pathname).split('/')
                    pagesArray.forEach((page) => {
                        if (page) {
                            let input = document.createElement('input')
                            let span = document.createElement('span')
                            input.value = page
                            let encoded = encodeURIComponent(page)
                            setAttr(input, 'data-originalValue', encoded)
                            span.innerText = "/"
                            customURLEditorWrapper.appendChild(span)
                            customURLEditorWrapper.appendChild(input)
                        }
                    })

                    // Query Parameters
                    let queryText = mws.currentURLObject.search;
                    // let queryTextWithoutFirstQuestionMark = queryText.replace('?', '');

                    if (queryText) {
                        let span = document.createElement('span')
                        span.innerText = "?"
                        customURLEditorWrapper.appendChild(span)

                        let input = document.createElement('input')
                        input.value = queryText.replace('?', '')
                        addClass(input, ['mws-queryParametersInput'])
                        setAttr(input, 'data-originalValue', queryText)
                        customURLEditorWrapper.appendChild(input)
                    }

                    // Hash Fragment
                    const hashFragment = mws.currentURLObject.hash
                    if (hashFragment) {
                        let span = document.createElement('span')
                        span.innerText = "#"
                        customURLEditorWrapper.appendChild(span)

                        let input = document.createElement('input')
                        input.value = hashFragment.replace('#', '')
                        let encoded = encodeURIComponent(hashFragment.replace('#', ''))
                        addClass(input, ['mws-hashFragmentInput'])
                        setAttr(input, 'data-originalValue', encoded)

                        customURLEditorWrapper.appendChild(input)
                    }

                    let customURLEditorWrapperChildrenArray = Array.from(customURLEditorWrapper.children)
                    // console.log("customURLEditorWrapperChildrenArray:", customURLEditorWrapperChildrenArray);
                    // let prevCustomURL;
                    qSA('input', customURLEditorWrapper).forEach(inputElement => {
                        setEvent(inputElement, 'input', (e) => {
                            let editedValue = e.srcElement.value
                            // let previousValue = getAttr(inputElement, 'data-previousValue') || ""
                            // // console.log("Previous value was:", previousValue);
                            let originalValue = getAttr(inputElement, 'data-originalValue')
                            if (inputElement.classList.contains('mws-queryParametersInput')) {
                                // // console.log("This is queryParametersInput");
                                editedValue = '?' + editedValue
                            }
                            else if (inputElement.classList.contains('mws-hashFragmentInput')) {
                                editedValue = '#' + editedValue
                                originalValue = encodeURIComponent(originalValue)
                                originalValue = '#' + originalValue
                            }
                            else {
                                originalValue = encodeURIComponent(originalValue)
                            }

                            // let changedValue = (mws.currentURLObject.href).replace(originalValue, editedValue)
                            let changedValue = "";

                            customURLEditorWrapperChildrenArray.forEach(e => {
                                changedValue += (e.tagName == 'SPAN') ? e.innerText : e.value
                            })
                            // console.log("Changed Value:", changedValue);


                            if (!mws.customURL) {
                                // console.log("No Set Custom URL!!!");
                                if (changedValue != mws.currentURLObject.href) {
                                    // console.log();
                                    // console.log(changedValue != mws.currentURLObject.href);
                                    // console.log(mws.currentURLObject.href);
                                    customURL = changedValue
                                    // console.log("CHANGING: Different value than website URL", customURL);
                                    confirmCustomURLButton.disabled = false
                                }
                                else {
                                    // console.log("NOT CHANGING: Same value as website URL");
                                    customURL = ''
                                    confirmCustomURLButton.disabled = true
                                }
                            }
                            else {
                                // console.log("Set Custom URL is there...");
                                if (changedValue != mws.customURL && changedValue != mws.currentURLObject.href) {
                                    customURL = changedValue
                                    // console.log("CHANGING: Different value than previous one & website URL", customURL);
                                    confirmCustomURLButton.disabled = false
                                }
                                else {
                                    // console.log("NOT CHANGING: Same value as previous one or website URL");
                                    customURL = ''
                                    confirmCustomURLButton.disabled = true
                                }
                            }
                            setAttr(inputElement, 'data-previousValue', editedValue)

                        })
                    })

                    setEvent(confirmCustomURLButton, 'click', () => {
                        // console.log("Done button Clicked, customURL:", customURL);
                        if (customURL) {
                            // console.log("Confirming edited url................");
                            mws.customURL = customURL
                            // prevCustomURL = customURL
                            mws.selectedURL = mws.customURL
                            // console.log("mws.customURL", mws.customURL);
                            qS('.mws-allDoneButton').disabled = false

                            qSA('input', customURLEditorWrapper).forEach(inputElement => {
                                setAttr(inputElement, 'data-inputValue', inputElement.value)
                                // console.log("data-inputValue is Set: ", inputElement.value);
                            })

                        }
                        closeCustomURLEditorDialogButton.click()

                    })
                    mws.addClassToChildElements(customURLEditorDialog, 'mws-element')

                    openCustomURLEditorDialog()



                }
                else {
                    // console.log("Custom URL exists");
                    // console.log(mws.customURL);

                    qS('.mws-allDoneButton').disabled = false
                }


                // Close Custom URL Editor
                let closeCustomURLEditorDialogButton = qS('.mws-closeCustomURLEditorDialogButton', customURLEditorDialog)
                closeCustomURLEditorDialogButton.addEventListener('click', (e) => {
                    qSA('input', customURLEditorWrapper).forEach(inputElement => {
                        let inputValue = getAttr(inputElement, 'data-inputValue')
                        // console.log("Closing, inputValue is:", inputValue);
                        if (inputValue) {
                            // // console.log("Closing, Set Input Value is:",inputValue);
                            inputElement.value = inputValue
                        }
                    })

                    customURLEditorDialog.close()
                    customURLEditorDialog.style.display = 'none'
                    // qS('.mws-allDoneButton').disabled = false

                    // console.log("Closing, mws.customURL:", mws.customURL);
                    if (!mws.customURL) {
                        // console.log("There is no set custom URL, removing edit button...");
                        editCustomShortcutButton.style.display = 'none'
                        // mws.selectedURL = mws.currentURLObject.origin

                        urlTypeSelectInput.value = 'domainAndAllPages'
                        const changeEvent = new Event('change', { bubbles: true, cancelable: true });
                        urlTypeSelectInput.dispatchEvent(changeEvent);

                        // qS('.mws-allDoneButton').disabled = false
                    }
                })

                // Insert MWS-Special Term Copy Button
                function copyToClipboard(text) {
                    navigator.clipboard.writeText(text).then(
                        () => {
                            // console.log("Text successfully copied to clipboard");
                        },
                        (err) => {
                            console.error("Failed to copy text to clipboard", err);
                        }
                    );
                }
                setEvent(qS('.mws-copySpecialStringButton', customURLEditorDialog), 'click', () => { copyToClipboard(qS('.mws-specialTermSelect').value) })


            }

            if (selectedValue != 'custom') {
                mws.selectedURL = urlToSetFor.replace(/\/$/, '')
            }
            // console.log("Selected URL is:", mws.selectedURL);
            // console.log("Selected URL Type is:", mws.selectedURLType);

        })


        // Action Selector
        const actionSelectInput = qS('.mws-actionSelect', dialogElement)
        actionSelectInput.addEventListener('change', (e) => {
            let selectedValue = e.srcElement.value
            mws.selectedAction = selectedValue
        })


        qS('.mws-allDoneButton').addEventListener('click', async (e) => {
            e.preventDefault()
            // await mws.getExistingDataOfCurrentWebsite()
            mws.currentElement = mws.selectedElement
            if (await mws.setDataOfCurrentWebsite()) {
                qS('.mws-allDoneButton').innerText = "Adding Shortcut..."
                mws.currentElement = null
                mws.closeKeyboardShortcutSelectionDialog()
            }

            // rmClass(mws.currentElement, ['mws-bordered'])
            // mws.currentElement = undefined;

        })

        setEvent(qS('.mws-closeKeyboardShortcutSelectionDialogButton'), 'click', (event) => {
            // rmClass(mws.currentElement, ['mws-bordered'])
            // mws.currentElement = undefined;

            mws.closeKeyboardShortcutSelectionDialog()
        })

        dialogElement.showModal()
    },

    closeKeyboardShortcutSelectionDialog: function () {
        // mws.switchOffSelector()
        mws.turnOffKeyboardEvents()

        mws.switchOnSelector()
        const dialogElement = qS('.mws-keyboardShortcutSelectionDialog')
        mws.customURL = ''
        mws.currentState.keyboardShortcutSelectorOpen = false;
        mws.currentState.keyboardShortcutSelectionOn = false;
        document.body.removeChild(dialogElement)
        // mws.openFloatingDiv()
    },

    isElementFocusable: function (element) {
        // // console.log(element.focusable);
        if (element.focusable) {
            return true;
        }
        // Check if the element has a tabIndex property
        // // console.log(element.tabIndex >= -1);
        if (typeof element.tabIndex === 'number') {
            // Elements with a tabIndex greater than or equal to -1 are focusable
            return element.tabIndex >= -1;
        }

        // If the element does not have a tabIndex property, check its nodeName
        const nodeName = element.nodeName.toLowerCase();
        const focusableNodeNames = ['a', 'button', 'input', 'select', 'textarea'];
        // const unFocusableNodeNames = ['a', 'button', 'input', 'select', 'textarea'];
        // console.log((focusableNodeNames.includes(nodeName)));
        if (focusableNodeNames.includes(nodeName)) {
            return true;
        }

    },

    // This function changes the state variable provided to it AND  updates the DOM, content & CSS of Elements created by mws(this extension) accordingly 
    changeStateAndUpdateDOM: (changedStateVariable = "") => {

        // These are functions that will be executed on a specific state variable changes 
        const reactionForStateChange = {
            elementSelectionOn: () => {
                if (qS('.mws-disableElementSelectionToggle-wrapper .mws-toggleSwitchInput')) {
                    qS('.mws-disableElementSelectionToggle-wrapper .mws-toggleSwitchInput').checked = mws.currentState[changedStateVariable] ? true : false
                }
                setTextContent(qS('.mws-currentElementSpan'), 'No Element Selected')

                if (mws.currentState.elementSelectionOn) {

                }
            },

            requiredShortcutDataFilled: () => {

            }

        }
        if (changedStateVariable) {
            mws.currentState[changedStateVariable] = !mws.currentState[changedStateVariable]
            reactionForStateChange[changedStateVariable]()
        }
    },


    // These functions (switchOffSelector, switchOnSelector) enable or disable the selection of elements,
    // they enable/disable the hover and click events and add/remove the extension's CSS classes to/from the DOM.
    switchOffSelector: function () {
        if (mws.currentElement) {
            rmClass(mws.currentElement, ['mws-bordered'])
        }
        mws.currentState.elementSelectionPaused = false
        qS(".mws-disableElementSelectionSpan").innerText = (qS(".mws-disableElementSelectionSpan").innerText).replace(' (Paused)', '')
        qS('.mws-selectElementButton').style.display = 'none'


        mws.currentElement = null
        rmClass(qS('html'), ['mws-stylesForPage'])

        window.removeEventListener('mouseover', mws.addRemoveborder);
        window.removeEventListener('click', mws.whenClicked);
        window.removeEventListener('keydown', mws.pauseResumeSelection)


        mws.changeStateAndUpdateDOM("elementSelectionOn")
    },
    switchOnSelector: function () {
        addClass(qS('html'), ['mws-stylesForPage'])
        mws.changeStateAndUpdateDOM("elementSelectionOn")



        window.addEventListener('mouseover', mws.addRemoveborder);
        window.addEventListener('click', mws.whenClicked);
        window.addEventListener('keydown', mws.pauseResumeSelection)

    },
    // The function to trigger switchOnSelector or switchOffSelector depending on mws.currentState.elementSelectionOn
    switchSelector: () => {
        if (mws.currentState.elementSelectionOn) {
            mws.switchOffSelector()
        }
        else {
            mws.switchOnSelector()
        }
    },

    closeFloatingDiv: () => {
        document.body.removeChild(qS('.mws-floating-wrapper'))
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


    addClassToChildElements: function (parentElement, className) {
        // Get all child elements of the parent element
        const childElements = parentElement.querySelectorAll('*');

        // Add the specified class to each child element
        childElements.forEach((child) => {
            child.classList.add(className);
        })
    },
    openFloatingDiv: async function () {
        const elementSelectorHTMLFileURL = chrome.runtime.getURL('src/scripts/elementSelector.html');
        await fetch(elementSelectorHTMLFileURL)
            .then(response => response.text())
            .then(html => {
                mws.extensionElementsInnerHTML.elementSelectorDiv = html
            });

        let floatingDivData = {
            tagName: 'div',
            attributes: {
                classes: ['mws-element', 'mws-floating-wrapper']
            },
            innerHTML: mws.extensionElementsInnerHTML.elementSelectorDiv
        }
        let floatingDiv = elementCreator(floatingDivData)

        mws.addClassToChildElements(floatingDiv, 'mws-element');



        qSA('select', floatingDiv).forEach((selectTag) => {
            selectTag.addEventListener('mouseenter', () => {
                mws.playSoundEffect('hover')
            })
        })




        qSA('button', floatingDiv).forEach((button) => {
            button.addEventListener('click', () => {
                mws.playSoundEffect('click')
            })
        })

        qS('.mws-selectElementButton', floatingDiv).style.display = 'none'



        document.body.appendChild(floatingDiv)

        mws.makeElementDraggable(floatingDiv)

        mws.currentState.elementSelectorOpen = true

        setEvent(qS('.mws-toggleSwitchInput'), 'change', mws.switchSelector)


        qSA('.mws-toggleSwitchInput', floatingDiv).forEach((switchInputElement) => {
            switchInputElement.addEventListener('change', (e) => {
                if (e.srcElement.checked) {
                    mws.playSoundEffect('switchOn')
                }
                else {
                    mws.playSoundEffect('switchOff')
                }
            })
        })


        setEvent(qS('.mws-closeElementSelectorButton'), 'click', mws.turnOffEverything)

        setEvent(qS('.mws-selectElementButton'), 'click', () => {
            if (mws.currentElement) {
                mws.openKeyboardShortcutSelectionDialog()
            }
        })
    },

    selectorShortcuts: async (e) => {
        if (e.key == "Escape") {
            if (mws.currentState.keyboardShortcutSelectorOpen) {
                mws.closeKeyboardShortcutSelectionDialog()
            }
            else if (mws.currentState.elementSelectorOpen) {
                await mws.turnOffEverything()
            }

        }
        if (e.key == "Enter") {
            e.preventDefault()
            // // console.log(e.key);
            if (mws.currentState.keyboardShortcutSelectorOpen) {
                let allDoneButtonDisabled = qS('.mws-allDoneButton').disabled
                if (!allDoneButtonDisabled) {

                    e.preventDefault()
                    qS('.mws-allDoneButton').innerText = "Adding Shortcut..."
                    // await mws.getExistingDataOfCurrentWebsite()
                    mws.currentElement = mws.selectedElement
                    await mws.setDataOfCurrentWebsite()
                    mws.currentElement = null

                    // rmClass(mws.currentElement, ['mws-bordered'])
                    // mws.currentElement = undefined;

                    mws.closeKeyboardShortcutSelectionDialog()

                }

            }
            else if (mws.currentState.elementSelectorOpen) {
                if (mws.currentElement) {
                    // // console.log("Selecting Element...");
                    mws.openKeyboardShortcutSelectionDialog()
                }
            }

        }
    },

    turnOnSelectorShortcuts: () => {
        window.addEventListener('keydown', mws.selectorShortcuts)
    },
    turnOffSelectorShortcuts: () => {
        window.removeEventListener('keydown', mws.selectorShortcuts)
    },
    turnOffEverything: async function () {
        await sendMsg({ msg: "selectorDisabled", spread: true })

        mws.turnOffWindowUnloadStopper()

        mws.switchOffSelector()
        mws.turnOffSelectorShortcuts()


        if (mws.currentElement) {
            rmClass(mws.currentElement, ['mws-bordered'])
        }
        // // console.log(mws.currentState.elementSelectorOpen);
        if (mws.currentState.elementSelectorOpen) {
            mws.closeFloatingDiv()
        }


    },
    turnOnEverything: async function () {
        mws.setCurrentURL()

        await mws.getExistingDataOfCurrentWebsite()

        await sendMsg({ msg: "selectorEnabled", spread: true })
        window.addEventListener("beforeunload", mws.sendSelectorDisabledMsg);

        mws.turnOnWindowUnloadStopper() // temporary change
        mws.switchOnSelector()


        mws.openFloatingDiv()

        mws.turnOnSelectorShortcuts()

    },



    init: async function () {

        mws.turnOnEverything()


        chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
            if (message.action === "turnOffSelector") {
                mws.turnOffEverything()
            }
            if (message.action === "turnOnSelector") {
                mws.turnOnEverything()
            }
        });

    }
}

mws.init()


chrome.storage.onChanged.addListener(async (changes) => {
    // console.log("Updating SETTER data");

    await mws.getExistingDataOfCurrentWebsite()
})