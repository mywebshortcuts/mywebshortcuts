import createElement from "../modules/elementCreator"




export function confirmationDialogOpener(confirmationText) {

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
        const dialogElement = createElement(dialogElementData)

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