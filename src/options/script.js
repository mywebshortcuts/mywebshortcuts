
import "../forExtensionPages.css"
import { addClass, getAttr, qS, qSA, rmClass, setEvent, getCompleteData, switchClass, setAttr, setStorage } from "../modules/quickMethods";
import "./style.css"

// Import Font Awesome
import "../assets/font-awesome/css/fontawesome.css"
import "../assets/font-awesome/css/solid.css"
import elementCreator from '../modules/elementCreator'
import createElement from "../modules/elementCreator"

import {confirmationDialogOpener} from '../modules/domElements'



const opt = {
    currentState: {

        activeGroup: '',
        websiteSelected: null,

        openMoreOptions: [],
    },

    completeData: {},
    websitesData: {},
    globalSettings: {},

    websitesList: [],

    clearAllData: () => {
        chrome.storage.local.clear(() => {
            console.log('All data in local storage has been cleared.');
            chrome.runtime.reload();
        });
    },
    deleteWebsite:async (url)=>{
        delete opt.completeData.websitesData[url]
        await setStorage({ ...opt.completeData })

    },
    updateDOM: (changeSpecified = "initialize") => {



        const domUpdaterFunctions = {

            actionFuncs: {

                closeWebsiteSettingsAndBackToWebsitesList: () => {
                    opt.currentState.websiteSelected = null
                    opt.currentState.openMoreOptions = []

                    const websiteSettingsDiv = qS('.websiteSettingsDiv')
                    websiteSettingsDiv.style.display = 'none'

                    const urlsListWrapper = qS('.urlsList-wrapper')
                    urlsListWrapper.style.display = 'flex'


                    const searchBarWrapper = qS('.searchBar-wrapper')
                    searchBarWrapper.style.display = 'flex'

                },

                loadShortcuts: (websiteShortcuts) => {

                    opt.currentState.openMoreOptions = []


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

                    for (const shortcutKey in websiteShortcuts) {
                        if (Object.hasOwnProperty.call(websiteShortcuts, shortcutKey)) {
                            const shortcutKeyObject = websiteShortcuts[shortcutKey];

                            const repeatedHTML = shortcutSettingsWrapperTemplate.content.cloneNode(true)


                            const shortcutSettingsWrapper = qS('.shortcutSettings-wrapper', repeatedHTML)

                            setAttr(shortcutSettingsWrapper, 'data-shortcutName', shortcutKeyObject.name)
                            setAttr(shortcutSettingsWrapper, 'data-shortcutKey', shortcutKey)
                            setAttr(shortcutSettingsWrapper, 'data-shortcutAction', shortcutKeyObject.properties.action)
                            setAttr(shortcutSettingsWrapper, 'data-shortcutEnabled', shortcutKeyObject.enabled)

                            qS('.shortcutNameSpan', shortcutSettingsWrapper).innerText = shortcutKeyObject.name
                            qS('.shortcutKeyKbd', shortcutSettingsWrapper).innerText = shortcutKey

                            qS('.toggleSwitchInput', shortcutSettingsWrapper).checked = shortcutKeyObject.enabled
                            qS('.setActionSpan', shortcutSettingsWrapper).innerText = shortcutKeyObject.properties.action


                            // ------------------------- Enable/Disable Shortcut -------------------------
                            qS('.toggleSwitchInput', shortcutSettingsWrapper).addEventListener('change', async function (event) {
                                if (event.target.checked) {
                                    console.log('Extension Enabled');
                                    opt.completeData.websitesData[url].shortcuts[shortcutKey].enabled = true
                                } else {

                                    console.log('Extension Disabled');
                                    opt.completeData.websitesData[url].shortcuts[shortcutKey].enabled = false
                                }
                                await setStorage({ ...opt.completeData })

                            });



                            // ------------------------- Shortcut More Options Opener -------------------------
                            const moreOptionsButton = qS('.moreOptionsButton', shortcutSettingsWrapper)


                            const moreOptionsWrapper = qS('.moreOptions-wrapper', shortcutSettingsWrapper)
                            moreOptionsWrapper.style.display = 'none'


                            setEvent(moreOptionsButton, 'click', () => {

                                const moreOptionsButtonFA = qS('.moreOptionsButton  i', shortcutSettingsWrapper)


                                // More Options Hide/Unhide 
                                function moreOptionsHideUnhide(moreOptionsWrapper, moreOptionsButtonFA) {
                                    // If more options is not shown
                                    if (moreOptionsWrapper.style.display == 'none') {
                                        findAndCloseExistingOpenedMoreOptions()

                                        moreOptionsWrapper.style.display = 'flex'
                                        switchClass(moreOptionsButtonFA, 'fa-angle-down', 'fa-angle-up')
                                        shortcutSettingsWrapper.style.backgroundColor = '#3e3e3e'

                                        opt.currentState.openMoreOptions.push(shortcutKey)

                                    }
                                    else {
                                        moreOptionsWrapper.style.display = 'none'
                                        switchClass(moreOptionsButtonFA, 'fa-angle-up', 'fa-angle-down')
                                        shortcutSettingsWrapper.style.backgroundColor = '#4e4e4e'

                                        let shortcutIndex = opt.currentState.openMoreOptions.indexOf(shortcutKey);
                                        opt.currentState.openMoreOptions.splice(shortcutIndex, 1);

                                    }
                                }

                                function findAndCloseExistingOpenedMoreOptions() {

                                    if (opt.currentState.openMoreOptions.length == 0 || !shortcutsListWrapper.querySelector(".shortcutSettings-wrapper")) {
                                        return
                                    }
                                    opt.currentState.openMoreOptions.forEach(shortcutKey => {
                                        const otherShortcutSettingsWrapper = qS(`.shortcutSettings-wrapper[data-shortcutKey="${shortcutKey}"]`)

                                        const otherMoreOptionsButtonFA = qS('.moreOptionsButton  i', otherShortcutSettingsWrapper)
                                        const otherMoreOptionsWrapper = qS('.moreOptions-wrapper', otherShortcutSettingsWrapper)
                                        moreOptionsHideUnhide(otherMoreOptionsWrapper, otherMoreOptionsButtonFA)


                                    })
                                }
                                moreOptionsHideUnhide(moreOptionsWrapper, moreOptionsButtonFA)

                            })

                            // ------------------------- Edit Shortcut Settings Dialog Opener -------------------------


                            let editedProperties = {
                                key: null,
                                name: null,
                            }
                            const editShortcutButton = qS('.editShortcutButton', shortcutSettingsWrapper)
                            setEvent(editShortcutButton, 'click', () => {


                                const dialogElementData = {

                                    tagName: "dialog",
                                    attributes: {
                                        classes: ['editShortcutSettingsDialog'],
                                        // id: undefined,
                                        // otherAttributes: []
                                    },
                                    // textContent: "No",
                                    innerHTML: `

			<div class="closeEditShortcutSettingsButton-wrapper">
				<button class="closeEditShortcutSettingsButton actionButton">
					<i class="fa-close fa-solid"></i>
				</button>
			</div>

			<div class="shortnameEdit-wrapper">
				<label for="shortcutNameEditInput" class="shortcutNameEditLabel"
					>Shortcut Name</label
				>
				<input type="text" maxlength="20" class="shortcutNameInput" id="shortcutNameInput" />
			</div>

			<div class="shortcutKeyEdit-wrapper">
				<span class="shortcutKeyEditSpan">Edit Shortcut</span>
				<kbd tabindex="0" class="shortcutKeyEditKbd">K</kbd>
			</div>

			<div class="selectAction-wrapper">
				<label for="selectAction" class="selectActionLabel"
					>Select Action on Shortcut Press</label
				>
				<div class="select-wrapper">
					<select id="selectAction">
						<option value="click">Click</option>
						<option disabled value="focus">Focus</option>
						<option disabled value="highlight">Highlight</option>
						<option disabled value="scrollto">Scroll To</option>
					</select>
					<button class="selectArrowButton" tabindex="-1">
						<i class="fa-angle-down fa-solid"></i>
					</button>
				</div>
			</div>

			<div class="confirmEditedSettingsButton-wrapper">
				<button disabled class="confirmEditedSettingsButton greenButtonFilled">
					Confirm <i class="fa-check fa-solid"></i>
				</button>
			</div>
                                        `,
                                    // childElements: [confirmationTextSpan, greenButton, redButton]
                                }

                                let editShortcutSettingsDialog = createElement(dialogElementData)

                                const shortcutNameInput = qS('.shortcutNameInput', editShortcutSettingsDialog)
                                shortcutNameInput.value = shortcutKeyObject.name
                                const shortcutKeyEditKbd = qS('.shortcutKeyEditKbd', editShortcutSettingsDialog)
                                shortcutKeyEditKbd.innerText = shortcutKey


                                const shortcutKeyEditSpan = qS('.shortcutKeyEditSpan', editShortcutSettingsDialog)
                                shortcutKeyEditSpan.innerText = 'Edit Shortcut'


                                let propertiesEdited = false;
                                let confirmEditedSettingsButton = qS('.confirmEditedSettingsButton', editShortcutSettingsDialog)
                                confirmEditedSettingsButton.disabled = true

                                function changeEditedState() {
                                    // console.log(editedProperties);
                                    // console.log(!editedProperties.key || !editedProperties.name);
                                    if ((editedProperties.key || editedProperties.name) && !shortcutSelectionEnabled) {
                                        // console.log("Something changed");
                                        propertiesEdited = true;
                                        confirmEditedSettingsButton.disabled = false
                                    }
                                    else {
                                        console.log("Nothing changed");
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


                                function keyShortcutTracker(e) {
                                    console.log("Myself keyboard event vmro");
                                    if (!shortcutSelectionEnabled) {
                                        return
                                    }
                                    const activeElement = document.activeElement
                                    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                                        console.log("Input h bhai");
                                        return;
                                    }
                                    let existingShortcutKeys = Object.keys(opt.websitesData[url].shortcuts)


                                    let shortcutIndex = existingShortcutKeys.indexOf(shortcutKey);
                                    existingShortcutKeys.splice(shortcutIndex, 1);

                                    if (existingShortcutKeys.includes(e.key)) {
                                        console.log("Already exists");
                                        return;

                                    }
                                    shortcutKeyEditKbd.innerText = e.key

                                    if (e.key != shortcutKey) {
                                        editedProperties.key = e.key
                                    }
                                    else {
                                        editedProperties.key = null
                                    }
                                    changeEditedState()

                                }
                                let shortcutSelectionEnabled = false
                                setEvent(shortcutKeyEditKbd, 'click', (e) => {
                                    // console.log(e.key);
                                    if (!shortcutSelectionEnabled) {
                                        shortcutSelectionEnabled = true
                                        shortcutKeyEditSpan.innerText = 'Press Shortcut Key & Click below to Select it'

                                        document.addEventListener('keypress', keyShortcutTracker)
                                    }
                                    else {
                                        shortcutSelectionEnabled = false
                                        document.removeEventListener('keypress', keyShortcutTracker)
                                        shortcutKeyEditSpan.innerText = 'Edit Shortcut'
                                    }
                                    changeEditedState()


                                })

                                async function confirmEditedPropertiesAndSaveData() {
                                    console.log(editedProperties);
                                    console.log("Before Changes:");
                                    console.log(opt.completeData.websitesData[url].shortcuts);
                                    console.log(opt.completeData.websitesData[url].shortcuts[editedProperties.key]);
                                    if (editedProperties.key) {
                                        opt.completeData.websitesData[url].shortcuts[editedProperties.key] = opt.completeData.websitesData[url].shortcuts[shortcutKey]
                                        delete opt.completeData.websitesData[url].shortcuts[shortcutKey]
                                        console.log("Key Changed:");
                                        console.log(opt.completeData.websitesData[url].shortcuts);
                                    }
                                    if (editedProperties.name) {
                                        console.log("Name Changed:");
                                        if (!editedProperties.key) {
                                            console.log("Before Name Change:");
                                            console.log(opt.completeData.websitesData[url].shortcuts[shortcutKey].name);
                                            opt.completeData.websitesData[url].shortcuts[shortcutKey].name = editedProperties.name
                                            console.log("After Name Change:");
                                            console.log(opt.completeData.websitesData[url].shortcuts[shortcutKey].name);
                                        }
                                        else {
                                            console.log("Before Name Change:");
                                            console.log(opt.completeData.websitesData[url].shortcuts[editedProperties.key].name);
                                            opt.completeData.websitesData[url].shortcuts[editedProperties.key].name = editedProperties.name
                                            console.log("After Name Change:");
                                            console.log(opt.completeData.websitesData[url].shortcuts[editedProperties.key].name);
                                        }
                                    }

                                    console.log("After changes:");
                                    console.log(opt.completeData.websitesData[url].shortcuts);

                                    await setStorage({ ...opt.completeData })

                                    closeEditShortcutSettings()



                                    // if (propertiesEdited) {
                                    //     console.log(editedProperties);
                                    //     if (editedProperties.key) {
                                    //         opt.completeData.websitesData[url].shortcuts[editedProperties.key] = opt.completeData.websitesData[url].shortcuts[shortcutKey]
                                    //         delete opt.completeData.websitesData[url].shortcuts[shortcutKey]
                                    //     }
                                    //     if (editedProperties.name) {
                                    //         if (!editedProperties.key) {
                                    //             opt.completeData.websitesData[url].shortcuts[shortcutKey].name = editedProperties.name
                                    //         }
                                    //         else{
                                    //             opt.completeData.websitesData[url].shortcuts[editedProperties.key].name = editedProperties.name

                                    //         }
                                    //     }

                                    //     closeEditShortcutSettings()
                                    //     await setStorage({ ...opt.completeData })


                                    // }
                                }

                                // const confirmEditedSettingsButton = qS('.confirmEditedSettingsButton')
                                setEvent(confirmEditedSettingsButton, 'click', confirmEditedPropertiesAndSaveData)

                                function closeEditShortcutSettings() {
                                    shortcutSelectionEnabled = false
                                    document.removeEventListener('keypress', keyShortcutTracker)

                                    // editShortcutSettingsDialog.style.display = 'none'
                                    // editShortcutSettingsDialog.close()
                                    document.body.removeChild(editShortcutSettingsDialog)

                                    console.log("Close hogya bhaii!!!!!!!!!!!!!");
                                }

                                const closeEditShortcutSettingsButton = qS('.closeEditShortcutSettingsButton', editShortcutSettingsDialog)
                                setEvent(closeEditShortcutSettingsButton, 'click', closeEditShortcutSettings)


                                // editShortcutSettingsDialog.style.display = 'flex'
                                document.body.appendChild(editShortcutSettingsDialog)
                                editShortcutSettingsDialog.showModal()
                            })


                            function confirmationDialog(confirmationText) {

                                return new Promise((resolve, reject) => {
                                    const dialogElementData = {
                                        tagName: "dialog",
                                        attributes: {
                                            classes: ['confirmationDialog'],
                                            // id: undefined,
                                            // otherAttributes: []
                                        },
                                        // textContent: "No",
                                        innerHTML: `
                                        <div class="closeConfirmationDialogButton-wrapper">
                                            <button class="closeConfirmationDialogButton actionButton">
                                                <i class="fa-close fa-solid"></i>
                                            </button>
                                        </div>

                                        <div class="confirmationTextSpan-wrapper">
                                            <span class="confirmationTextSpan">${confirmationText}</span>
                                        </div>
                                        <div class="buttons-wrapper">
                                            <button class="confirmationButton greenButtonFilled">Yes</button>
                                            <button class="notConfirmButton redButtonFilled">No</button>
                                        </div>
                                        `,
                                        // childElements: [confirmationTextSpan, greenButton, redButton]

                                    }
                                    const dialogElement = elementCreator(dialogElementData)

                                    function closeDialog(resolverValue) {
                                        document.body.removeChild(dialogElement)
                                        resolve(resolverValue)
                                    }

                                    dialogElement.querySelector('.closeConfirmationDialogButton').addEventListener('click', () => {
                                        closeDialog(false)
                                    })
                                    dialogElement.querySelector('.confirmationButton').addEventListener('click', () => {
                                        closeDialog(true)
                                    })
                                    dialogElement.querySelector('.notConfirmButton').addEventListener('click', () => {
                                        closeDialog(false)
                                    })
                                    document.body.appendChild(dialogElement)
                                    dialogElement.showModal()

                                })
                            }

                            // ------------------------- Delete Shortcut Settings Dialog Opener -------------------------
                            const deleteShortcutButton = qS('.deleteShortcutButton', shortcutSettingsWrapper)
                            setEvent(deleteShortcutButton, 'click', async () => {
                                if (await confirmationDialog("Are you sure you want to delete the shortcut?")) {
                                    // console.log("Karoo vroo");

                                    delete opt.completeData.websitesData[url].shortcuts[shortcutKey]
                                    await setStorage({ ...opt.completeData })

                                    let shortcutIndex = opt.currentState.openMoreOptions.indexOf(shortcutKey);
                                    opt.currentState.openMoreOptions.splice(shortcutIndex, 1);


                                    domUpdaterFunctions.actionFuncs.loadShortcuts(websiteShortcuts)
                                    // location.reload()
                                }
                            })
                            shortcutsListWrapper.appendChild(shortcutSettingsWrapper)

                        }
                    }
                },

                openWebsiteSettings: (url) => {
                    const openedWebsiteSettings = opt.websitesData[url]
                    opt.currentState.websiteSelected = url

                    // Hide Websites List and Show Website Settings
                    const websiteSettingsDiv = qS('.websiteSettingsDiv')
                    websiteSettingsDiv.style.display = 'flex'
                    const urlsListWrapper = qS('.urlsList-wrapper')
                    urlsListWrapper.style.display = 'none'
                    const searchBarWrapper = qS('.searchBar-wrapper')
                    searchBarWrapper.style.display = 'none'

                    
                    // URL Heading
                    const urlHeading = qS('.urlHeading')
                    urlHeading.innerText = url

                    // Delete a website
                    const deleteWebsiteButton = qS('.deleteWebsiteButton')
                    setEvent(deleteWebsiteButton, 'click', async (e)=>{
                        console.log("Delete button clicked");
                        confirmationDialogOpener(`Warning: Deleting this website. Are you sure you want to proceed?`).then(response=>{
                            if (response) {
                                opt.deleteWebsite(url)
                                opt.currentState.websiteSelected = null
                                opt.updateDOM('closeWebsiteSettingsAndBackToWebsitesList')
                            }

                        })

                    })

                    // ------------------------- Enable/Disable Website -------------------------
                    const toggleSwitchInput = qS('.disableWebsiteToggle-wrapper .toggleSwitchInput')
                    toggleSwitchInput.checked = !openedWebsiteSettings.settings.enabled
                    toggleSwitchInput.addEventListener('change', async (e) => {
                        if (e.target.checked) {
                            console.log('Website Disabled');
                            opt.completeData.websitesData[url].settings.enabled = false
                        } else {
                            console.log('Website Enabled');
                            opt.completeData.websitesData[url].settings.enabled = true
                        }
                        await setStorage({ ...opt.completeData })

                    })


                    // Back Button
                    const backToWebsitesListButton = qS('.backToWebsitesListButton')
                    backToWebsitesListButton.addEventListener('click', (e) => {
                        domUpdaterFunctions.actionFuncs.closeWebsiteSettingsAndBackToWebsitesList()
                    })


                    const websiteShortcuts = openedWebsiteSettings.shortcuts

                    // Number of Shortcuts in heading
                    const numberOfShortcutsSpan = qS('.numberOfShortcutsSpan')
                    numberOfShortcutsSpan.textContent = Object.keys(websiteShortcuts).length

                    // Shortcuts Loader
                    domUpdaterFunctions.actionFuncs.loadShortcuts(websiteShortcuts)


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

                    const urlsListWrapper = document.body.querySelector('.urlsList-wrapper')
                    urlsListWrapper.innerHTML = '' // Why is this not working?

                    opt.websitesList.forEach((websiteURL) => {
                        let urlWrapperNode = templateElement.content.cloneNode(true)

                        qS('span', urlWrapperNode).textContent = websiteURL

                        const urlWrapperDiv = qS('.url-wrapper', urlWrapperNode)
                        urlWrapperDiv.setAttribute('data-url', websiteURL)

                        urlWrapperDiv.addEventListener('click', (e) => {
                            domUpdaterFunctions.actionFuncs.openWebsiteSettings(websiteURL)

                        })

                        urlsListWrapper.appendChild(urlWrapperNode)

                    })

                },

                group2Activated: ()=>{

                    // ------------------------- Enable/Disable Website -------------------------
                    const toggleSwitchInput = qS('.disableEverywhereToggle-wrapper .toggleSwitchInput')
                    toggleSwitchInput.checked = !opt.completeData.globalSettings.extensionEnabled
                    toggleSwitchInput.addEventListener('change', async (e) => {
                        if (e.target.checked) {
                            console.log('Extension Disabled');
                            opt.completeData.globalSettings.extensionEnabled = false
                        } else {
                            console.log('Extension Enabled');
                            opt.completeData.globalSettings.extensionEnabled = true
                        }
                        await setStorage({ ...opt.completeData })

                    })

                    // Clear All Data Button
                    setEvent(qS('.clearAllDataButton'), 'click', async (e)=>{
                        if (await confirmationDialogOpener('Warning: Deleting all data. Are you sure you want to proceed?')){
                            opt.clearAllData()
                        }

                    })


                },


                group3Activated: ()=>{

                }

            },

            init: function () {
                console.log("Initializing...");

                qSA('.navigationButton').forEach((navigationButton) => {
                    setEvent(navigationButton, 'click', () => {
                        const groupID = getAttr(navigationButton, 'data-groupID')
                        opt.currentState.activeGroup = groupID
                        opt.updateDOM('changeActiveGroup')
                    })
                })
                opt.currentState.activeGroup = 'g1'
                opt.updateDOM('changeActiveGroup')
            },


        }

        if (changeSpecified == "initialize") {

            // Check For States, and if none found, run the initial functions

            // GROUP 1 
            if (opt.currentState.activeGroup == 'g1') {
                if (opt.currentState.websiteSelected) {
                    domUpdaterFunctions.actionFuncs.loadShortcuts(opt.websitesData[opt.currentState.websiteSelected].shortcuts)
                }
                else{
                    domUpdaterFunctions.actionFuncs.updateWebsitesList()
                }
            }
            // GROUP 2
            else if (opt.currentState.activeGroup == 'g2') {
                console.log("This is group2 right?");
                domUpdaterFunctions.actionFuncs.group2Activated()

                
            }
            // GROUP 3
            else if (opt.currentState.activeGroup == 'g3') {
                console.log("This is group3 right?");
                domUpdaterFunctions.actionFuncs.group3Activated()

                
            }
            else {
                console.log("Hiiii");
                domUpdaterFunctions.init()
            }
        }
        else {
            domUpdaterFunctions.actionFuncs[changeSpecified]()

            // const functionsListOfInit = Object.keys(domUpdaterFunctions.initFunctions)
            // const functionsListOfActionFuncs = Object.keys(domUpdaterFunctions.actionFuncs)
            // if (functionsListOfInit.includes(changeSpecified)) {
            //     domUpdaterFunctions.initFunctions[changeSpecified]()
            // }
            // else if (functionsListOfActionFuncs.includes(changeSpecified)){
            //     domUpdaterFunctions.actionFuncs[changeSpecified]()
            // }
            // else{
            //     console.log("No Function like that Exists");
            // }
        }

    },

    updateDataVariables: () => {
        opt.websitesData = opt.completeData.websitesData
        opt.globalSettings = opt.completeData.globalSettings
        
        opt.websitesList = []
        for (const website in opt.websitesData) {
            if (Object.hasOwnProperty.call(opt.websitesData, website)) {
                // const element = opt.websitesData[website];
                opt.websitesList.push(website)

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


        chrome.storage.onChanged.addListener(async (changes) => {
            console.log("Options Page, Data updating");
            console.log(changes);
            
            await opt.getCompleteData()
        })

    }
}

opt.init()