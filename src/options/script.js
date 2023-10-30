
import "../forExtensionPages.css"
import { addClass, getAttr, qS, qSA, rmClass, setEvent, getCompleteData } from "../modules/quickMethods";
import "./style.css"

// Import Font Awesome
import "../assets/font-awesome/css/fontawesome.css"
import "../assets/font-awesome/css/solid.css"

const opt = {
    currentState:{

        activeGroup:1
    },

    completeData: {},
    websitesData: {},
    globalSettings: {},

    websitesList:[],

    clearAllData: ()=>{
        chrome.storage.local.clear(() => {
            console.log('All data in local storage has been cleared.');
            chrome.runtime.reload();
        });
    },
    updateDOM:(changeSpecified="everything")=>{

        const domUpdaterFunctions = {

            changeActiveGroup: () => {

                qSA('.settingsGroup').forEach((settingsGroup) => {
                    if (settingsGroup.id == opt.currentState.activeGroup) {
                        // Remove old styles
                        const previousGroup = qS('.settingsGroup.active')
                        rmClass(previousGroup, ['active'])

                        const previousActiveGroupButton = qS(`.navigationButton.active`)
                        rmClass(previousActiveGroupButton, ['active'])


                        const activeGroupButton = qS(`.navigationButton[data-groupID="${settingsGroup.id}"]`)

                        addClass(settingsGroup, ['active'])
                        addClass(activeGroupButton, ['active'])
                    }
                })
            },

            updateWebsitesList:()=>{
                // console.log(opt.websitesList);

                const templateElement = document.querySelector('.urlWrapperTemplate')
                // console.log(templateElement);
                
                const urlsListWrapper = qS('.urlsList-wrapper')
                
                opt.websitesList.forEach((websiteURL)=>{
                    // console.log(websiteURL);
                    let urlWrapperNode = templateElement.content.cloneNode(true)
                    console.log(urlWrapperNode);
                    
                    qS('span', urlWrapperNode).textContent = websiteURL


                    console.log(qS('.url-wrapper', urlWrapperNode));
                    qS('.url-wrapper', urlWrapperNode).setAttribute('data-url', websiteURL)

                    urlsListWrapper.appendChild(urlWrapperNode)

                })

            }
        } 

        if (changeSpecified == "everything") {
            // changeActiveGroup()
            console.log("Update Everything");
            for (const eachFunc in domUpdaterFunctions) {
                if (Object.hasOwnProperty.call(domUpdaterFunctions, eachFunc)) {
                    domUpdaterFunctions[eachFunc]();
                    
                }
            }
        }
        else{
            domUpdaterFunctions[changeSpecified]()

        }

    },

    updateDataVariables:()=>{
        opt.websitesData = opt.completeData.websitesData 
        opt.globalSettings = opt.completeData.globalSettings 

        for (const website in opt.websitesData) {
            if (Object.hasOwnProperty.call(opt.websitesData, website)) {
                // const element = opt.websitesData[website];
                opt.websitesList.push(website)
                
            }
        }
    },

    getCompleteData: async () => {
        opt.completeData = await getCompleteData()

        opt.updateDataVariables()
    },


    init: async function(){
        qS('.clearAllDataButton').addEventListener('click', opt.clearAllData)

        await opt.getCompleteData()
        opt.updateDOM()
        console.log(opt.completeData);

        qSA('.navigationButton').forEach((navigationButton)=>{
            setEvent(navigationButton, 'click', ()=>{
                const groupID = getAttr(navigationButton, 'data-groupID')
                opt.currentState.activeGroup = groupID
                opt.updateDOM('changeActiveGroup')
            })
        })
        // setEvent('click', qS('.clearAllDataButton'), opt.clearAllData)



    }
}

opt.init()