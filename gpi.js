// ----------------------------------------------------------------------------------------
// Google panic image v4.0.0 @ 17.12.2025
// Author: Jan Riechers [ jan@dwrox.net ]
// Ressource: https://github.com/jrie/googlePanicImage
// ----------------------------------------------------------------------------------------
// Classname for panic button
// ----------------------------------------------------------------------------------------
const GOOGLE_PANIC_CLASS = 'Google-panic-image';
const GOOGLE_PANIC_CLASS_BTN = 'Google-panic-image-btn';
const overlayClassSelector = 'div.' + GOOGLE_PANIC_CLASS;

const gpiStyle = 'div.' + GOOGLE_PANIC_CLASS + ' { box-sizing: border-box; padding:0; margin:0; line-height:0; position: absolute; top: 12%; left: 0px; background: rgba(0,0,0,0.7); color: #fff; font-weight: normal; border-radius: 0px 9px 9px 0px; z-index: 5; font-size: 0.75rem; text-decoration: 0; border: 1px solid #777; border-left: 0; max-height: 2.2rem; display: block; } ' + 'a.' + GOOGLE_PANIC_CLASS_BTN + ' {color: #fff; line-height: 0.9rem; font-size: inherit; font-weight: bold; font-size: 0.75rem; text-decoration: 0; cursor:pointer; padding: 0; margin: 0; padding: 0.4rem 0.5rem 0.6em 0.5rem; display: block; }' + 'a.' + GOOGLE_PANIC_CLASS_BTN + ' > span { line-height: 0.9rem; padding: 0; margin: 0; margin-left: 0.5rem; font-weight: normal; }' + 'a.' + GOOGLE_PANIC_CLASS_BTN + ':hover { font-weight: bold; text-decoration:underline; }';

// -------------------------------------------------------------------------
const debugShowType = false;
const debugShowParsing = false;
let operationMode = 1;
let operationModeTitle = 'Google regular image search';
if (window.location.search && !document.querySelector('body div#main[class="main"]')) {
  operationMode = 2;
  operationModeTitle = 'Google frontpage/frontpage image search';
}

const useChrome = typeof (browser) === 'undefined';

console.log('You are using GooglePanicImages v4.0.0');
console.log(useChrome ? 'Running in a Chrome browser.' : 'Running in a non-Chrome browser.');
console.log('We are in "operation mode ' + operationMode + '" which means we operate on "' + operationModeTitle + '"');
console.log('If this mode differs from the current viewed page or you find a error, please open a bug ticket at: https://github.com/jrie/googlePanicImage');

// ----------------------------------------------------------------------------------------
function addCSSStyle () {
  const stylesheet = document.createElement('style');
  stylesheet.appendChild(document.createTextNode(gpiStyle));
  document.body.appendChild(stylesheet);
}

function getControllerData (caller, controllerValue, id) {
  if (debugShowType) {
    switch (caller) {
      case 's':
        console.debug('Parsing "parseRegularImage" type.');
        break;
      case 'sl':
        console.debug('Parsing "parseSimilarImage" type.');
        break;
      case 'l':
        console.debug('Parsing "parseLargeImage" type.');
        break;
    }
  }
  const resultData = searchHayStack(controllerValue, id);
  if (debugShowParsing) {
    console.debug('getControllerData => resultData', resultData);
  }

  let srcString;

  switch (caller) {
    case 's':
      srcString = 'parseRegularImage';
      break;
    case 'sl':
      srcString = 'parseSimilarImage';
      break;
    case 'l':
      srcString = 'parseLargeImage';
      break;
  }

  if (!resultData || resultData === undefined) {
    console.log('"Result data" for "' + srcString + '" undefined. If this happens multiple times, please report this as a bug: https://github.com/jrie/googlePanicImage');
    return null;
  }

  const resultInfo = searchHayStack(resultData.keyData, '2000');

  if (debugShowParsing) {
    console.debug('getControllerData => resultInfo', resultInfo);
  }

  if (!resultInfo || resultInfo === undefined) {
    console.log('"Result info" for "' + srcString + '" undefined. If this happens multiple times, please report this as a bug: https://github.com/jrie/googlePanicImage');
    return null;
  }

  return { data: resultData.keyData, info: resultInfo, key: resultData.parentKey };
}

// -----------------------------------------------------------------------

function findUpwards (targetAttribute, findValueIn, current) {
  if (!current) {
    return false;
  }

  if (findValueIn !== null) {
    if (current[findValueIn] && current[findValueIn][targetAttribute]) {
      // console.log('current found for findValueIn', targetAttribute);
      // console.log('current-value', current[findValueIn][targetAttribute]);
      return current[findValueIn][targetAttribute];
    }
  } else if (current[targetAttribute]) {
    // console.log('current found for targetAttribute', current);
    // console.log('current-value', current[targetAttribute]);
    return current[targetAttribute];
  }

  return findUpwards(targetAttribute, findValueIn, current.parentNode);
}

// -----------------------------------------------------------------------

function parseImageByType (imageType, target) {
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
        s: 'id',
        sl: 'docid',
        l: 'id'
      }
    }
  };

  const controllerSrc = findUpwards('__jscontroller', null, target);
  const controllerData = controllerSrc.pending.value;
  if (debugShowParsing) {
    console.debug('find upwards result controllerData:', controllerData);
  }

  let type = 'parseRegularImage';
  switch (imageType) {
    case 's':
      type = 'parseRegularImage';
      break;
    case 'sl':
      type = 'parseSimiliarImage';
      break;
    case 'l':
      type = 'parseLargeImage';
      break;
    default:
      break;
  }

  let idData = null;
  let imageData = {};

  if (imageType === 'l') {
    idData = findUpwards(imageTypeOperationMode[operationMode].id[imageType], 'dataset', target);
  } else if (operationMode !== 1 && imageType === 's') {
    idData = findUpwards('id', null, target);
  }

  if (!idData) {
    idData = findUpwards(imageTypeOperationMode[operationMode].id[imageType], 'dataset', target);
  }

  if (!idData) {
    console.log('No "idData" for "' + type + '" in "operation mode=' + operationMode + '"  found.');
  }

  imageData = getControllerData(imageType, controllerData, idData);

  if (debugShowParsing) {
    console.debug('find upwards result idData:', idData);
  }

  if (imageData && imageData.data !== undefined) {
    if (imageType === 'l') {
      imageData.data[3] = imageData.data[3][imageData.key];
    }
  }

  if (!imageData || imageData.data === undefined) {
    console.log('No "imageData" for "' + type + '" in "operation mode=' + operationMode + '"  found.');
    return null;
  }

  return imageData;
}

function deactivateHover (evt) {
  if (evt.target.dataset.gpi === undefined || (evt.relatedTarget && evt.relatedTarget.classList.contains(GOOGLE_PANIC_CLASS_BTN))) {
    return;
  }

  const overlays = document.querySelectorAll(overlayClassSelector);
  if (overlays) {
    for (const overlay of overlays) {
      overlay.parentNode.removeChild(overlay);
    }
  }
}

function activateHover (evt) {
  const gpiTargetType = evt.target.dataset.gpi;

  if (!gpiTargetType) {
    return;
  }

  const overlays = document.querySelectorAll(overlayClassSelector);
  if (overlays) {
    for (const overlay of overlays) {
      overlay.parentNode.removeChild(overlay);
    }
  }

  const imgData = parseImageByType(gpiTargetType, evt.target);
  if (imgData === null) {
    console.log('Image data of "parseImageByType" undefined. Please check the logs and or report as a bug if this happens to continue at: https://github.com/jrie/googlePanicImage');
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

  if (operationMode === 1) {
    switch (gpiTargetType) {
      case 's':
        evt.target.children[1].appendChild(subDiv);
        break;
      case 'sl':
        evt.target.children[0].prepend(subDiv);
        break;
      case 'l':
        evt.target.appendChild(subDiv);
        break;
    }
  } else {
    switch (gpiTargetType) {
      case 's':
        if (useChrome) {
          evt.target.parentNode.parentNode.prepend(subDiv);
        } else {
          evt.target.prepend(subDiv);
        }
        break;
      case 'sl':
        if (useChrome) {
          evt.target.parentNode.parentNode.parentNode.prepend(subDiv);
        } else {
          evt.target.prepend(subDiv);
        }

        break;
      case 'l':
        evt.target.appendChild(subDiv);
        break;
    }
  }

  if (useChrome) {
    subDiv.parentNode.style.overflow = 'visible';
  }

  subDiv.appendChild(domButton);
  domButton.addEventListener('click', openImage);
}

function openImage (evt) {
  let target = evt.target;
  if (target.nodeName !== 'A') {
    target = target.parentNode;
  }

  window.open(target, '_blank');
}

function addHandler (target, type) {
  switch (type) {
    case 's':
      target.addEventListener('mouseenter', activateHover);
      target.addEventListener('mouseleave', deactivateHover);
      break;
    case 'sl':
      target.addEventListener('mouseenter', activateHover);
      target.addEventListener('mouseleave', deactivateHover);
      break;
    case 'l':
      target.addEventListener('mouseenter', activateHover);
      target.addEventListener('mouseleave', deactivateHover);
      break;
    default:
      break;
  }
}

function parseImages () {
  const operationModes = {
    1: {
      l: 'div[data-gap] div[aria-hidden="false"] div[jsaction^="trigger."]',
      sl: 'div[data-gap] div[aria-hidden="false"] div[data-snf] div[data-docid]',
      s: 'div#search div[data-docid]'
    },
    2: {
      l: 'div:not(#search) a[rel="noopener"]:has(> img)',
      sl: 'div:not(#search) div[data-snc] div:has(> img)',
      s: 'div:not(#rcnt) div[role="button"]:has(img)'
    }
  };
  if (operationMode === 2 && useChrome) {
    operationModes[2].s = 'div#rcnt div[role="button"]:has(img)';
  }

  const parsingSelectors = operationModes[operationMode];

  for (const [type, cssSelector] of Object.entries(parsingSelectors)) {
    const images = document.querySelectorAll(cssSelector);

    for (const img of images) {
      if (img.dataset.gpi !== undefined) {
        continue;
      }

      img.dataset.gpi = type;
      addHandler(img, type);
    }
  }
}

// -------------------------------------------------------------------------

function isInstanceOf (src, comp) {
  return src instanceof comp;
}

// -------------------------------------------------------------------------

function searchHayStack (hayStack, searchValue, analyzedKeys, parent, parentKey) {
  if (analyzedKeys === undefined) {
    analyzedKeys = [];
  }

  if (parent === undefined) {
    parent = null;
  }

  if (parentKey === undefined) {
    parentKey = null;
  }

  if (isInstanceOf(hayStack, Function)) {
    return false;
  } else if (isInstanceOf(hayStack, window.Node)) {
    return false;
  }

  if (isInstanceOf(hayStack, Array)) {
    // console.debug('Haystack is array:', hayStack);
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
        // console.debug('Searching in Object, key', key);
        continue;
      }

      analyzedKeys.push(key);

      const result = searchHayStack(value, searchValue, analyzedKeys, hayStack[key], key);
      if (result) {
        return result;
      }
    }
  } else if (hayStack === searchValue) {
    // console.debug('Haystack is single value, we found it in: ', hayStack);

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

function mutationCallback () {
  parseImages();
}

// ----------------------------------------------------------------------------------------
const observer = new window.MutationObserver(mutationCallback);
const observerConfig = {
  subtree: true,
  childList: true,
  attributes: true
};

// -------------------------------------------------------------------------

// window.addEventListener('scrollend', parseImages);
window.requestAnimationFrame(addCSSStyle);
window.requestAnimationFrame(parseImages);
observer.observe(document.body, observerConfig);
