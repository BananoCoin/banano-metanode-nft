const addAttributes = (child, attributes) => {
  if (attributes) {
    Object.keys(attributes).forEach((attibute) => {
      const value = attributes[attibute];
      child.setAttribute(attibute, value);
    });
  }
};

const addText = (parent, childText) => {
  parent.appendChild(document.createTextNode(childText));
};

const addChildElement = (parent, childType, attributes) => {
  // console.log('addChildElement', parent, childType, attributes);
  const child = document.createElement(childType);
  parent.appendChild(child);
  addAttributes(child, attributes);
  return child;
};

const hide = (id) => {
  const elt = document.getElementById(id);
  if (elt) {
    elt.style = 'display:none';
  }
};

const show = (id) => {
  const elt = document.getElementById(id);
  if (elt) {
    elt.style = '';
  }
};

const clear = (parent) => {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
};

export {addAttributes, addText, addChildElement, hide, show, clear};
