// These functions are taken from https://gist.github.com/sstur/7379870

import { finder } from "@medv/finder";

/*
export function toJSON(node) {
  let propFix = { for: 'htmlFor', class: 'className' };
  let specialGetters = {
    style: (node) => node.style.cssText,
  };
  let attrDefaultValues = { style: '' };
  let obj = {
    nodeType: node.nodeType,
  };
  if (node.tagName) {
    obj.tagName = node.tagName.toLowerCase();
  } else if (node.nodeName) {
    obj.nodeName = node.nodeName;
  }
  if (node.nodeValue) {
    obj.nodeValue = node.nodeValue;
  }
  let attrs = node.attributes;
  if (attrs) {
    let defaultValues = new Map();
    for (let i = 0; i < attrs.length; i++) {
      let name = attrs[i].nodeName;
      defaultValues.set(name, attrDefaultValues[name]);
    }
    // Add some special cases that might not be included by enumerating
    // attributes above. Note: this list is probably not exhaustive.
    switch (obj.tagName) {
      case 'input': {
        if (node.type === 'checkbox' || node.type === 'radio') {
          defaultValues.set('checked', false);
        } else if (node.type !== 'file') {
          // Don't store the value for a file input.
          defaultValues.set('value', '');
        }
        break;
      }
      case 'option': {
        defaultValues.set('selected', false);
        break;
      }
      case 'textarea': {
        defaultValues.set('value', '');
        break;
      }
    }
    let arr = [];
    for (let [name, defaultValue] of defaultValues) {
      let propName = propFix[name] || name;
      let specialGetter = specialGetters[propName];
      let value = specialGetter ? specialGetter(node) : node[propName];
      if (value !== defaultValue) {
        arr.push([name, value]);
      }
    }
    if (arr.length) {
      obj.attributes = arr;
    }
  }
  let childNodes = node.childNodes;
  // Don't process children for a textarea since we used `value` above.
  if (obj.tagName !== 'textarea' && childNodes && childNodes.length) {
    let arr = (obj.childNodes = []);
    for (let i = 0; i < childNodes.length; i++) {
      arr[i] = toJSON(childNodes[i]);
    }
  }
  return obj;
}

export function toDOM(input) {
  let obj = typeof input === 'string' ? JSON.parse(input) : input;
  let propFix = { for: 'htmlFor', class: 'className' };
  let node;
  let nodeType = obj.nodeType;
  switch (nodeType) {
    // ELEMENT_NODE

    // OLD CODE, GIVING ERROR ON TEXTAREA
   // case 1: {
   // node = document.createElement(obj.tagName);
   //   if (obj.attributes) {
   //     for (let [attrName, value] of obj.attributes) {
   //       let propName = propFix[attrName] || attrName;
   //       // Note: this will throw if setting the value of an input[type=file]
   //       node[propName] = value;
   //     }
   //   }
   //   break;
   // } 

    case 1: {
      node = document.createElement(obj.tagName);
      if (obj.attributes) {
        for (let [attrName, value] of obj.attributes) {
          let propName = propFix[attrName] || attrName;
          // Skip setting 'type' for a 'textarea' element
          if (obj.tagName.toLowerCase() === 'textarea' && propName === 'type') {
            continue;
          }
          node[propName] = value;
        }
      }
      break;
    }



    // TEXT_NODE
    case 3: {
      return document.createTextNode(obj.nodeValue);
    }
    // COMMENT_NODE
    case 8: {
      return document.createComment(obj.nodeValue);
    }
    // DOCUMENT_FRAGMENT_NODE
    case 11: {
      node = document.createDocumentFragment();
      break;
    }
    default: {
      // Default to an empty fragment node.
      return document.createDocumentFragment();
    }
  }
  if (obj.childNodes && obj.childNodes.length) {
    for (let childNode of obj.childNodes) {
      node.appendChild(toDOM(childNode));
    }
  }
  return node;
}
*/


// ____MODIFIED CODE TO INCLUDE ALL THE ATTRIBUTES____

// Modify the toJSON function
export function toJSON(node) {
  return { cssSelector: finder(node) }
//   let propFix = { for: 'htmlFor', class: 'className' };
//   let specialGetters = {
//     style: (node) => node.style.cssText,
//   };
//   let obj = {
//     nodeType: node.nodeType,
//   };
//   if (node.tagName) {
//     obj.tagName = node.tagName.toLowerCase();
//   } else if (node.nodeName) {
//     obj.nodeName = node.nodeName;
//   }
//   if (node.nodeValue) {
//     obj.nodeValue = node.nodeValue;
//   }
//   let attrs = node.attributes;
//   if (attrs) {
//     let attrList = Array.from(attrs);
//     if (attrList.length > 0) {
//       // Use "class" to represent the class attribute
//       obj.attributes = attrList
//         .filter((attr) => {
//           // Filter out attributes with values of "empty strings
//           return attr.value !== "";
//         })
//         .map((attr) => (attr.name === "class" ? ["class", attr.value] : [attr.name, attr.value]));
//     }
//   }


//   let childNodes = node.childNodes;
//   if (obj.tagName !== 'textarea' && childNodes && childNodes.length) {
//     let arr = (obj.childNodes = []);
//     for (let i = 0; i < childNodes.length; i++) {
//       arr[i] = toJSON(childNodes[i]);
//     }
//   }
//   return obj;
}

// Modify the toDOM function
export function toDOM(input) {
  let obj = typeof input === 'string' ? JSON.parse(input) : input;
  let propFix = { for: 'htmlFor', class: 'className' };
  let node;
  let nodeType = obj.nodeType;
  switch (nodeType) {
    case 1: {
      node = document.createElement(obj.tagName);

      // if (obj.attributes) {
      //   obj.attributes.forEach(([attrName, value]) => {
      //     let propName = propFix[attrName] || attrName;
      //     node.setAttribute(propName, value);
      //   });
      // }
      if (obj.attributes) {
        obj.attributes.forEach(([attrName, value]) => {
          let propName = propFix[attrName] || attrName;
          // Use "class" to set the class attribute
          if (propName === "classname") {
            propName = "class";
          }
          node.setAttribute(propName, value);
        });
      }

      break;
    }
    case 3: {
      return document.createTextNode(obj.nodeValue);
    }
    case 8: {
      return document.createComment(obj.nodeValue);
    }
    case 11: {
      node = document.createDocumentFragment();
      break;
    }
    default: {
      return document.createDocumentFragment();
    }
  }
  if (obj.childNodes && obj.childNodes.length) {
    for (let childNode of obj.childNodes) {
      node.appendChild(toDOM(childNode));
    }
  }
  return node;
}
