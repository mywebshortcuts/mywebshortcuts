
import "../forExtensionPages.css"
import { addClass, getAttr, qS, qSA, rmClass, setEvent, getCompleteData, switchClass, setAttr, setStorage, isObjEmpty, updateCSS } from "../modules/quickMethods";
import "./style.css"

// Import Font Awesome
import "../assets/font-awesome/css/fontawesome.css"
import "../assets/font-awesome/css/solid.css"
import "../assets/font-awesome/css/brands.css"
import "../assets/font-awesome/css/regular.css"


import createElement from "../modules/elementCreator"

import { confirmationDialogOpener } from '../modules/domElements'



const opt = {
    currentState: {

        activeGroup: '',
        websiteSelected: null,

        lights: {
            overlayOpacity: 0,
            leftCeilingLight: true,
            rightCeilingLight: true,
        },

    },

    completeData: {},
    websitesData: {},
    globalSettings: {},

    websitesList: [],

    domainsAndTheirPages: {},

    clearAllData: () => {
        chrome.storage.local.clear(() => {
            // console.log('All data in local storage has been cleared.');
            chrome.runtime.reload();
        });
    },
    deleteWebsite: async (url) => {
        delete opt.completeData.websitesData[url]
        await setStorage({ ...opt.completeData })

    },
    updateDOM: (changeSpecified = "initialize", ...args) => {


        function removeAllEventListenersOfElements(elementsArray = []) {
            elementsArray.forEach(element => {
                const clonedElement = element.cloneNode(true);
                element.parentNode.replaceChild(clonedElement, element);
            })
        }

        let prevAudio;
        function playSoundEffect(soundEffectName = 'click', volume = .2) {
            if (!opt.globalSettings.optionsPageSettings.optionsPageSoundsEnabled) {
                return
            }
            let audio;

            if (prevAudio && audio.src == prevAudio.src) {
                audio = prevAudio
            }
            else {
                audio = new Audio(`../assets/sounds/${soundEffectName}.mp3`)
            }
            // console.log("Playing: ", soundEffectName);

            audio.currentTime = 0; // Reset the audio to the beginning
            audio.volume = volume
            audio.play(); // Play the audio file
        }

        const domUpdaterFunctions = {

            actionFuncs: {

                closeWebsiteSettingsAndBackToWebsitesList: () => {
                    opt.currentState.websiteSelected = null

                    const websiteSettingsDiv = qS('.websiteSettingsDiv')
                    websiteSettingsDiv.style.display = 'none'
                    const websiteSettingsHeader = qS('.websiteSettingsHeader')
                    websiteSettingsHeader.style.display = 'none'

                    const urlsListWrapper = qS('.urlsList-wrapper')
                    urlsListWrapper.style.display = 'flex'


                    const searchBarWrapper = qS('.searchBar-wrapper')
                    searchBarWrapper.style.display = 'flex'

                    domUpdaterFunctions.actionFuncs.updateWebsitesList()
                },

                loadShortcuts: (websiteShortcuts) => {
                    const numberOfShortcutsSpan = qS('.numberOfShortcutsSpan')
                    numberOfShortcutsSpan.textContent = Object.keys(websiteShortcuts).length

                    const shortcutsListWrapper = qS('.shortcutsList-wrapper')

                    const childrenWithClass = shortcutsListWrapper.querySelectorAll('.shortcutSettings-wrapper');

                    if (childrenWithClass.length > 0) {
                        // If children with the class are found, remove them
                        childrenWithClass.forEach(child => {
                            shortcutsListWrapper.removeChild(child);
                        });
                    }

                    const shortcutSettingsWrapperTemplate = qS('.shortcutSettingsWrapperTemplate')

                    const url = opt.currentState.websiteSelected
                    const urlObject = new URL(url)

                    for (const shortcutKey in websiteShortcuts) {
                        if (Object.hasOwnProperty.call(websiteShortcuts, shortcutKey)) {
                            const urlType = websiteShortcuts[shortcutKey].properties.urlType
                            // console.log("urlType is:", urlType);
                            if (urlObject.pathname == '/') {
                                // console.log("Its a domain");
                            }
                            else {
                                // console.log("its a page");
                                if (urlType == "onlyDomain") {
                                    continue

                                }
                            }


                            const shortcutKeyObject = websiteShortcuts[shortcutKey];

                            const repeatedHTML = shortcutSettingsWrapperTemplate.content.cloneNode(true)


                            const shortcutSettingsWrapper = qS('.shortcutSettings-wrapper', repeatedHTML)

                            setAttr(shortcutSettingsWrapper, 'data-shortcutName', shortcutKeyObject.name)
                            setAttr(shortcutSettingsWrapper, 'data-shortcutKey', shortcutKey)
                            setAttr(shortcutSettingsWrapper, 'data-shortcutAction', shortcutKeyObject.properties.action)
                            setAttr(shortcutSettingsWrapper, 'data-shortcutEnabled', shortcutKeyObject.enabled)

                            qS('.shortcutNameSpan', shortcutSettingsWrapper).innerText = shortcutKeyObject.name
                            qS('.shortcutKeyKbd', shortcutSettingsWrapper).innerText = shortcutKey
                            qS('.shortcutKeyKbd', shortcutSettingsWrapper).title = shortcutKey

                            const urlTypeSpan = qS('.urlTypeSpan', shortcutSettingsWrapper)
                            urlTypeSpan.innerText = shortcutKeyObject.properties.urlType
                            
                            const actionSpan = qS('.actionSpan', shortcutSettingsWrapper)
                            actionSpan.innerText = shortcutKeyObject.properties.action
                            if (shortcutKeyObject.properties.urlType == "domainAndAllPages") {
                                urlTypeSpan.innerText = "Domain and all its pages"
                                
                            }
                            else if (shortcutKeyObject.properties.urlType == "domainAndPage"){
                                urlTypeSpan.innerText = "Domain and a page"
                                
                            }
                            else if (shortcutKeyObject.properties.urlType == "onlyDomain"){
                                urlTypeSpan.innerText = "Only Domain"
                                
                            }
                            else if (shortcutKeyObject.properties.urlType == "onlyPage"){
                                urlTypeSpan.innerText = "Only Page"
                                
                            }
                            else if (shortcutKeyObject.properties.urlType == "fullPath"){
                                urlTypeSpan.innerText = "Full Path"
                                
                            }
                            else if (shortcutKeyObject.properties.urlType == "custom"){
                                urlTypeSpan.innerText = "Custom"

                            }


                            qS('.toggleSwitchInput', shortcutSettingsWrapper).checked = shortcutKeyObject.enabled

                            // ------------------------- Enable/Disable Shortcut -------------------------
                            qS('.toggleSwitchInput', shortcutSettingsWrapper).addEventListener('change', async function (event) {
                                if (event.target.checked) {
                                    // console.log('Extension Enabled');
                                    playSoundEffect('switchOn')
                                    opt.completeData.websitesData[url].shortcuts[shortcutKey].enabled = true
                                } else {
                                    // console.log('Extension Disabled');
                                    playSoundEffect('switchOff')
                                    opt.completeData.websitesData[url].shortcuts[shortcutKey].enabled = false
                                }
                                await setStorage({ ...opt.completeData })

                            });


                            // ------------------------- Edit Shortcut Settings Dialog Opener -------------------------


                            let editedProperties = {
                                key: null,
                                name: null,
                                action: null,
                            }
                            const editShortcutButton = qS('.editShortcutButton', shortcutSettingsWrapper)
                            setEvent(editShortcutButton, 'click', async () => {

                                playSoundEffect('click', 1)

                                // Creating Edit Shortcut Dialog Element
                                const editShortcutDialogHTMLFileURL = chrome.runtime.getURL('src/options/editShortcutDialog.html');
                                let editShortcutDialogInnerHTML = ``;
                                await fetch(editShortcutDialogHTMLFileURL).then(response => response.text()).then(html => {
                                    editShortcutDialogInnerHTML = html
                                });
                                const dialogElementData = {

                                    tagName: "dialog",
                                    attributes: {
                                        classes: ['editShortcutSettingsDialog'],
                                    },
                                    innerHTML: editShortcutDialogInnerHTML,
                                }
                                let editShortcutSettingsDialog = createElement(dialogElementData)


                                const shortcutNameInput = qS('.shortcutNameInput', editShortcutSettingsDialog)
                                shortcutNameInput.value = shortcutKeyObject.name

                                const shortcutKeyEditKbd = qS('.selectedShortcutKBD', editShortcutSettingsDialog)
                                shortcutKeyEditKbd.innerText = shortcutKey

                                const shortcutKeyEditButton = qS('.shortcutSelectionDoneButton', editShortcutSettingsDialog)

                                const shortcutActionSelect = qS('.actionSelect', editShortcutSettingsDialog)
                                shortcutActionSelect.value = shortcutKeyObject.properties.action
                                
                                
                                shortcutActionSelect.addEventListener('change', (e) => {
                                    if (e.srcElement.value != shortcutKeyObject.properties.action) {
                                        // console.log("Value changed");
                                        editedProperties.action = e.srcElement.value
                                    }
                                    else {
                                        editedProperties.action = null
                                    }
                                    changeEditedState()
                                })

                                // const urlTypeSelect = qS('.urlTypeSelect', editShortcutSettingsDialog)
                                // urlTypeSelect.value = shortcutKeyObject.properties.urlType



                                let propertiesEdited = false;
                                let confirmEditedSettingsButton = qS('.confirmEditedSettingsButton', editShortcutSettingsDialog)
                                confirmEditedSettingsButton.disabled = true

                                function changeEditedState() {
                                    if ((editedProperties.key || editedProperties.name || editedProperties.action) && !shortcutSelectionEnabled) {
                                        propertiesEdited = true;
                                        confirmEditedSettingsButton.disabled = false
                                    }
                                    else {
                                        // console.log("Nothing changed");
                                        propertiesEdited = false;
                                        confirmEditedSettingsButton.disabled = true
                                    }
                                }
                                

                                setEvent(shortcutNameInput, 'keyup', () => {
                                    if (shortcutNameInput.value != shortcutKeyObject.name) {
                                        editedProperties.name = shortcutNameInput.value
                                    }
                                    else {
                                        editedProperties.name = null
                                    }
                                    changeEditedState()

                                })

                                let shortcutSelectionEnabled = false

                                function keyShortcutTracker(e) {
                                    if (!shortcutSelectionEnabled) {
                                        return
                                    }
                                    const activeElement = document.activeElement
                                    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                                        // console.log("Input h bhai");
                                        return;
                                    }


                                    const keyCode = e.keyCode || e.which;
                                    const pressedKey = e.key
                                    if (keyCode == 13) {
                                        // If it's an Enter key
                                        // // console.log(e);
                                        return
                                    }

                                    // console.log(keyCode);
                                    // console.log((keyCode >= 65 && keyCode <= 90));
                                    // console.log((keyCode >= 48 && keyCode <= 57));
                                    // console.log((keyCode >= 186 && keyCode <= 192));
                                    // console.log((keyCode >= 219 && keyCode <= 222));
                                    if (
                                        (keyCode >= 65 && keyCode <= 90) ||   // A-Z
                                        (keyCode >= 48 && keyCode <= 57) ||   // 0-9
                                        (keyCode >= 186 && keyCode <= 192) || // Special characters like ";", "=", ",", ".", "/", etc.
                                        (keyCode >= 219 && keyCode <= 222)    // Punctuation characters like "[", "]", "\", and "'"
                                    ) {
                                    // It's a character key
                                    // console.log("It's a characterkey");

                                    // This is an important part, we are going to extract all the shortcuts from the enabled urls or the same origin
                                    // so that one is able to access all the shortcuts that are available for the current url, if it's matched.
                                    // We will extract domain, page, full path (if hash & search params exist) and custom url shortcuts and merge them into 
                                    // one object for the onShortcutClicker to access.

                                    let allMatchedUrlsShortcutsObjects = []
                                    let currentURLObject = new URL(url)

                                    // Checking for Domain
                                    if (opt.completeData.websitesData[currentURLObject.origin] && !isObjEmpty(opt.completeData.websitesData[currentURLObject.origin].shortcuts)) {

                                        // If the current URL is NOT just the domain, simply add the shortcuts which have domainAndAllPages as their urlType
                                        if (currentURLObject.pathname != '/') {

                                            for (const key in opt.completeData.websitesData[currentURLObject.origin].shortcuts) {
                                                if (Object.hasOwnProperty.call(opt.completeData.websitesData[currentURLObject.origin].shortcuts, key)) {
                                                    const shortcutObject = opt.completeData.websitesData[currentURLObject.origin].shortcuts[key];
                                                    if (shortcutObject.properties.urlType == "domainAndAllPages") {
                                                        allMatchedUrlsShortcutsObjects[key] = shortcutObject
                                                    }

                                                }
                                            }
                                        }
                                        // If the current URL is just the domain, add all shortcuts
                                        else {

                                            for (const key in opt.completeData.websitesData[currentURLObject.origin].shortcuts) {
                                                if (Object.hasOwnProperty.call(opt.completeData.websitesData[currentURLObject.origin].shortcuts, key)) {
                                                    const shortcutObject = opt.completeData.websitesData[currentURLObject.origin].shortcuts[key];
                                                    allMatchedUrlsShortcutsObjects[key] = shortcutObject
                                                }
                                            }
                                        }
                                    }

                                    for (let websiteURL in opt.completeData.websitesData) {

                                        if (Object.hasOwnProperty.call(opt.completeData.websitesData, websiteURL)) {
                                            websiteURL = websiteURL
                                            const websiteData = opt.completeData.websitesData[websiteURL];
                                            let urlObject = new URL(websiteURL)

                                            // Check if the url is having the same origin, is enabled and is not just the origin
                                            if (urlObject.origin == currentURLObject.origin && (urlObject.pathname != '/')) {

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

                                                        // allMatchedUrlsShortcutsObjects.push({ ...opt.completeData.websitesData[websiteURL].shortcuts })
                                                        // addWebsiteShortcuts = true

                                                        if (!isObjEmpty(opt.completeData.websitesData[websiteURL].shortcuts)) {
                                                            for (const key in opt.completeData.websitesData[websiteURL].shortcuts) {
                                                                if (Object.hasOwnProperty.call(opt.completeData.websitesData[websiteURL].shortcuts, key)) {
                                                                    const shortcutObject = opt.completeData.websitesData[websiteURL].shortcuts[key];
                                                                }
                                                            }
                                                        }
                                                        continue
                                                    }

                                                }

                                                // Checking for Page
                                                // // console.log((currentURLObject.pathname).replace(/\/$/, '') == (urlObject.pathname).replace(/\/$/, ''));
                                                if (((currentURLObject.pathname).replace(/\/$/, '') == (urlObject.pathname).replace(/\/$/, '')) && !(urlObject.hash || urlObject.search)) {
                                                    if (!isObjEmpty(opt.completeData.websitesData[websiteURL].shortcuts)) {
                                                        for (const key in opt.completeData.websitesData[websiteURL].shortcuts) {
                                                            if (Object.hasOwnProperty.call(opt.completeData.websitesData[websiteURL].shortcuts, key)) {
                                                                const shortcutObject = opt.completeData.websitesData[websiteURL].shortcuts[key];
                                                                allMatchedUrlsShortcutsObjects[key] = shortcutObject
                                                            }
                                                        }
                                                    }
                                                }
                                                // Checking for Full Path
                                                if ((urlObject.hash || urlObject.search) && (currentURLObject.href == urlObject.href)) {
                                                    // console.log("Full Path matches");
                                                    if (!isObjEmpty(opt.completeData.websitesData[websiteURL].shortcuts)) {
                                                        for (const key in opt.completeData.websitesData[websiteURL].shortcuts) {
                                                            if (Object.hasOwnProperty.call(opt.completeData.websitesData[websiteURL].shortcuts, key)) {
                                                                const shortcutObject = opt.completeData.websitesData[websiteURL].shortcuts[key];
                                                                allMatchedUrlsShortcutsObjects[key] = shortcutObject
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    // let existingShortcutKeys = Object.keys(opt.websitesData[url].shortcuts)
                                    let existingShortcutKeys = Object.keys(allMatchedUrlsShortcutsObjects)
                                    let shortcutIndex = existingShortcutKeys.indexOf(shortcutKey);
                                    existingShortcutKeys.splice(shortcutIndex, 1);
                                    // console.log(existingShortcutKeys);

                                    shortcutKeyEditKbd.innerText = pressedKey
                                    if (existingShortcutKeys.includes(pressedKey)) {
                                        // console.log("Already exists");
                                        addClass(shortcutKeyEditKbd, ['shortcutExists'])
                                        return;
                                    }
                                    else {
                                        rmClass(shortcutKeyEditKbd, ['shortcutExists'])
                                    }
                                    // shortcutKeyEditKbd.innerText = e.key
                                    addClass(shortcutKeyEditKbd, ['active'])

                                    if (e.key != shortcutKey) {
                                        editedProperties.key = pressedKey
                                    }
                                    else {
                                        editedProperties.key = null
                                    }


                                    rmClass(shortcutKeyEditKbd, ['active'])
                                    shortcutSelectionEnabled = false
                                    // document.removeEventListener('keypress', keyShortcutTracker)
                                    switchClass(shortcutKeyEditButton, 'onSelection', 'editSelection')
                                    playSoundEffect('keyAccepted')
                                    shortcutKeyEditKbd.focus() // Prevent focusing on Edit Shortcut button
                                    changeEditedState()

                                }
                                }

                                function editShortcutButtonClicked() {
                                    playSoundEffect('enterKey')
                                    if (!shortcutSelectionEnabled) {
                                        shortcutSelectionEnabled = true
                                        switchClass(shortcutKeyEditButton, 'editSelection', 'onSelection')
                                        addClass(shortcutKeyEditKbd, ['active'])

                                        document.addEventListener('keydown', keyShortcutTracker)
                                    }
                                    else {
                                        // document.removeEventListener('keypress', keyShortcutTracker)
                                    }
                                }
                                setEvent(shortcutKeyEditButton, 'click', (e) => {
                                    editShortcutButtonClicked(e)
                                    changeEditedState()
                                })

                                editShortcutSettingsDialog.addEventListener('keydown', (e) => {
                                    if (e.key == 'Escape') {
                                        closeEditShortcutSettings()
                                    }
                                    else if (e.key == 'Enter') {
                                        if (!confirmEditedSettingsButton.disabled) {
                                            confirmEditedPropertiesAndSaveData()
                                        }
                                    }
                                })

                                async function confirmEditedPropertiesAndSaveData() {
                                    if (editedProperties.key) {
                                        opt.completeData.websitesData[url].shortcuts[editedProperties.key] = opt.completeData.websitesData[url].shortcuts[shortcutKey]
                                        delete opt.completeData.websitesData[url].shortcuts[shortcutKey]
                                    }
                                    if (editedProperties.name) {
                                        if (editedProperties.name.length > 20) {
                                            editedProperties.name = editedProperties.name.substring(0, 20);
                                        }
                                        if (!editedProperties.key) {
                                            opt.completeData.websitesData[url].shortcuts[shortcutKey].name = editedProperties.name
                                        }
                                        else {
                                            opt.completeData.websitesData[url].shortcuts[editedProperties.key].name = editedProperties.name
                                        }
                                    }
                                    if (editedProperties.action) {
                                        let validActionsList = ['click', 'focus']
                                        if (!validActionsList.includes(editedProperties.action)) {
                                            editedProperties.action = 'click'
                                        }
                                        if (!editedProperties.key) {
                                            // console.log(opt.completeData.websitesData[url].shortcuts[shortcutKey]);
                                            opt.completeData.websitesData[url].shortcuts[shortcutKey].properties.action = editedProperties.action
                                        }
                                        else {
                                            // console.log(opt.completeData.websitesData[url].shortcuts[shortcutKey]);
                                            opt.completeData.websitesData[url].shortcuts[editedProperties.key].properties.action = editedProperties.action
                                        }
                                    }

                                    await setStorage({ ...opt.completeData })

                                    closeEditShortcutSettings()
                                }

                                setEvent(confirmEditedSettingsButton, 'click', confirmEditedPropertiesAndSaveData)

                                function closeEditShortcutSettings() {
                                    playSoundEffect('click')
                                    shortcutSelectionEnabled = false
                                    document.removeEventListener('keydown', keyShortcutTracker)
                                    document.body.removeChild(editShortcutSettingsDialog)
                                }

                                const closeEditShortcutSettingsButton = qS('.closeEditShortcutSettingsButton', editShortcutSettingsDialog)
                                setEvent(closeEditShortcutSettingsButton, 'click', closeEditShortcutSettings)


                                document.body.appendChild(editShortcutSettingsDialog)
                                editShortcutSettingsDialog.showModal()
                            })

                            // ------------------------- Delete Shortcut Settings Dialog Opener -------------------------
                            const deleteShortcutButton = qS('.deleteShortcutButton', shortcutSettingsWrapper)
                            setEvent(deleteShortcutButton, 'click', async () => {
                                playSoundEffect('click', 1)

                                if (await confirmationDialogOpener("Are you sure you want to delete the shortcut?")) {

                                    delete opt.completeData.websitesData[url].shortcuts[shortcutKey]
                                    await setStorage({ ...opt.completeData })

                                    if (isObjEmpty(opt.completeData.websitesData[url].shortcuts)) {
                                        // console.log("Delete button clicked");
                                        if (await confirmationDialogOpener(`Warning: Deleting this website. Are you sure you want to proceed?`)) {
                                            opt.deleteWebsite(url)
                                            opt.currentState.websiteSelected = null
                                            opt.updateDOM('closeWebsiteSettingsAndBackToWebsitesList')
                                        }
                                    }
                                    else {
                                        domUpdaterFunctions.actionFuncs.loadShortcuts(websiteShortcuts)

                                    }

                                }
                                playSoundEffect('click', 1)
                            })


                            let mouseOver = false;
                            setEvent(shortcutSettingsWrapper, 'mouseenter', (e) => {
                                mouseOver = true
                                // // console.log(shortcutSettingsWrapper.classList.contains('hovered'));
                                if (shortcutSettingsWrapper.classList.contains('hovered')) {
                                    shortcutSettingsWrapper.classList.remove('hovered')
                                }
                                if (!(e.fromElement.classList.contains('toggleSwitchSpan'))) {
                                    playSoundEffect('hover')
                                }
                            })
                            setEvent(shortcutSettingsWrapper, 'mouseleave', () => {
                                mouseOver = false
                                // window.removeEventListener('keypress', editDeleteShortcutKeyboardShortcuts)
                            })
                            
                            // window.addEventListener('keypress', editDeleteShortcutKeyboardShortcuts)

                            function editDeleteShortcutKeyboardShortcuts(e) {
                                // console.log(e);
                                // if (!mouseOver) {
                                    // return
                                // }
                                if (e.key == 'e' || e.key == 'E') {
                                    editShortcutButton.click()
                                }
                                else if (e.key == 'd' || e.key == 'D') {
                                    deleteShortcutButton.click()
                                }
                            }

                            shortcutSettingsWrapper.id = shortcutKey
                            shortcutSettingsWrapper.title = shortcutKeyObject.name
                            // qSA('button', shortcutSettingsWrapper).forEach((button) => {
                            //     setEvent(button, 'click', () => { playSoundEffect('click') })
                            // })

                            shortcutsListWrapper.appendChild(shortcutSettingsWrapper)



                        }
                    }
                },

                openWebsiteSettings: (url) => {
                    // console.log(opt.websitesData);
                    if (!opt.websitesData[url]) {
                        // console.log("Doesn't exist in websitesdata", url);
                        return
                    }
                    const openedWebsiteSettings = opt.websitesData[url]
                    opt.currentState.websiteSelected = url

                    // Hide Websites List and Show Website Settings
                    const websiteSettingsDiv = qS('.websiteSettingsDiv')
                    websiteSettingsDiv.style.display = 'flex'
                    setAttr(websiteSettingsDiv, 'data-url', url)
                    const websiteSettingsHeader = qS('.websiteSettingsHeader')
                    websiteSettingsHeader.style.display = 'flex'

                    const urlsListWrapper = qS('.urlsList-wrapper')
                    urlsListWrapper.style.display = 'none'
                    const searchBarWrapper = qS('.searchBar-wrapper')
                    searchBarWrapper.style.display = 'none'


                    // URL Heading
                    // console.log(url);
                    let urlWithoutProtocol = url.replace(/^(https?|ftp):\/\//, '')
                    const urlHeading = qS('.urlHeading')
                    if (urlWithoutProtocol.length > 28) {
                        // console.log("Greater");
                        urlWithoutProtocol = urlWithoutProtocol.slice(0, 28);
                        urlWithoutProtocol = urlWithoutProtocol + '...';
                        // updateCSS(urlHeading, {'padding-left':'3.8rem'})
                    }
                    // updateCSS(urlHeading, {'padding-left':'0rem'})
                    if (urlWithoutProtocol.length > 28) {
                    }
                    else {
                    }
                    urlHeading.innerText = urlWithoutProtocol
                    urlHeading.href = url
                    urlHeading.title = url




                    // Removing existing event listeners
                    let deleteWebsiteButton = qS(`.deleteWebsiteButton`, websiteSettingsDiv)
                    let toggleSwitchInput = qS('.disableWebsiteToggle-wrapper .toggleSwitchInput')
                    let backToWebsitesListButton = qS('.backToWebsitesListButton')

                    removeAllEventListenersOfElements([deleteWebsiteButton, toggleSwitchInput, backToWebsitesListButton])

                    // Delete a website
                    deleteWebsiteButton = qS(`.deleteWebsiteButton`, websiteSettingsDiv)
                    async function deleteWebsiteButtonFunction() {
                        playSoundEffect('click')
                        // console.log("Delete button clicked");
                        confirmationDialogOpener(`Warning: Deleting this website. Are you sure you want to proceed?`).then(response => {
                            if (response) {
                                opt.deleteWebsite(url)
                                opt.currentState.websiteSelected = null
                                opt.updateDOM('closeWebsiteSettingsAndBackToWebsitesList')
                            }

                            playSoundEffect('click')
                        })

                    }
                    setEvent(deleteWebsiteButton, 'click', deleteWebsiteButtonFunction)




                    // ------------------------- Enable/Disable Website -------------------------
                    toggleSwitchInput = qS('.disableWebsiteToggle-wrapper .toggleSwitchInput')
                    toggleSwitchInput.checked = !openedWebsiteSettings.settings.enabled
                    async function toggleSwitchInputFunction(e) {
                        if (e.target.checked) {
                            // console.log('Website Disabled');
                            playSoundEffect('switchOff')
                            opt.completeData.websitesData[url].settings.enabled = false
                        } else {
                            // console.log('Website Enabled');
                            playSoundEffect('switchOn')
                            opt.completeData.websitesData[url].settings.enabled = true
                        }
                        await setStorage({ ...opt.completeData })

                    }
                    toggleSwitchInput.addEventListener('change', toggleSwitchInputFunction)


                    // Back Button
                    backToWebsitesListButton = qS('.backToWebsitesListButton')
                    backToWebsitesListButton.addEventListener('click', (e) => {
                        playSoundEffect('click', 0.5)
                        domUpdaterFunctions.actionFuncs.closeWebsiteSettingsAndBackToWebsitesList()
                    })

                    window.addEventListener('keydown', (e) => {
                        let activeElement = document.activeElement
                        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                            return;
                        }
                        if (e.key == 'Backspace') {
                            if (!qS('dialog[open]') && backToWebsitesListButton.parentElement.style.display != 'none') {
                                // console.log(backToWebsitesListButton);
                                backToWebsitesListButton.click()
                            }
                        }
                    })

                    const websiteShortcuts = openedWebsiteSettings.shortcuts

                    // Number of Shortcuts in heading
                    const numberOfShortcutsSpan = qS('.numberOfShortcutsSpan')
                    numberOfShortcutsSpan.textContent = Object.keys(websiteShortcuts).length


                    // Shortcuts Loader
                    domUpdaterFunctions.actionFuncs.loadShortcuts(websiteShortcuts)


                    // Search Shortcut

                    setEvent(qS('.shortcutsListHeader-wrapper .searchShortcutInput'), 'input', (e) => {
                        const searchedText = e.srcElement.value
                        let searchedText2 = searchedText.replace(/\s/g, "").toLowerCase()
                        let searchedText2Array = searchedText2.split('')


                        let termMatchedElementsArray = []
                        let charsMatchedElementsArray = []
                        qSA(`.shortcutSettings-wrapper`).forEach(element => {
                            if (!(searchedText2.length > 0)) {
                                element.style.display = 'flex'
                                return
                            }

                            let spanText = getAttr(element, 'data-shortcutname')
                            spanText = (spanText.replace(/\s/g, "")).toLowerCase()
                            let spanTextArray = spanText.split('')

                            element.style.display = 'none'


                            if (spanText.includes(searchedText2)) {
                                termMatchedElementsArray.push(element)
                            }
                            else if (!(termMatchedElementsArray.length > 0)) {


                                searchedText2Array.forEach(char => {
                                    if (spanTextArray.includes(char)) {
                                        charsMatchedElementsArray.push(element)
                                    }
                                })

                            }
                        })


                        if (termMatchedElementsArray.length > 0) {
                            termMatchedElementsArray.forEach(termMatchedElement => {
                                termMatchedElement.style.display = 'flex'
                            })
                            // console.log("Showing Terms Matched Elements");

                        }
                        else if (charsMatchedElementsArray.length > 0) {
                            charsMatchedElementsArray.forEach(charsMatchedElement => {
                                charsMatchedElement.style.display = 'flex'
                            })
                            // console.log("Showing Characters Matched Elements");
                        }
                        else {
                            // console.log("Nothing like that");
                        }

                        // console.log("-------------");
                        // // console.log(results);

                    })

                },

                changeActiveGroup: () => {

                    qSA('.settingsGroup').forEach((settingsGroup) => {
                        if (settingsGroup.id == opt.currentState.activeGroup) {
                            const previousGroup = qS('.settingsGroup.active')
                            rmClass(previousGroup, ['active'])

                            const previousActiveGroupButton = qS(`.navigationButton.active`)
                            rmClass(previousActiveGroupButton, ['active'])


                            const activeGroupButton = qS(`.navigationButton[data-groupID="${settingsGroup.id}"]`)

                            addClass(settingsGroup, ['active'])
                            addClass(activeGroupButton, ['active'])
                        }
                    })
                    opt.updateDOM()

                },

                updateWebsitesList: () => {

                    const templateElement = document.querySelector('.urlWrapperTemplate')

                    if (opt.websitesList.length == 0) {
                        return
                    }
                    const urlsListWrapper = document.body.querySelector('.urlsList-wrapper')
                    urlsListWrapper.innerHTML = ''

                    for (const origin in opt.domainsAndTheirPages) {
                        if (Object.hasOwnProperty.call(opt.domainsAndTheirPages, origin)) {
                            const pagesArray = opt.domainsAndTheirPages[origin];


                            let urlWrapperNode = templateElement.content.cloneNode(true)


                            qS('.urlSpan', urlWrapperNode).textContent = origin.replace(/^(https?|ftp):\/\//, '')

                            const urlWrapperDiv = qS('.url-wrapper', urlWrapperNode)
                            urlWrapperDiv.setAttribute('data-url', origin)

                            urlWrapperDiv.addEventListener('click', (e) => {
                                playSoundEffect('click', 1)
                                domUpdaterFunctions.actionFuncs.openWebsiteSettings(origin)

                            })


                            const openPagesListButton = qS('.openPagesListButton', urlWrapperDiv)

                            const subURLsWrapper = qS('.subURLs-wrapper', urlWrapperDiv)
                            subURLsWrapper.setAttribute('data-url', origin)


                            openPagesListButton.addEventListener('click', (e) => {
                                e.stopPropagation();
                                playSoundEffect('click', 1)
                                if (
                                    qS('.subURLs-wrapper.active') && !qS(`.subURLs-wrapper.active[data-url="${origin}"]`) &&
                                    qS('.url-wrapper.pagesListOpen') && !qS(`.url-wrapper.pagesListOpen[data-url="${origin}"]`)

                                ) {
                                    // console.log(qS('.subURLs-wrapper.active'));
                                    rmClass(qS('.subURLs-wrapper.active'), ['active'])
                                    rmClass(qS('.url-wrapper.pagesListOpen'), ['pagesListOpen'])
                                }
                                subURLsWrapper.classList.contains('active') ? rmClass(subURLsWrapper, ['active']) : addClass(subURLsWrapper, ['active'])
                                urlWrapperDiv.classList.contains('pagesListOpen') ? rmClass(urlWrapperDiv, ['pagesListOpen']) : addClass(urlWrapperDiv, ['pagesListOpen'])
                                // console.log("yoo");
                            })
                            const subURLsUnorderedList = qS('.subURLs-UnorderedList', urlWrapperDiv)

                            if (pagesArray.length > 0) {
                                subURLsUnorderedList.innerHTML = ''
                                pagesArray.forEach((pageURL) => {
                                    const listElement = document.createElement('li')
                                    listElement.classList.add('subURL-li')

                                    listElement.setAttribute('data-url', pageURL)
                                    listElement.title = pageURL
                                    listElement.tabindex = "1"

                                    listElement.addEventListener('mouseenter', (e) => {
                                        playSoundEffect('hover', 0.5)
                                        // console.log("hi");
                                    })
                                    listElement.addEventListener('click', (e) => {
                                        e.stopPropagation()
                                        playSoundEffect('click', 1)
                                        // console.log("Setting Click url", pageURL);
                                        domUpdaterFunctions.actionFuncs.openWebsiteSettings(pageURL)
                                    })


                                    // Extract special terms using a regular expression
                                    const specialTerms = pageURL.match(/~mws-[^~]+~/g);

                                    let innerHTML = pageURL;
                                    // If there are special terms, wrap them in a span
                                    if (specialTerms) {
                                        specialTerms.forEach((term) => {
                                            const span = document.createElement('span');
                                            span.className = 'specialTerm';
                                            span.textContent = term;

                                            // Replace the special term in the pageURL with the span
                                            innerHTML = pageURL.replaceAll(term, span.outerHTML);
                                        });
                                    }

                                    // listElement.innerText = pageURL.replace(/^(https?|ftp):\/\//, '')
                                    listElement.innerHTML = innerHTML.replace(origin, '')

                                    subURLsUnorderedList.appendChild(listElement)
                                    // domUpdaterFunctions.actionFuncs.openWebsiteSettings(pageURL)
                                })

                            }



                            urlWrapperDiv.addEventListener('mouseenter', (e) => {
                                playSoundEffect('hover')
                            })
                            urlWrapperDiv.title = origin



                            urlsListWrapper.appendChild(urlWrapperNode)
                        }
                    }

                },

                group2Activated: () => {
                    let disableEverywhereToggle = qS('.disableEverywhereToggle-wrapper .toggleSwitchInput')
                    let disableSoundToggle = qS('.disableSoundToggle-wrapper .toggleSwitchInput')

                    removeAllEventListenersOfElements([qS('.clearAllDataButton'), disableEverywhereToggle, disableSoundToggle])



                    // ------------------------- Enable/Disable Website -------------------------
                    disableEverywhereToggle = qS('.disableEverywhereToggle-wrapper .toggleSwitchInput')
                    disableEverywhereToggle.checked = !opt.completeData.globalSettings.extensionEnabled
                    disableEverywhereToggle.addEventListener('change', async (e) => {
                        if (e.target.checked) {
                            // console.log('Extension Disabled');
                            opt.completeData.globalSettings.extensionEnabled = false
                            playSoundEffect('switchOff')
                        } else {
                            // console.log('Extension Enabled');
                            playSoundEffect('switchOn')
                            opt.completeData.globalSettings.extensionEnabled = true
                        }
                        await setStorage({ ...opt.completeData })

                    })

                    // ------------------------- Enable/Disable Sounds -------------------------
                    disableSoundToggle = qS('.disableSoundToggle-wrapper .toggleSwitchInput')
                    disableSoundToggle.checked = !opt.globalSettings.optionsPageSettings.optionsPageSoundsEnabled
                    // // console.log(opt.globalSettings.optionsPageSettings);
                    // console.log(opt.completeData.globalSettings.optionsPageSettings.optionsPageSoundsEnabled);

                    // console.log(opt.globalSettings.optionsPageSettings.optionsPageSoundsEnabled);
                    disableSoundToggle.addEventListener('change', async (e) => {
                        if (e.target.checked) {
                            // console.log('Sounds Disabled');
                            playSoundEffect('switchOff')
                            opt.completeData.globalSettings.optionsPageSettings.optionsPageSoundsEnabled = false
                        } else {
                            // console.log('Sounds Enabled');
                            opt.completeData.globalSettings.optionsPageSettings.optionsPageSoundsEnabled = true
                        }
                        await setStorage({ ...opt.completeData })
                        if (opt.completeData.globalSettings.optionsPageSettings.optionsPageSoundsEnabled = true) {
                            playSoundEffect('switchOn')

                        }
                        // console.log(opt.completeData.globalSettings.optionsPageSettings.optionsPageSoundsEnabled);

                    })

                    // Clear All Data Button
                    setEvent(qS('.clearAllDataButton'), 'click', async (e) => {
                        playSoundEffect('click')
                        if (await confirmationDialogOpener('Warning: Deleting all data. Are you sure you want to proceed?')) {
                            opt.clearAllData()
                        }
                        playSoundEffect('click')

                    })


                },


                group3Activated: () => {
                    // console.log("Heyy it's about pageee");

                    let settingsGroupLinks = qSA('.usefulLinks-wrapper .links')
                    removeAllEventListenersOfElements(settingsGroupLinks)
                    
                    settingsGroupLinks = qSA('.usefulLinks-wrapper .links')
                    // console.log(settingsGroupLinks);

                    settingsGroupLinks.forEach(link=>{
                        setEvent(link, 'mouseenter', () => {
                            playSoundEffect('hover', 0.3)
                        })
                        if (link.classList.contains('sponsorLink')) {
                            setEvent(link, 'click', () => {
                                playSoundEffect('sponsor')
                            })
                            
                        }
                        else{
                            setEvent(link, 'click', () => {
                                playSoundEffect('click2')
                            })
                        }
                    })

                }

            },

            init: function () {
                // console.log("Initializing...");


                function keyboardShortcuts(e) {
                    let activeElement = document.activeElement
                    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                        // An input element is focused; don't execute your shortcut
                        return;
                    }

                    if (e.key == 'l') {
                        qSA('.ceilingLight-wrapper').forEach(ceilingLightWrapper => {
                            switchLightState(ceilingLightWrapper)
                            overlayOpacityUpdater()
                        })
                        overlayOpacityUpdater()
                    }

                    if (e.key == 'e' || e.key == 'E') {
                        if (activeElement.classList.contains('shortcutSettings-wrapper') || qS('.shortcutSettings-wrapper:hover')) {
                            (qS('.shortcutSettings-wrapper:focus .editShortcutButton') || qS('.shortcutSettings-wrapper:hover .editShortcutButton')).click()
                        }
                    }
                    else if (e.key == 'd' || e.key == 'D') {
                        if (activeElement.classList.contains('shortcutSettings-wrapper') || qS('.shortcutSettings-wrapper:hover')) {
                            (qS('.shortcutSettings-wrapper:focus .deleteShortcutButton') || qS('.shortcutSettings-wrapper:hover .deleteShortcutButton')).click()
                        }
                    }
                    else if (e.key == 'Escape') {
                        if (qS('dialog[open]')) {
                            console.log(qS('dialog[open] i.fa-close'));
                            qS('dialog[open] i.fa-close').click()
                        }
                    }
                    else if (['1', '2', '3'].includes(e.key)){
                        let groupButton = qS(`.navigationButton[data-groupid="g${e.key}"]:not(.active)`)
                        console.log(groupButton);
                        groupButton.dispatchEvent(new MouseEvent('click'))
                    }
                }

                window.addEventListener('keydown', keyboardShortcuts)



                qSA('.navigationButton').forEach((navigationButton) => {
                    setEvent(navigationButton, 'click', () => {
                        const groupID = getAttr(navigationButton, 'data-groupID')
                        opt.currentState.activeGroup = groupID
                        opt.updateDOM('changeActiveGroup')

                        playSoundEffect('select', .5)
                    })
                })
                opt.currentState.activeGroup = 'g1'
                opt.updateDOM('changeActiveGroup')

                // Making all elements with tabindex="0" clickable using enter button
                document.querySelectorAll('[tabindex="0"]').forEach(accessibleElement => {

                    accessibleElement.addEventListener('keydown', function (event) {
                        // Check if the Enter key was pressed (key code 13) or the Space key (key code 32)
                        if (event.keyCode === 13 || event.keyCode === 32) {
                            if (accessibleElement.classList.contains('toggleSwitchInput')) {
                                // console.log("hi");
                                accessibleElement.checked = !accessibleElement.checked
                            }
                            this.click();
                            event.preventDefault();
                        }
                    });
                })


                // Lights Functionality

                function overlayOpacityUpdater() {
                    // qS('.overlay').style.opacity = opt.currentState.lights.overlayOpacity

                    let opacity;
                    let leftLightEnabled = opt.globalSettings.optionsPageSettings.optionsPageLights.left
                    let rightLightEnabled = opt.globalSettings.optionsPageSettings.optionsPageLights.right
                    if (leftLightEnabled && rightLightEnabled) {
                        opacity = 0
                    }
                    else if (leftLightEnabled || rightLightEnabled) {
                        opacity = 0.45
                    }
                    else {

                        opacity = 9
                    }

                    qS('.overlay').style.opacity = opacity
                }

                overlayOpacityUpdater()

                async function switchLightState(ceilingLightWrapper) {
                    const affectAmount = 0.45

                    if (ceilingLightWrapper.classList.contains('rightLight-wrapper')) {
                        opt.completeData.globalSettings.optionsPageSettings.optionsPageLights.right = !opt.completeData.globalSettings.optionsPageSettings.optionsPageLights.right

                        opt.completeData.globalSettings.optionsPageSettings.optionsPageLights.right ? playSoundEffect('lightsOn') : playSoundEffect('lightsOff')
                        opt.completeData.globalSettings.optionsPageSettings.optionsPageLights.right ? switchClass(ceilingLightWrapper, 'inactive', 'active') : switchClass(ceilingLightWrapper, 'active', 'inactive')

                    }
                    else {

                        opt.completeData.globalSettings.optionsPageSettings.optionsPageLights.left = !opt.completeData.globalSettings.optionsPageSettings.optionsPageLights.left
                        opt.completeData.globalSettings.optionsPageSettings.optionsPageLights.left ? playSoundEffect('lightsOn') : playSoundEffect('lightsOff')
                        opt.completeData.globalSettings.optionsPageSettings.optionsPageLights.left ? switchClass(ceilingLightWrapper, 'inactive', 'active') : switchClass(ceilingLightWrapper, 'active', 'inactive')
                    }
                    await setStorage({ ...opt.completeData })

                }
                qSA('.ceilingLight-wrapper').forEach(ceilingLightWrapper => {

                    if (ceilingLightWrapper.classList.contains('rightLight-wrapper')) {
                        // opt.completeData.globalSettings.optionsPageSettings.optionsPageLights.right
                        opt.completeData.globalSettings.optionsPageSettings.optionsPageLights.right ? switchClass(ceilingLightWrapper, 'inactive', 'active') : switchClass(ceilingLightWrapper, 'active', 'inactive')
                    }
                    else {
                        opt.completeData.globalSettings.optionsPageSettings.optionsPageLights.left ? switchClass(ceilingLightWrapper, 'inactive', 'active') : switchClass(ceilingLightWrapper, 'active', 'inactive')

                    }
                    setEvent(ceilingLightWrapper, 'click', () => {
                        switchLightState(ceilingLightWrapper)
                        overlayOpacityUpdater()
                    })
                })




                // Search Websites Functionality (Doesn't support Sub URLs search right now)
                setEvent(qS('.settingsGroup > .searchBar-wrapper .searchURLInput'), 'input', (e) => {
                    const searchedText = e.srcElement.value
                    let searchedText2 = searchedText.replace(/\s/g, "")
                    let searchedText2Array = searchedText2.split('')


                    let termMatchedElementsArray = []
                    let charsMatchedElementsArray = []
                    qSA(`.url-wrapper`).forEach(urlElement => {
                        if (!(searchedText2.length > 0)) {
                            urlElement.style.display = 'flex'
                            return
                        }

                        let spanText = getAttr(urlElement, 'data-url')
                        let spanTextArray = spanText.split('')

                        urlElement.style.display = 'none'


                        if (spanText.includes(searchedText2)) {
                            termMatchedElementsArray.push(urlElement)
                        }
                        else if (!(termMatchedElementsArray.length > 0)) {


                            searchedText2Array.forEach(char => {
                                if (spanTextArray.includes(char)) {
                                    charsMatchedElementsArray.push(urlElement)
                                }
                            })

                        }
                    })


                    if (termMatchedElementsArray.length > 0) {
                        termMatchedElementsArray.forEach(termMatchedElement => {
                            termMatchedElement.style.display = 'flex'
                        })
                        // console.log("Showing Terms Matched Elements");

                    }
                    else if (charsMatchedElementsArray.length > 0) {
                        charsMatchedElementsArray.forEach(charsMatchedElement => {
                            charsMatchedElement.style.display = 'flex'
                        })
                        // console.log("Showing Characters Matched Elements");
                    }
                    else {
                        // console.log("Nothing like that");
                    }


                    // console.log("-------------");
                    // // console.log(results);

                })


                // Help Button
                const helpButton = qS('.helpButton')
                const helpDialog = qS('.helpDialog')
                const closeHelpDialogButton = qS('.closeHelpDialogButton')


                function closeHelpDialog() {
                    playSoundEffect('click')
                    helpDialog.close()
                    updateCSS(helpDialog, { 'display': 'none' })
                }
                setEvent(closeHelpDialogButton, 'click', closeHelpDialog)
                helpButton.addEventListener('click', (e) => {
                    playSoundEffect('click')
                    helpDialog.showModal()
                    updateCSS(helpDialog, { 'display': 'flex' })
                    // console.log(helpDialog);
                })
                window.addEventListener('keydown', (e) => {
                    if (e.key == 'Escape') {
                        closeHelpDialog()
                    }
                })



            },


        }

        if (changeSpecified == "initialize") {

            // Check For States, and if none found, run the initial functions

            // GROUP 1 
            if (opt.currentState.activeGroup == 'g1') {
                if (opt.currentState.websiteSelected) {
                    domUpdaterFunctions.actionFuncs.loadShortcuts(opt.websitesData[opt.currentState.websiteSelected].shortcuts)
                }
                else {
                    domUpdaterFunctions.actionFuncs.updateWebsitesList()
                }
            }
            // GROUP 2
            else if (opt.currentState.activeGroup == 'g2') {
                // console.log("This is group2 right?");
                domUpdaterFunctions.actionFuncs.group2Activated()


            }
            // GROUP 3
            else if (opt.currentState.activeGroup == 'g3') {
                // console.log("This is group3 right?");
                domUpdaterFunctions.actionFuncs.group3Activated()


            }
            else {
                domUpdaterFunctions.init()
            }

        }
        else {
            domUpdaterFunctions.actionFuncs[changeSpecified](...args)

            // const functionsListOfInit = Object.keys(domUpdaterFunctions.initFunctions)
            // const functionsListOfActionFuncs = Object.keys(domUpdaterFunctions.actionFuncs)
            // if (functionsListOfInit.includes(changeSpecified)) {
            //     domUpdaterFunctions.initFunctions[changeSpecified]()
            // }
            // else if (functionsListOfActionFuncs.includes(changeSpecified)){
            //     domUpdaterFunctions.actionFuncs[changeSpecified]()
            // }
            // else{
            //     // console.log("No Function like that Exists");
            // }
        }

    },

    updateDataVariables: () => {
        opt.websitesData = opt.completeData.websitesData
        opt.globalSettings = opt.completeData.globalSettings

        opt.websitesList = []
        opt.domainsAndTheirPages = {}
        for (let website in opt.websitesData) {
            if (Object.hasOwnProperty.call(opt.websitesData, website)) {

                // Only remove the ending slash if the website is not a custom URL as it creates problems if the user has deliberately put a slash
                if (!(/~mws-[^~]+~/.test(website))) {
                    website = website.replace(/\/$/, ''); // Replace a trailing '/' with an empty string
                }

                // let urlWithoutProtocol = website.replace(/^(https:\/\/|http:\/\/)/, ""); // Use a regular expression to remove "https://" or "http://"


                const url = new URL(website)
                const origin = url.origin
                const path = url.pathname
                const domain = url.hostname
                const hash = url.hash
                const search = url.search

                if (!opt.domainsAndTheirPages[origin]) {
                    opt.domainsAndTheirPages[origin] = []
                }
                if (!opt.domainsAndTheirPages[origin][website]) {
                    if (path != '/' || (hash || search)) {
                        // console.log("pushing", website);
                        opt.domainsAndTheirPages[origin].push(website)
                    }
                }

                // const element = opt.websitesData[website];
                opt.websitesList.push(website)
                // // console.log(opt.websitesList);

            }
        }
        opt.updateDOM()
    },

    getCompleteData: async () => {
        opt.completeData = await getCompleteData()

        opt.updateDataVariables()
    },


    init: async function () {
        await opt.getCompleteData()

        let currentURL = window.location.href
        let hash = window.location.hash
        let hashSplitArray = hash.split('#')
        let lastHashValue = hashSplitArray[hashSplitArray.length - 1]


        // Use the URL constructor to parse the URL
        let url = new URL(currentURL);

        // Access the value of the 'url' query parameter
        let urlParameter = url.searchParams.get('url');
        // console.log(urlParameter);

        hashSplitArray.forEach(hashValue => {
            if (hashValue && hashValue != lastHashValue) {
                urlParameter += "#" + hashValue
            }
        })

        if (urlParameter && opt.websitesList.includes(urlParameter)) {
            opt.currentState.websiteSelected = urlParameter
            opt.updateDOM('openWebsiteSettings', urlParameter)

            // Check if there is a hash in the URL
            if (hash) {
                // console.log("Hash present");
                // console.log(lastHashValue);
                const targetElement = document.getElementById(lastHashValue);

                // Add a class to the target element to trigger the hover effect
                targetElement.classList.add('hovered'); // Replace 'hover-effect' with your desired class

                if (targetElement) {
                    // Get the parent div with the scrollbar
                    const parentDiv = targetElement.closest('.websiteSettingsDiv'); // Replace '.scrollable-div' with your actual class or selector

                    if (parentDiv) {
                        // Calculate the offset relative to the parent div
                        const offset = targetElement.offsetTop - parentDiv.offsetTop;

                        // Scroll the parent div to the target element
                        parentDiv.scrollTo({
                            top: offset,
                            behavior: 'smooth'
                        });
                    }
                }
            }

        }

        // console.log(hash);



        chrome.storage.onChanged.addListener(async (changes) => {
            // console.log("Options Page, Data updating");
            // console.log(changes);

            await opt.getCompleteData()
        })

    }
}

opt.init()