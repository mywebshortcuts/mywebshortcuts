import createElement from "../modules/elementCreator"




export function confirmationDialogOpener(confirmationText) {

    return new Promise((resolve, reject) => {
        const dialogElementData = {
            tagName: "dialog",
            attributes: {
                classes: ['confirmationDialog', 'mws-element', 'mws-confirmationDialog'],
                // id: undefined,
                // otherAttributes: []
            },
            // textContent: "No",
            innerHTML: `
            <div class="mws-element closeConfirmationDialogButton-wrapper mws-closeConfirmationDialogButton-wrapper">
                <button class="closeConfirmationDialogButton actionButton mws-element mws-closeConfirmationDialogButton mws-actionButton" title="Close Confirmation Dialog (Esc)">
                    <i class="fa-close fa-solid"></i>
                </button>
            </div>

            <div class="mws-element confirmationTextSpan-wrapper mws-confirmationTextSpan-wrapper">
                <span class="mws-element confirmationTextSpan mws-confirmationTextSpan">${confirmationText}</span>
            </div>
            <div class="mws-element buttons-wrapper mws-buttons-wrapper">
                <button class="mws-element confirmationButton greenButtonFilled mws-confirmationButton mws-greenButtonFilled">Yes</button>
                <button class="mws-element notConfirmButton redButtonFilled mws-notConfirmButton mws-redButtonFilled">No</button>
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

        document.addEventListener('keydown', (e)=>{
            if (e.key=="Escape") {
                closeDialog(false)
            }
        })
        document.body.appendChild(dialogElement)
        dialogElement.showModal()

    })
}