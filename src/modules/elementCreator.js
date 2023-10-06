export default function createElement(elementData =
    {
        tagName: "div",
        attributes: {
            classes: ['MWS-element'],
            id: undefined,
            otherAttributes: []
        },
        textContent: undefined,
        innerHTML: undefined,
        childElements: []
    }
) {

    // Element Creation
    let element = document.createElement(elementData.tagName)

    // Setting Attributes 
    const attributes = elementData.attributes
    for (const key in attributes) {
        if (Object.hasOwnProperty.call(attributes, key)) {
            const value = attributes[key];

            if (key == 'classes') {
                if (value) {
                    value.forEach(className => {
                        if (className) {
                            element.classList.add(className)
                        }
                    });
                }
            }
            if (key == 'id') {
                if (value) {
                    element.id = value
                }
            }

            if (key == 'otherAttributes') {
                if (value.length > 0) {
                    value.forEach((attributeValueGroup) => {
                        element.setAttribute(attributeValueGroup[0], attributeValueGroup[1])
                    })

                }

            }

        }
    }

    // Setting Text Content
    if (elementData.textContent) {
        element.textContent = elementData.textContent
    }

    // Setting innerHTML
    if (elementData.innerHTML) {
        element.innerHTML = elementData.innerHTML
    }

    // Appending Child Elements
    if (elementData.childElements) {
        elementData.childElements.forEach((childElement) => {
            element.appendChild(childElement)
        })
    }

    return element
}