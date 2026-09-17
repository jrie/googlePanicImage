// ----------------------------------------------------------------------------------------
// Google panic image v5.0.0 @ 17.09.2026
// Author: Jan Riechers [ jan@dwrox.net ]
// Ressource: https://github.com/jrie/googlePanicImage
// ----------------------------------------------------------------------------------------
// Classname for panic button
// ----------------------------------------------------------------------------------------
const GOOGLE_PANIC_CLASS = 'gpi';
const GOOGLE_PANIC_CLASS_BTN = 'gpi-btn';
const overlayClassSelector = 'div.' + GOOGLE_PANIC_CLASS;

const gpiStyle = 'div.' + GOOGLE_PANIC_CLASS + ' { padding:0; margin:0; vertical-align: middle; line-height: 1em; position: absolute; top: 1rem; left: 0px; background: rgba(0,0,0,0.8); color: #fff; font-weight: normal; border-radius: 0px 1.6em 1.6em 0px; z-index: 5; font-size: 0.75rem; text-decoration: 0; border: 1px solid #777; border-left: 0; max-height: 2.2rem; display: block; } ' + 'a.' + GOOGLE_PANIC_CLASS_BTN + ' {color: #fff; line-height: 0.9rem; font-weight: bold; font-size: 0.75rem; text-decoration: 0; cursor:pointer; padding: 0; margin: 0; padding: 0.4rem 0.5rem 0.6em 0.5rem; display: block; }' + 'a.' + GOOGLE_PANIC_CLASS_BTN + ' > span { line-height: 0.9rem; padding: 0; margin: 0; margin-left: 0.5rem; font-weight: normal; }' + 'a.' + GOOGLE_PANIC_CLASS_BTN + ':hover { font-weight: bold; text-decoration:underline; } .gpi-dms { position: absolute; border-radius: 1.6em; right: 0.5rem; bottom: 3.3rem; color: #fff; line-height: 1.2rem; min-height: 1.2rem; font-size: 0.7rem !important; font-weight: normal; background-color: rgba(0,0,0,0.7); padding: 0.3rem 0.8em; }  div[data-gpi="l"] .gpi-dms { bottom: 0.7rem; } div:has(.notext) .gpi-dms { bottom: 1.1em; right: 0.7rem;} div:has(> div[data-gpi="sl"] .notext) .gpi-dms { bottom: 0.7em; right: 0.7em;} .notext { display: none; }';
// -------------------------------------------------------------------------
let operationMode = 1;
let operationModeTitle = 'Google regular image search';
const useChrome = typeof (browser) === 'undefined';

if (!document.body.querySelector('div#rcnt')) {
  operationMode = 2;
  operationModeTitle = 'Google highlight image search'
}

console.log('You are using GooglePanicImages v5.0.0');
console.log(useChrome ? 'Running in a Chrome available browser.' : 'Running in a non-Chrome browser.');
console.log('We are in "operation mode ' + operationMode + '" which means we operate on "' + operationModeTitle + '"');
console.log('If this mode differs from the current viewed page or you find a error, please open a bug ticket at: https://github.com/jrie/googlePanicImage');

// ----------------------------------------------------------------------------------------
function addCSSStyle() {
  const stylesheet = document.createElement('style');
  stylesheet.appendChild(document.createTextNode(gpiStyle));
  document.body.appendChild(stylesheet);
}

function getControllerData(caller, controllerValue, id) {
  const resultData = searchHayStack(controllerValue, id);
  if (!resultData) {
    return null;
  }

  const resultInfo = searchHayStack(resultData.keyData, '2000');
  if (!resultInfo) {
    return null;
  }

  return { data: resultData.keyData, info: resultInfo, key: resultData.parentKey };
}

// -----------------------------------------------------------------------

function findUpwards(targetAttribute, findValueIn, current) {
  if (!current) {
    return false;
  }

  if (findValueIn !== null) {
    if (current[findValueIn] && current[findValueIn][targetAttribute]) {
      return current[findValueIn][targetAttribute];
    }
  } else if (current[targetAttribute]) {
    return current[targetAttribute];
  }

  return findUpwards(targetAttribute, findValueIn, current.parentNode);
}

// -----------------------------------------------------------------------
const imageTypeOperationMode = {
  1: {
    id: {
      s: 'docid',
      sl: 'docid',
      l: 'id'
    }
  },
  2: {
    id: {
      sl: 'docid',
      l: 'id'
    }
  }
};

function parseImageByType(img, type) {
  const controllerSrc = findUpwards('__jscontroller', null, img);
  let controllerData = null;

  if (!controllerSrc.pending) {
    return null;
  }

  controllerData = controllerSrc.pending.value;

  let idData = null;
  let imageData = {};

  if (type === 'l') {
    idData = findUpwards(imageTypeOperationMode[operationMode].id[type], 'dataset', img);
  }

  if (!idData) {
    idData = findUpwards(imageTypeOperationMode[operationMode].id[type], 'dataset', img);
  }

  imageData = getControllerData(type, controllerData, idData);
  if (imageData && imageData.data !== undefined) {
    if (type === 'l') {
      imageData.data[3] = imageData.data[3][imageData.key];
    }
  }

  if (!imageData || !imageData.data) {
    return null;
  }

  return imageData;
}

function deactivateHover(evt) {
  const overlays = document.body.querySelectorAll(overlayClassSelector);
  if (overlays) {
    for (const overlay of overlays) {
      overlay.parentNode.removeChild(overlay);
    }
  }
}

function activateHover(evt) {
  const type = evt.target.dataset.gpi;
  const overlays = document.body.querySelectorAll(overlayClassSelector);
  if (overlays) {
    for (const overlay of overlays) {
      overlay.parentNode.removeChild(overlay);
    }
  }

  const imgData = parseImageByType(evt.target, type);
  if (!imgData) {
    return;
  }

  const subDiv = document.createElement('div');
  subDiv.className = GOOGLE_PANIC_CLASS;

  const domButton = document.createElement('a');
  domButton.target = '_blank';
  domButton.href = imgData.data[3][0];
  domButton.role = 'button';
  domButton.className = GOOGLE_PANIC_CLASS_BTN;

  const width = imgData.data[3][2];
  const height = imgData.data[3][1];
  const imgSize = imgData.info[2];

  const dimensionSpan = document.createElement('span');
  dimensionSpan.appendChild(document.createTextNode(width + 'x' + height + 'px'));

  const sizeSpan = document.createElement('span');
  sizeSpan.appendChild(document.createTextNode(imgSize));

  domButton.appendChild(document.createTextNode('VIEW'));
  domButton.appendChild(dimensionSpan);
  domButton.appendChild(sizeSpan);

  let operationTarget = evt.target;
  let operationAction = 'append';

  switch (type) {
    case 's':
      operationTarget = evt.target.children[1];
      break;
    case 'sl':
      operationTarget = evt.target.children[0];
      operationAction = 'prepend';
      break;
    case 'l':
      operationTarget = evt.target;
      break;
  }

  if (operationAction === 'append') {
    operationTarget.append(subDiv);
  } else {
    operationTarget.prepend(subDiv);
  }

  subDiv.appendChild(domButton);
  domButton.addEventListener('click', openImage);
}

function openImage(evt) {
  let target = evt.target;
  if (target.nodeName !== 'A') {
    target = target.parentNode;
  }

  evt.preventDefault();
  evt.stopPropagation();

  window.open(target, '_blank');
}

function addHandler(img, type) {
  switch (type) {
    case 's':
      img.addEventListener('mouseenter', activateHover);
      img.addEventListener('mouseleave', deactivateHover);
      break;
    case 'sl':
      img.addEventListener('mouseenter', activateHover);
      img.addEventListener('mouseleave', deactivateHover);
      break;
    case 'l':
      img.addEventListener('mouseenter', activateHover);
      img.addEventListener('mouseleave', deactivateHover);
      break;
    default:
      break;
  }
}

// ------------------------------------------------------------------------------------------------

const operationModes = {
  1: {
    l: 'div[data-gap] div[aria-hidden="false"] div[jsaction^="trigger."]',
    sl: 'div[data-gap] div[aria-hidden="false"] div[data-ref-docid]',
    s: 'div#rcnt div[data-lpage]'
  },
  2: {
    l: 'div[jsaction^="trigger."]',
    sl: 'div[data-ref-docid]'
  }
};

let inInterval = false
let count = 0;

function selectImages() {
  if (inInterval) {
    ++count;
    if (count < 3) {
      return;
    }

    count = 0;
  }

  inInterval = true;
  const parsingSelectors = operationModes[operationMode];

  for (const [type, cssSelector] of Object.entries(parsingSelectors)) {
    const images = document.body.querySelectorAll(cssSelector);
    for (const img of images) {
      if (img.dataset.gpi !== undefined || img.complete === false) {
        continue;
      }

      parseImage(img, type)
    }
  }
  inInterval = false;
}

function parseImage(img, type) {
  addHandler(img, type);
  if (hasOptions) {
    applyOptions(img, type)
  } else {
    img.dataset.gpi = type;
  }
}

// ------------------------------------------------------------------------------------------------

function applyOptions(img, type) {
  switch (operationMode) {
    case 1:
    default:
      switch (type) {
        case 's':
          imgContainer = img.parentNode
          imgContainer.style = 'position:relative;';
          imgContainer = img.parentNode.parentNode
          break;
        case 'sl':
          imgContainer = img.parentNode
          img.style = 'position:relative;';
          break;
        case 'l':
          imgContainer = img
          imgContainer.style = 'position:relative;';
          break;
      }

      break;
    case 2:
      switch (type) {
        case 'sl':
          imgContainer = img
          img.style = 'position:relative;';
          break;
        case 'l':
          imgContainer = img
          imgContainer.style = 'position:relative;';
          break;
      }

      break;
  }

  if (addonOptions['gpi-sisoa']) {
    if (operationMode === 1 || type !== 'l') {
      const existing = imgContainer.querySelector('.gpi-dms')
      if (!existing) {
        const imgData = parseImageByType(img, type);
        if (!imgData) {
          return
        }

        const width = imgData.data[3][2];
        const height = imgData.data[3][1];

        const dimensionSpan = document.createElement('span');
        dimensionSpan.className = 'gpi-dms gpi-d' + type;

        dimensionSpan.appendChild(document.createTextNode(width + 'x' + height + 'px'));

        imgContainer.appendChild(dimensionSpan);
      }
    }
  }

  if (addonOptions['gpi-ht']) {
    const textNode = imgContainer.querySelector('div[data-snf]:has(> a[data-sb])')
    if (textNode && !textNode.classList.contains('notext')) {
      textNode.classList.add('notext')
    }
  }

  img.dataset.gpi = type;
}

// -------------------------------------------------------------------------

function isInstanceOf(src, comp) {
  return src instanceof comp;
}

// -------------------------------------------------------------------------

function searchHayStack(hayStack, searchValue, analyzedKeys, parent, parentKey) {
  if (!analyzedKeys) {
    analyzedKeys = [];
  }

  if (!parent) {
    parent = null;
  }

  if (!parentKey) {
    parentKey = null;
  }

  if (isInstanceOf(hayStack, Function)) {
    return false;
  } else if (isInstanceOf(hayStack, window.Node)) {
    return false;
  }

  if (isInstanceOf(hayStack, Array)) {
    for (const arrayItem of hayStack) {
      const result = searchHayStack(arrayItem, searchValue, analyzedKeys, parent, parentKey);
      if (result) {
        return result;
      }
    }
  } else if (isInstanceOf(hayStack, Object)) {
    if (Object.keys(hayStack).includes(searchValue)) {
      return hayStack[searchValue];
    }

    for (const [key, value] of Object.entries(hayStack)) {
      if (analyzedKeys.includes(key)) {
        continue;
      }

      analyzedKeys.push(key);

      const result = searchHayStack(value, searchValue, analyzedKeys, hayStack[key], key);
      if (result) {
        return result;
      }
    }
  } else if (hayStack === searchValue) {
    const keyData = Object.assign(
      {},
      {
        parsed: true,
        hayStack,
        needle: searchValue,
        parentKey,
        parentData: parent,
        keyData: parent
      }
    );

    if (parent) {
      for (const entry of parent) {
        if (isInstanceOf(entry, Object) && Object.keys(entry).includes(parentKey)) {
          keyData.keyData = Object.assign({}, entry[parentKey]);
          return keyData;
        }
      }
    }

    return keyData;
  }

  return false;
}

// -------------------------------------------------------------------------
let addonOptions = {};
let hasOptions = false;

if (window.gpi) {
  addonOptions = Object.assign({}, window.gpi);
  console.log('Options loaded...', addonOptions);
  delete window.gpi;
  hasOptions = true;
}

window.requestAnimationFrame(addCSSStyle);
window.requestAnimationFrame(selectImages);
window.setInterval(selectImages, 1800)

