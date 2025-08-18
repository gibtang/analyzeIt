document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveButton = document.getElementById('saveButton');
  const statusDiv = document.getElementById('status');

  // Load saved API key
  chrome.storage.sync.get('openRouterApiKey', (data) => {
    if (data.openRouterApiKey) {
      apiKeyInput.value = data.openRouterApiKey;
    }
  });

  // Save API key
  saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value;
    
    // Track save API key button click
    if (window.Analytics) {
      window.Analytics.trackEvent('save_api_key_click');
    }

    chrome.storage.sync.set({ openRouterApiKey: apiKey }, () => {
      statusDiv.textContent = 'API Key saved!';
      
      // Track successful save
      if (window.Analytics) {
        window.Analytics.trackEvent('save_api_key_success');
      }

      setTimeout(() => {
        statusDiv.textContent = '';
      }, 2000);
    });
  });
});
