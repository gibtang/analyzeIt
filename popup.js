document.addEventListener('DOMContentLoaded', () => {
  const analyzeButton = document.getElementById('analyzeButton');
  const analyzeButtonText = document.getElementById('analyzeButtonText');
  const analyzeButtonSpinner = document.getElementById('analyzeButtonSpinner');
  const screenshotPreview = document.getElementById('screenshotPreview');
  const resultDiv = document.getElementById('result');
  const promptContainer = document.getElementById('promptContainer');
  const promptText = document.getElementById('promptText');
  const submitPromptButton = document.getElementById('submitPromptButton');
  const promptError = document.getElementById('promptError');

  const OPENROUTER_MODEL = 'google/gemini-flash-1.5';
  let currentScreenshotDataUrl = ''; // To store the screenshot data for re-use

  async function callOpenRouter(prompt, dataUrl) {
    resultDiv.textContent = '';
    promptError.textContent = ''; // Clear any previous errors
    promptText.disabled = true; // Disable prompt text area
    submitPromptButton.disabled = true; // Disable submit button

    // Show spinner and disable analyze button
    analyzeButtonText.textContent = 'Analyzing...';
    analyzeButton.disabled = true;
    analyzeButtonSpinner.classList.remove('hidden');

    try {
      const data = await chrome.storage.sync.get('openRouterApiKey');
      const OPENROUTER_API_KEY = data.openRouterApiKey;

      if (!OPENROUTER_API_KEY) {
        resultDiv.textContent = 'Error: OpenRouter API Key not set. Please go to extension options to set it.';
        return;
      }

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
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: dataUrl } }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Details:', errorData);
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
      promptText.disabled = false; // Re-enable prompt text area
      submitPromptButton.disabled = false; // Re-enable submit button

      // Reset analyze button state
      analyzeButtonText.textContent = 'Take Screenshot and Analyze';
      analyzeButton.disabled = false;
      analyzeButtonSpinner.classList.add('hidden');
    }
  }

  analyzeButton.addEventListener('click', async () => {
    screenshotPreview.classList.add('hidden');
    promptContainer.classList.add('hidden'); // Hide prompt container initially
    resultDiv.textContent = '';

    try {
      currentScreenshotDataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
      screenshotPreview.src = currentScreenshotDataUrl;
      screenshotPreview.classList.remove('hidden');

      const initialPrompt = 'Analyze this screenshot and provide a detailed description.';
      promptText.value = initialPrompt; // Set initial prompt in textarea

      await callOpenRouter(initialPrompt, currentScreenshotDataUrl);
      promptContainer.classList.remove('hidden'); // Show prompt container after initial analysis

    } catch (error) {
      console.error('Error:', error);
      resultDiv.textContent = `An error occurred: ${error.message}. Please check the console for more details.`;
    }
  });

  submitPromptButton.addEventListener('click', async () => {
    const newPrompt = promptText.value.trim();
    if (!newPrompt) {
      promptError.textContent = 'Prompt cannot be empty.';
      return;
    }
    promptError.textContent = ''; // Clear error if valid

    if (currentScreenshotDataUrl) {
      await callOpenRouter(newPrompt, currentScreenshotDataUrl);
    } else {
      resultDiv.textContent = 'No screenshot available to analyze. Please take a screenshot first.';
    }
  });
});
