




function keyboarder() {

    window.addEventListener('keydown', (e) => {
        let k1 = e.key;
        console.log(k1);


    })

    window.addEventListener('keyup', (e) => {
        let k1 = e.key;

        if (k1 == "q") {
            clickedElementsArray.forEach((element)=>{
                element.click()
                console.log(element.tagName, "clicked");
            })
            
        }
    })

}


let clickedElementsArray = [];

function highlighter() {


    function getElementOnCoordinates(x, y) {
        return document.elementFromPoint(x, y)
    }

    let currentElement;

    function addRemoveborder(event){

        if (currentElement) {
            currentElement.classList.remove('MWSbordered')
        }

        let [x, y] = [event.clientX, event.clientY]
        currentElement = getElementOnCoordinates(x, y);

        currentElement.classList.add('MWSbordered')


    }



    function whenClicked(event){
        const clickedElement = currentElement;
        clickedElement.classList.add("clicked")
        if (!clickedElementsArray.includes(currentElement)) {
            clickedElementsArray.push(currentElement)
            currentElement.setAttribute('data-index', `${clickedElementsArray.length}`)

        }
        console.log(currentElement);

    }


    window.addEventListener('mouseover', addRemoveborder);

    window.addEventListener('click', whenClicked)

}

highlighter()
keyboarder()



// let toBeOrNotToBe = false;

// if (toBeOrNotToBe) {
// }


// Listen for messages sent from the background script.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.message === "start") {
        // toBeOrNotToBe = true
    }
    else{
        // toBeOrNotToBe = false
        window.removeEventListener('mouseover', addRemoveborder);
        window.removeEventListener('click', whenClicked);
    }
});
