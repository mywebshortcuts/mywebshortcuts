






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