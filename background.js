const useChrome = typeof (browser) === 'undefined';
const executionCommand = {
  files: ['gpi.js'],
  target: { allFrames: true, tabId: 0 },
  world: 'MAIN'
};

const executionEnvironment = {
  func: function (optionData) {
    window.gpi = Object.assign({}, optionData);
  },
  args: [],
  target: { allFrames: true, tabId: 0 },
  world: 'MAIN',
  injectImmediately: true
};

async function handleTabUpdate (tabId, changeInfo, tab) {
  if (tab && tab.status === 'complete' && tab.url) {
    const transformedOrigin = tab.url;
    const hasHostPermission = useChrome ? await chrome.permissions.contains({ origins: [transformedOrigin] }) : await browser.permissions.contains({ origins: [transformedOrigin] });
    console.debug('googlePanicImage - hasHostPermission: ', hasHostPermission);
    if (hasHostPermission) {
      const optionData = useChrome ? await chrome.storage.local.get() : await browser.storage.local.get();
      if (optionData) {
        executionEnvironment.target.tabId = tab.id;
        executionEnvironment.args = [optionData];
        useChrome ? await chrome.scripting.executeScript(executionEnvironment) : await browser.scripting.executeScript(executionEnvironment);
      }
      executionCommand.target.tabId = tab.id;
      useChrome ? await chrome.scripting.executeScript(executionCommand) : await browser.scripting.executeScript(executionCommand);
    }
  }
}

useChrome ? chrome.tabs.onUpdated.addListener(handleTabUpdate) : browser.tabs.onUpdated.addListener(handleTabUpdate);
