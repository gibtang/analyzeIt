// Google Analytics 4 tracking for Chrome Extension
// This script provides a simple wrapper for GA4 event tracking

(function() {
  'use strict';

  // Replace with your actual GA4 Measurement ID
  //const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
  const GA_MEASUREMENT_ID = 'G-500729746';
  const GA_URL = `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=XXX-XXX`;

  // Function to generate a unique client ID for the extension
  function generateClientId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Function to get or create a client ID
  async function getClientId() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['ga_client_id'], (result) => {
        let clientId = result.ga_client_id;
        if (!clientId) {
          clientId = generateClientId();
          chrome.storage.local.set({ ga_client_id: clientId });
        }
        resolve(clientId);
      });
    });
  }

  // Function to send an event to GA4
  async function trackEvent(eventName, eventParams = {}) {
    const clientId = await getClientId();
    
    const payload = {
      client_id: clientId,
      events: [{
        name: eventName,
        params: {
          ...eventParams,
          engagement_time_msec: 1,
          session_id: Date.now().toString()
        }
      }]
    };

    fetch(GA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }).catch(error => {
      console.error('Failed to send GA event:', error);
    });
  }

  // Function to track page views
  async function trackPageView(pageTitle, pageLocation) {
    const clientId = await getClientId();
    
    const payload = {
      client_id: clientId,
      events: [{
        name: 'page_view',
        params: {
          page_title: pageTitle,
          page_location: pageLocation,
          engagement_time_msec: 1,
          session_id: Date.now().toString()
        }
      }]
    };

    fetch(GA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }).catch(error => {
      console.error('Failed to send GA page view:', error);
    });
  }

  // Make the functions available globally
  window.Analytics = {
    trackEvent,
    trackPageView
  };

})();