document.addEventListener('DOMContentLoaded', () => {
  const analyzeButton = document.getElementById('analyzeButton');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const screenshotPreview = document.getElementById('screenshotPreview');
  const resultDiv = document.getElementById('result');

  const OPENROUTER_MODEL = 'google/gemini-flash-1.5';

  analyzeButton.addEventListener('click', async () => {
    loadingIndicator.classList.remove('hidden');
    screenshotPreview.classList.add('hidden');
    resultDiv.textContent = '';

    try {
      const data = await chrome.storage.sync.get('openRouterApiKey');
      const OPENROUTER_API_KEY = data.openRouterApiKey;

      if (!OPENROUTER_API_KEY) {
        resultDiv.textContent = 'Error: OpenRouter API Key not set. Please go to extension options to set it.';
        loadingIndicator.classList.add('hidden');
        return;
      }

      const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
      screenshotPreview.src = dataUrl;
      screenshotPreview.classList.remove('hidden');

      const base64Image = dataUrl.split(',')[1];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Analyze this screenshot and provide a detailed description.' },
                { type: 'image_url', image_url: { url: dataUrl } }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Details:', errorData); // Log full error for debugging
        throw new Error(`API request failed with status ${response.status}.`);
      }

      const responseData = await response.json();
      if (responseData.choices && responseData.choices.length > 0 && responseData.choices[0].message && responseData.choices[0].message.content) {
        resultDiv.textContent = responseData.choices[0].message.content;
      } else {
        resultDiv.textContent = 'No analysis content received from the API.';
      }

    } catch (error) {
      console.error('Error:', error);
      resultDiv.textContent = `An error occurred: ${error.message}. Please check the console for more details.`;
    } finally {
      loadingIndicator.classList.add('hidden');
    }
  });
});
