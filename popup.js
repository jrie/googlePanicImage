const useChrome = typeof (browser) === 'undefined';

// --------------------------------------------------------------------
function saveOptions (evt) {
  const optionPrefix = 'gpi-';
  let value = null;
  let parent = false;

  switch (evt.target.type) {
    case 'checkbox':
      value = evt.target.checked;
      break;
    default:
      break;
  }

  let connectedOptions = null;
  let optionName = null;

  switch (evt.target.name) {
    case 'show-image-size-on-all':
    case 'show-image-size-on-underneath':
      connectedOptions = document.querySelectorAll('[name="show-image-size-on-all"], [name="show-image-size-on-underneath"]');
      parent = 'show-image-size-on-all';

      if (connectedOptions) {
        parent = connectedOptions[0];

        for (const option of connectedOptions) {
          optionName = optionPrefix + option.name;

          if (option !== parent) {
            if (option.type === 'checkbox' && !value) {
              option.checked = value;
            }

            if (option.type === 'checkbox') {
              useChrome ? chrome.storage.local.set({ [optionName]: option.checked }) : browser.storage.local.set({ [optionName]: option.checked });
            }
          } else if (option === evt.target) {
            if (option.type === 'checkbox') {
              useChrome ? chrome.storage.local.set({ [optionName]: option.checked }) : browser.storage.local.set({ [optionName]: option.checked });
            }
          }
        }
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
const inputFields = document.querySelectorAll('input');

if (inputFields) {
  for (const input of inputFields) {
    input.addEventListener('change', saveOptions);
  }
}

useChrome ? chrome.storage.local.get().then(loadOptions) : browser.storage.local.get().then(loadOptions);
