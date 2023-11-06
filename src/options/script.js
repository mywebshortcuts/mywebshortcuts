
import "../forExtensionPages.css"
import { addClass, getAttr, qS, qSA, rmClass, setEvent, getCompleteData, switchClass, setAttr, setStorage, rmEvent, isObjEmpty, getElemAt } from "../modules/quickMethods";
import "./style.css"

// Import Font Awesome
import "../assets/font-awesome/css/fontawesome.css"
import "../assets/font-awesome/css/solid.css"
import "../assets/font-awesome/css/brands.css"
import "../assets/font-awesome/css/regular.css"


import elementCreator from '../modules/elementCreator'
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

    clearAllData: () => {
        chrome.storage.local.clear(() => {
            console.log('All data in local storage has been cleared.');
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
        function playSoundEffect(soundEffectName = 'click', volume = 1) {
            if (!opt.globalSettings.optionsPageSettings.optionsPageSoundsEnabled) {
                return
            }
            let audio;

            if (prevAudio && audio.src == prevAudio.src) {
                audio = prevAudio
            }
            else {
                audio = new Audio(`../assets/${soundEffectName}.mp3`)
            }

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

                            // ------------------------- Enable/Disable Shortcut -------------------------
                            qS('.toggleSwitchInput', shortcutSettingsWrapper).addEventListener('change', async function (event) {
                                if (event.target.checked) {
                                    console.log('Extension Enabled');
                                    playSoundEffect('switchOn')
                                    opt.completeData.websitesData[url].shortcuts[shortcutKey].enabled = true
                                } else {
                                    console.log('Extension Disabled');
                                    playSoundEffect('switchOff')
                                    opt.completeData.websitesData[url].shortcuts[shortcutKey].enabled = false
                                }
                                await setStorage({ ...opt.completeData })

                            });


                            // ------------------------- Edit Shortcut Settings Dialog Opener -------------------------


                            let editedProperties = {
                                key: null,
                                name: null,
                            }
                            const editShortcutButton = qS('.editShortcutButton', shortcutSettingsWrapper)
                            setEvent(editShortcutButton, 'click', async () => {

                                playSoundEffect('click', 1)

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


                                let propertiesEdited = false;
                                let confirmEditedSettingsButton = qS('.confirmEditedSettingsButton', editShortcutSettingsDialog)
                                confirmEditedSettingsButton.disabled = true

                                function changeEditedState() {
                                    if ((editedProperties.key || editedProperties.name) && !shortcutSelectionEnabled) {
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

                                let shortcutSelectionEnabled = false

                                function keyShortcutTracker(e) {
                                    if (!shortcutSelectionEnabled) {
                                        return
                                    }
                                    const activeElement = document.activeElement
                                    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                                        console.log("Input h bhai");
                                        return;
                                    }


                                    const keyCode = e.keyCode || e.which;
                                    const pressedKey = e.key
                                    if (keyCode == 13) {
                                        // If it's an Enter key
                                        // console.log(e);
                                        return

                                    }
                                    let existingShortcutKeys = Object.keys(opt.websitesData[url].shortcuts)
                                    let shortcutIndex = existingShortcutKeys.indexOf(shortcutKey);
                                    existingShortcutKeys.splice(shortcutIndex, 1);

                                    shortcutKeyEditKbd.innerText = pressedKey
                                    if (existingShortcutKeys.includes(pressedKey)) {
                                        console.log("Already exists");
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
                                    changeEditedState()

                                }
                                setEvent(shortcutKeyEditButton, 'click', (e) => {
                                    playSoundEffect('enterKey')
                                    if (!shortcutSelectionEnabled) {
                                        shortcutSelectionEnabled = true
                                        switchClass(shortcutKeyEditButton, 'editSelection', 'onSelection')
                                        addClass(shortcutKeyEditKbd, ['active'])

                                        document.addEventListener('keypress', keyShortcutTracker)
                                    }
                                    else {
                                        // document.removeEventListener('keypress', keyShortcutTracker)
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
                                    playSoundEffect('click')
                                    shortcutSelectionEnabled = false
                                    document.removeEventListener('keypress', keyShortcutTracker)
                                    document.body.removeChild(editShortcutSettingsDialog)
                                }

                                const closeEditShortcutSettingsButton = qS('.closeEditShortcutSettingsButton', editShortcutSettingsDialog)
                                setEvent(closeEditShortcutSettingsButton, 'click', closeEditShortcutSettings)


                                document.body.appendChild(editShortcutSettingsDialog)
                                editShortcutSettingsDialog.showModal()
                            })

                            // function confirmationDialog(confirmationText) {

                            //     return new Promise((resolve, reject) => {
                            //         const dialogElementData = {
                            //             tagName: "dialog",
                            //             attributes: {
                            //                 classes: ['confirmationDialog'],
                            //                 // id: undefined,
                            //                 // otherAttributes: []
                            //             },
                            //             // textContent: "No",
                            //             innerHTML: `
                            //             <div class="closeConfirmationDialogButton-wrapper">
                            //                 <button class="closeConfirmationDialogButton actionButton">
                            //                     <i class="fa-close fa-solid"></i>
                            //                 </button>
                            //             </div>

                            //             <div class="confirmationTextSpan-wrapper">
                            //                 <span class="confirmationTextSpan">${confirmationText}</span>
                            //             </div>
                            //             <div class="buttons-wrapper">
                            //                 <button class="confirmationButton greenButtonFilled">Yes</button>
                            //                 <button class="notConfirmButton redButtonFilled">No</button>
                            //             </div>
                            //             `,
                            //             // childElements: [confirmationTextSpan, greenButton, redButton]

                            //         }
                            //         const dialogElement = elementCreator(dialogElementData)

                            //         function closeDialog(resolverValue) {
                            //             document.body.removeChild(dialogElement)
                            //             resolve(resolverValue)
                            //         }

                            //         dialogElement.querySelector('.closeConfirmationDialogButton').addEventListener('click', () => {
                            //             closeDialog(false)
                            //         })
                            //         dialogElement.querySelector('.confirmationButton').addEventListener('click', () => {
                            //             closeDialog(true)
                            //         })
                            //         dialogElement.querySelector('.notConfirmButton').addEventListener('click', () => {
                            //             closeDialog(false)
                            //         })
                            //         document.body.appendChild(dialogElement)
                            //         dialogElement.showModal()

                            //     })
                            // }

                            // ------------------------- Delete Shortcut Settings Dialog Opener -------------------------
                            const deleteShortcutButton = qS('.deleteShortcutButton', shortcutSettingsWrapper)
                            setEvent(deleteShortcutButton, 'click', async () => {
                                playSoundEffect('click', 1)

                                if (await confirmationDialogOpener("Are you sure you want to delete the shortcut?")) {

                                    delete opt.completeData.websitesData[url].shortcuts[shortcutKey]
                                    await setStorage({ ...opt.completeData })

                                    if (isObjEmpty(opt.completeData.websitesData[url].shortcuts)) {
                                        console.log("Delete button clicked");
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

                            setEvent(shortcutSettingsWrapper, 'mouseenter', () => {

                                // console.log(shortcutSettingsWrapper.classList.contains('hovered'));
                                if (shortcutSettingsWrapper.classList.contains('hovered')) {
                                    shortcutSettingsWrapper.classList.remove('hovered')
                                }
                                playSoundEffect('hover')
                            })

                            shortcutSettingsWrapper.id = shortcutKey
                            qSA('button', shortcutSettingsWrapper).forEach((button) => {
                                setEvent(button, 'click', () => { playSoundEffect('click') })
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
                    setAttr(websiteSettingsDiv, 'data-url', url)
                    const websiteSettingsHeader = qS('.websiteSettingsHeader')
                    websiteSettingsHeader.style.display = 'flex'

                    const urlsListWrapper = qS('.urlsList-wrapper')
                    urlsListWrapper.style.display = 'none'
                    const searchBarWrapper = qS('.searchBar-wrapper')
                    searchBarWrapper.style.display = 'none'


                    // URL Heading
                    const urlHeading = qS('.urlHeading')
                    urlHeading.innerText = url




                    // Removing existing event listeners
                    let deleteWebsiteButton = qS(`.deleteWebsiteButton`, websiteSettingsDiv)
                    let toggleSwitchInput = qS('.disableWebsiteToggle-wrapper .toggleSwitchInput')
                    let backToWebsitesListButton = qS('.backToWebsitesListButton')

                    removeAllEventListenersOfElements([deleteWebsiteButton, toggleSwitchInput, backToWebsitesListButton])

                    // Delete a website
                    deleteWebsiteButton = qS(`.deleteWebsiteButton`, websiteSettingsDiv)
                    async function deleteWebsiteButtonFunction() {
                        playSoundEffect('click')
                        console.log("Delete button clicked");
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
                            console.log('Website Disabled');
                            playSoundEffect('switchOff')
                            opt.completeData.websitesData[url].settings.enabled = false
                        } else {
                            console.log('Website Enabled');
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


                    const websiteShortcuts = openedWebsiteSettings.shortcuts

                    // Number of Shortcuts in heading
                    const numberOfShortcutsSpan = qS('.numberOfShortcutsSpan')
                    numberOfShortcutsSpan.textContent = Object.keys(websiteShortcuts).length


                    // Shortcuts Loader
                    domUpdaterFunctions.actionFuncs.loadShortcuts(websiteShortcuts)


                    // Search Shortcut

                    console.log(qS('.shortcutsListHeader-wrapper .searchShortcutInput'));
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
                            console.log("Showing Terms Matched Elements");

                        }
                        else if (charsMatchedElementsArray.length > 0) {
                            charsMatchedElementsArray.forEach(charsMatchedElement => {
                                charsMatchedElement.style.display = 'flex'
                            })
                            console.log("Showing Characters Matched Elements");
                        }
                        else {
                            console.log("Nothing like that");
                        }

                        console.log("-------------");
                        // console.log(results);

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
                    urlsListWrapper.innerHTML = '' // Why is this not working?

                    opt.websitesList.forEach((websiteURL) => {
                        let urlWrapperNode = templateElement.content.cloneNode(true)

                        qS('span', urlWrapperNode).textContent = websiteURL

                        const urlWrapperDiv = qS('.url-wrapper', urlWrapperNode)
                        urlWrapperDiv.setAttribute('data-url', websiteURL)

                        urlWrapperDiv.addEventListener('click', (e) => {
                            playSoundEffect('click', 1)
                            domUpdaterFunctions.actionFuncs.openWebsiteSettings(websiteURL)

                        })
                        urlWrapperDiv.addEventListener('mouseenter', (e) => {
                            playSoundEffect('hover')
                        })
                        urlsListWrapper.id = websiteURL


                        urlsListWrapper.appendChild(urlWrapperNode)

                    })

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
                            console.log('Extension Disabled');
                            opt.completeData.globalSettings.extensionEnabled = false
                            playSoundEffect('switchOff')
                        } else {
                            console.log('Extension Enabled');
                            playSoundEffect('switchOn')
                            opt.completeData.globalSettings.extensionEnabled = true
                        }
                        await setStorage({ ...opt.completeData })

                    })

                    // ------------------------- Enable/Disable Sounds -------------------------
                    disableSoundToggle = qS('.disableSoundToggle-wrapper .toggleSwitchInput')
                    disableSoundToggle.checked = !opt.globalSettings.optionsPageSettings.optionsPageSoundsEnabled
                    // console.log(opt.globalSettings.optionsPageSettings);
                    console.log(opt.completeData.globalSettings.optionsPageSettings.optionsPageSoundsEnabled);

                    console.log(opt.globalSettings.optionsPageSettings.optionsPageSoundsEnabled);
                    disableSoundToggle.addEventListener('change', async (e) => {
                        if (e.target.checked) {
                            console.log('Sounds Disabled');
                            playSoundEffect('switchOff')
                            opt.completeData.globalSettings.optionsPageSettings.optionsPageSoundsEnabled = false
                        } else {
                            console.log('Sounds Enabled');
                            opt.completeData.globalSettings.optionsPageSettings.optionsPageSoundsEnabled = true
                        }
                        await setStorage({ ...opt.completeData })
                        if (opt.completeData.globalSettings.optionsPageSettings.optionsPageSoundsEnabled = true) {
                            playSoundEffect('switchOn')

                        }
                        console.log(opt.completeData.globalSettings.optionsPageSettings.optionsPageSoundsEnabled);

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

                }

            },

            init: function () {
                console.log("Initializing...");


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
                        console.log(accessibleElement);
                        // Check if the Enter key was pressed (key code 13) or the Space key (key code 32)
                        if (event.keyCode === 13 || event.keyCode === 32) {
                            if (accessibleElement.classList.contains('toggleSwitchInput')) {
                                console.log("hi");
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
                    else{

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




                // Search Websites Functionality
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
                        console.log("Showing Terms Matched Elements");

                    }
                    else if (charsMatchedElementsArray.length > 0) {
                        charsMatchedElementsArray.forEach(charsMatchedElement => {
                            charsMatchedElement.style.display = 'flex'
                        })
                        console.log("Showing Characters Matched Elements");
                    }
                    else {
                        console.log("Nothing like that");
                    }

                    console.log("-------------");
                    // console.log(results);

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
                console.log("This is group2 right?");
                domUpdaterFunctions.actionFuncs.group2Activated()


            }
            // GROUP 3
            else if (opt.currentState.activeGroup == 'g3') {
                console.log("This is group3 right?");
                domUpdaterFunctions.actionFuncs.group3Activated()


            }
            else {
                domUpdaterFunctions.init()
            }

        }
        else {
            domUpdaterFunctions.actionFuncs[changeSpecified](args)

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

        let currentURL = window.location.href
        let hash = window.location.hash

        // Use the URL constructor to parse the URL
        const url = new URL(currentURL);

        // Access the value of the 'url' query parameter
        const urlParameter = url.searchParams.get('url');
        if (urlParameter && opt.websitesList.includes(urlParameter)) {
            console.log(urlParameter);
            opt.currentState.websiteSelected = urlParameter
            opt.updateDOM('openWebsiteSettings', urlParameter)

            // Check if there is a hash in the URL
            if (window.location.hash) {
                const hash = window.location.hash;
                const targetElement = document.getElementById(hash.substring(1)); // Remove the leading '#'

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

        console.log(hash);




        chrome.storage.onChanged.addListener(async (changes) => {
            console.log("Options Page, Data updating");
            console.log(changes);

            await opt.getCompleteData()
        })

    }
}

opt.init()