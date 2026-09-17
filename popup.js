const useChrome = typeof (browser) === 'undefined';

// --------------------------------------------------------------------
function saveOptions (evt) {
  const optionPrefix = 'gpi-';
  let value = null;

  switch (evt.target.type) {
    case 'checkbox':
      value = evt.target.checked;
      break;
    default:
      break;
  }

  let optionName = optionPrefix + evt.target.name;
  useChrome ? chrome.storage.local.set({ [optionName]: value }) : browser.storage.local.set({ [optionName]: value });
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
