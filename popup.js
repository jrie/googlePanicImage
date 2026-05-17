const useChrome = typeof (browser) === 'undefined';

// --------------------------------------------------------------------
function saveOptions (evt) {
  const optionName = 'gpi-' + evt.target.name;

  switch (evt.target.name) {
    case 'show-image-size-on-all':
      if (evt.target.type === 'checkbox') {
        useChrome ? chrome.storage.local.set({ [optionName]: evt.target.checked }) : browser.storage.local.set({ [optionName]: evt.target.checked });
      }

      break;
    default:
      break;
  }
}

function loadOptions (data) {
  for (const optionKey of Object.keys(data)) {
    const optionName = optionKey.replace('gpi-', '');
    const optionValue = data[optionKey];
    const optionItem = document.querySelector('[name="' + optionName + '"]');

    if (optionItem) {
      if (optionItem.type === 'checkbox') {
        optionItem.checked = optionValue === true;
      }
    }
  }
}

// --------------------------------------------------------------------
const showImageSizesOnAll = document.querySelector('input[name="show-image-size-on-all"]');

if (showImageSizesOnAll) {
  showImageSizesOnAll.addEventListener('change', saveOptions);
}

useChrome ? chrome.storage.local.get().then(loadOptions) : browser.storage.local.get().then(loadOptions);
