# Screenshot Analyzer Chrome Extension

## Google Analytics Integration

This extension now includes comprehensive Google Analytics 4 (GA4) tracking for all user interactions.

### Setup Instructions

1. **Update `analytics.js`**: Open [`browser_extension/analytics.js`](browser_extension/analytics.js:2) and replace `G-XXXXXXXXXX` with your actual GA4 Measurement ID.
2. **Update API Secret**: Replace `YOUR_API_SECRET` in [`browser_extension/analytics.js`](browser_extension/analytics.js:42) with your GA4 API secret.

### Tracked Events

The following user interactions are tracked:

#### Popup Page Events
- **screenshot_analyze_click**: When the "Take Screenshot and Analyze" button is clicked
- **screenshot_error**: When there's an error taking a screenshot (includes error message)
- **prompt_submit**: When a new prompt is submitted (includes prompt length)
- **copy_screenshot_click**: When the copy screenshot button is clicked
- **copy_screenshot_success**: When screenshot is successfully copied to clipboard
- **copy_screenshot_error**: When screenshot copy fails (includes error message)
- **clear_screenshot_click**: When the clear screenshot button is clicked

#### Options Page Events
- **save_api_key_click**: When the "Save" button is clicked on the options page
- **save_api_key_success**: When the API key is successfully saved

### Implementation Details

- Uses GA4's Measurement Protocol for server-side tracking
- Generates and stores a unique client ID for each extension installation
- Events are sent asynchronously without impacting user experience
- Error handling prevents analytics failures from affecting core functionality

### Files Modified

- [`browser_extension/analytics.js`](browser_extension/analytics.js): New file containing GA4 tracking logic
- [`browser_extension/popup.js`](browser_extension/popup.js): Added event tracking calls
- [`browser_extension/options.js`](browser_extension/options.js): Added event tracking calls
- [`browser_extension/popup.html`](browser_extension/popup.html): Added analytics.js script
- [`browser_extension/options.html`](browser_extension/options.html): Added analytics.js script