var host = 'http://54.85.82.33:8001/'

chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(
        tab.id, {from: 'background', type: 'showModal'}
    );
});

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

// // listen for a request message from the content script
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  handleMessage(msg, response);
  return true; // don't forget to add return true
});

async function handleMessage(request, senderResponse) {
    if (request.type === 'reviewDownloadCompleted' && request.reviews) {
      var formData = new FormData();
      formData.append('reviews', JSON.stringify(request.reviews));
      formData.append('asin', request.asin);
      try {
        let response = await fetch(`${host}/api/upload/reviews`,
        { 
          method: "POST",
          body: formData
        })
  
        // check if the API response is ok Else throw an error
        if (!response.ok) {
            throw new Error(`Failed to fetch. Status code: ${response.status}`);
        }

        // get the data from the API response as json
        let data = await response.json();

        // check if the API response contains an answer
        if (data && data.status) {
            // get the answer from the API response
            let status = data.status;
            // chrome.tabs.sendMessage(request.tabId, { from: 'background', type:'answerArrived', answer: response });
            senderResponse({ from: 'background', type:'reviewTrainCompleted', status: status });
        }
  
      } catch (error) {
        // chrome.tabs.sendMessage(request.tabId, { from: 'background', type:'answerArrived', answer: 'Server side went wrong, make sure to confirm the reviews.'});
        senderResponse({ from: 'background', type:'reviewTrainCompleted', status: false});
      }  
    }    
    if (request.type === 'prompt' && request.input) {
        var formData = new FormData();
        formData.append('url', request.input.url);
        formData.append('cookie', request.input.cookie);
        formData.append('asin', request.input.asin);
        formData.append('prompt', request.input.prompt);
  
        try {
          let response = await fetch(`${host}/api/chat/ext`,
              { 
                method: "POST", 
                body: formData
              })
    
          // check if the API response is ok Else throw an error
          if (!response.ok) {
              throw new Error(`Failed to fetch. Status code: ${response.status}`);
          }
  
          // get the data from the API response as json
          let data = await response.json();
  
          // check if the API response contains an answer
          if (data && data.response) {
              // get the answer from the API response
              let response = data.response;
              // chrome.tabs.sendMessage(request.tabId, { from: 'background', type:'answerArrived', answer: response });
              senderResponse({ from: 'background', type:'answerArrived', answer: response });
          }
    
        } catch (error) {
          // chrome.tabs.sendMessage(request.tabId, { from: 'background', type:'answerArrived', answer: 'Server side went wrong, make sure to confirm the reviews.'});
          senderResponse({ from: 'background', type:'answerArrived', answer: 'Server side went wrong, make sure to confirm the reviews.'});
        }    
    }
}