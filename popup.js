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

  let currentScreenshotDataUrl = ''; // To store the screenshot data for re-use

  async function callAnalyzeApi(prompt, dataUrl) {
    resultDiv.textContent = '';
    promptError.textContent = ''; // Clear any previous errors
    promptText.disabled = true; // Disable prompt text area
    submitPromptButton.disabled = true; // Disable submit button

    // Show spinner and disable analyze button
    analyzeButtonText.textContent = 'Analyzing...';
    analyzeButton.disabled = true;
    analyzeButtonSpinner.classList.remove('hidden');

    try {
      const response = await fetch(config.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, dataUrl })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Analyze API Error Details:', errorData);
        if (response.status === 500 && errorData.error.includes('API Key not set')) {
          resultDiv.innerHTML = 'Error: OpenRouter API Key not set on the server. Please contact the administrator.';
        } else {
          throw new Error(`Analyze API request failed with status ${response.status}: ${errorData.error}`);
        }
        return;
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

  // Remove the API key check from here, as it's now handled by the backend
  // The options link is also no longer relevant for the extension itself
  // as the API key is now set on the server.
  // The original error message and options link logic is removed.
  // The API key is now a server-side concern.

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

      await callAnalyzeApi(initialPrompt, currentScreenshotDataUrl);
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
      await callAnalyzeApi(newPrompt, currentScreenshotDataUrl);
    } else {
      resultDiv.textContent = 'No screenshot available to analyze. Please take a screenshot first.';
    }
  });
});

