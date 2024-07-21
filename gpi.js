// ----------------------------------------------------------------------------------------
// Google panic image v3 @ 19.06.2024
// ----------------------------------------------------------------------------------------
// Classname for panic button
// ----------------------------------------------------------------------------------------
const GOOGLE_PANIC_CLASS = 'Google-panic-image';
const GOOGLE_PANIC_CLASS_BTN = 'Google-panic-image-btn';
const overlayClassSelector = 'div.' + GOOGLE_PANIC_CLASS;

const imgRegEx = /imgurl=(.[^\&\?]*\.(jpg|jpeg|gif|apng|png|webm|svg|tiff|webp|avif))/i;
const imgRegExNoFileName = /imgurl=(.[^\&\?]*)/i;
const imgSizeRegEx = /(?<=[w|h]{1}=)([0-9]+)/ig;
const imgSizeRegExLarge = /(?<=span[^>]+\>)([0-9\.\ \×]*)/i;

const imgRegExSrc = /(.[^\&\?]*\.(jpg|jpeg|gif|apng|png|webm|svg|tiff|webp|avif))/i;
const imgRegExNoFileNameSrc = /(.[^\&\?]*)/i;

let hasLargeImage = false;

const gpiStyle = 'div.' + GOOGLE_PANIC_CLASS + ` {
        visibility: 'hidden';
        position: absolute;
        top: 10%;
        left: 0px;
        background: rgba(0,0,0,0.6);
        color: #fff;
        font-weight: normal;
        min-height: 1em;
        padding: 0.5em 1.5em 0.5em 0.5em;
        border-radius: 0px 12px 12px 0px;
        z-index: 1;
        line-height: 1em;
        font-size: 0.75rem;
        text-decoration: none;
        border: 1px solid #aaa;
        border-left: none;
}`;

const gpiBtnStyle = 'a.' + GOOGLE_PANIC_CLASS_BTN + ` {
        color: #fff;
        font-weight: bold;
        height: 1em;
        padding: 0.5em 1.5em 0.5em 0.5em;
        font-size: 0.75rem;
        text-decoration: none;

}`;

// ----------------------------------------------------------------------------------------
function addCSSStyle () {
  const styleSheet = document.styleSheets[0];
  styleSheet.insertRule(gpiStyle);
  styleSheet.insertRule(gpiBtnStyle);
}

function parseRegularImage (target) {
  const img = target.querySelector('a[href^="/imgres"]');
  if (!img || !img.href) {
    return false;
  }

  const imgRawURL = img.href;

  if (imgRawURL) {
    let imgTarget;
    let imgURL = imgRegEx.exec(imgRawURL);
    if (!imgURL) {
      imgURL = imgRegExNoFileName.exec(imgRawURL);
    }

    if (imgURL) {
      imgTarget = decodeURIComponent(imgURL[1]);
      return imgTarget;
    }

    console.warn('imgURL not parsed correctly [parseRegularImage], URL:', imgRawURL.href);
  }

  console.warn('imgRawURL not detected [parseRegularImage], URL:', img.href);
  return false;
}

function parseSubImage (target) {
  if (target.href) {
    const imgURL = imgRegEx.exec(target.href);
    if (imgURL) {
      return decodeURIComponent(imgURL[1]);
    }
  }
  return false;
}

function parseLargeImage (target) {
  if (target.dataset.gpiURI) {
    let imgURL = imgRegExSrc.exec(target.dataset.gpiURI);
    if (!imgURL) {
      imgURL = imgRegExNoFileNameSrc.exec(target.dataset.gpiURI);
    }

    if (imgURL) {
      return decodeURIComponent(imgURL[1]);
    }
  }

  console.warn('imgRawURL not detected [parseLargeImage], URL:', target);
  return false;
}

function deactivateHover (evt) {
  const overlay = evt.target.querySelector(overlayClassSelector);
  if (overlay) {
    overlay.style.visibility = 'hidden';
  }
}

function activateHover (evt) {
  const overlay = evt.target.querySelector(overlayClassSelector);
  if (overlay) {
    overlay.style.visibility = 'visible';
    return;
  }

  const gpiTarget = evt.target.dataset.gpi;
  if (!gpiTarget) {
    return;
  }

  let imgTarget;

  switch (gpiTarget) {
    case 's':
      imgTarget = parseRegularImage(evt.target);
      break;
    case 'l':
      imgTarget = parseLargeImage(evt.target);
      break;
    case 'sl':
      imgTarget = parseSubImage(evt.target);
      break;
    default:
      console.warn('dataset \'gpi\' missing [activateHover]');
      break;
  }

  if (imgTarget) {
    const subDiv = document.createElement('div');
    subDiv.className = GOOGLE_PANIC_CLASS;

    const domButton = document.createElement('a');
    domButton.target = '_blank';
    domButton.href = imgTarget;
    domButton.role = 'button';
    domButton.className = GOOGLE_PANIC_CLASS_BTN;

    domButton.appendChild(document.createTextNode('VIEW'));
    subDiv.appendChild(domButton);

    let imageDimensions;
    switch (evt.target.dataset.gpi) {
      case 's':
        imageDimensions = evt.target.innerHTML.match(imgSizeRegEx);
        break;
      case 'l':
        imageDimensions = evt.target.innerHTML.match(imgSizeRegExLarge);
        if (imageDimensions) {
          const splitDimensions = imageDimensions[0].replace(/\./g, '').split(' ', 3);
          console.log(splitDimensions);
          imageDimensions = [parseInt(splitDimensions[0]), parseInt(splitDimensions[2])];
        }
        break;
      case 'sl':
        imageDimensions = evt.target.href.match(imgSizeRegEx);
        break;
      default:
        break;
    }

    if (imageDimensions) {
      const width = imageDimensions[0];
      const height = imageDimensions[1];
      subDiv.appendChild(document.createTextNode(width + 'x' + height));
    }

    switch (evt.target.dataset.gpi) {
      case 's':
        evt.target.appendChild(subDiv);
        domButton.addEventListener('click', openImage);
        break;
      case 'l':
      case 'sl':
        evt.target.appendChild(subDiv);
        break;
    }
  }
}

function openImage (evt) {
  window.open(evt.target.href, '_blank');
}

function deactivateLarge (evt) {
  hasLargeImage = false;
}

function addHandler (target) {
  switch (target.dataset.gpi) {
    case 'b':
      target.addEventListener('mouseenter', deactivateLarge);
      break;
    case 's':
      target.addEventListener('mouseenter', activateHover);
      target.addEventListener('mousemove', activateHover);
      target.addEventListener('mouseleave', deactivateHover);
      target.addEventListener('click', deactivateLarge);
      break;
    case 'l':
      target.addEventListener('mouseenter', activateHover);
      target.addEventListener('mousemove', activateHover);
      target.addEventListener('mouseleave', deactivateHover);
      break;
    case 'sl':
      target.addEventListener('mouseenter', activateHover);
      target.addEventListener('mousemove', activateHover);
      target.addEventListener('mouseleave', deactivateHover);
      target.addEventListener('click', deactivateLarge);
      break;
  }
}

function parseImages () {
  // Regular view
  const regularImages = document.querySelectorAll('div[data-attrid^="images"]');
  for (const img of regularImages) {
    if (img.dataset.gpi) {
      continue;
    }

    img.dataset.gpi = 's';
    addHandler(img);
  }
}

function parseGallerySubImages () {
  // Gallery subimages view
  const gallerySubImages = document.querySelectorAll('a[data-nav="1"]');
  for (const img of gallerySubImages) {
    if (img.dataset.gpi) {
      continue;
    }

    if (img.src) {
      continue;
    }

    if (!img.href) {
      img.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true,
        button: 2
      }));

      continue;
    }

    img.dataset.gpi = 'sl';
    img.dataset.gpiURI = img.href;
    addHandler(img);
  }
}

function parseLarge (target) {
  // Detail gallery view
  target.parentNode.dataset.gpi = 'l';
  target.parentNode.dataset.gpiURI = target.src;
  addHandler(target.parentNode);
  hasLargeImage = true;
}

function parseControls () {
  const controls = document.querySelectorAll('button[aria-disabled="false"]');
  for (const control of controls) {
    if (!control.dataset.gpi) {
      control.dataset.gpi = 'b';
      addHandler(control);
    }
  }
}

function mutationCallback (mutations, observer) {
  if (hasLargeImage) {
    window.requestAnimationFrame(parseGallerySubImages);
    return;
  }

  for (const mutation of mutations) {
    if (mutation.target.nodeName === 'IMG' && mutation.target.src) {
      if (mutation.target.src.startsWith('https://encrypted-tb')) {
        continue;
      }

      parseLarge(mutation.target);
      parseControls();
      return;
    }
  }
}

// ----------------------------------------------------------------------------------------
const observer = new MutationObserver(mutationCallback);
const observerConfig = {
  attributes: true,
  attributeFilter: ['style'],
  subtree: true
};

window.addEventListener('scrollend', parseImages);
window.requestAnimationFrame(addCSSStyle);
window.requestAnimationFrame(parseImages);
window.requestAnimationFrame(parseGallerySubImages);
observer.observe(document.body, observerConfig);
