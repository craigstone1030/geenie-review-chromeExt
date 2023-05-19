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
    // check if the request contains a message that the user sent a new message
    // url: url, cookie: cookie, asin: asin, message: message
    // console.log(JSON.stringify(request))
    if (request.type === 'getProductInfo' && request.input) {
      var formData = new FormData();
      formData.append('url', request.input.url);
      formData.append('cookie', request.input.cookie);
      formData.append('asin', request.input.asin);
      // formData.append('type', 'getProductInfo');

      try {
        response = await fetch(`${host}/api/pdinfo/get`,
            { 
              method: "POST", 
              body: formData
            })

          if (!response.ok) {
              throw new Error(`Failed to fetch. Status code: ${response.status}`);
          }

          // get the data from the API response as json
          let data = await response.json();
          // check if the API response contains an answer
          if (data && data.response) {
              // get the answer from the API response
              let response = data.response;
              // return { from: 'background', type:'pdInfoArrvied', pdInfos: data.productInformation, answers: response }
              senderResponse({ from: 'background', type:'pdInfoArrvied', pdInfos: response })
          } else {
            // return { from: 'background', type:'pdInfoArrvied', pdInfos: null, answers: []  }
            senderResponse({ from: 'background', type:'pdInfoArrived', pdInfos: null })
          }

      } catch (error) {
        // return { from: 'background', type:'pdInfoArrvied', pdInfos: null, answers: []  }
        senderResponse({ from: 'background', type:'pdInfoArrived', pdInfos: null })
      }
    }
    if (request.type === 'getInitialAnswer' && request.input) {
      var formData = new FormData();
      formData.append('url', request.input.url);
      formData.append('cookie', request.input.cookie);
      formData.append('asin', request.input.asin);
      formData.append('prompt', 'Initial Question');
      formData.append('question', request.input.question);

      try {
        debugger
        let response = await fetch(`${host}/api/chat/ext`,
            { 
              method: "POST", 
              body: formData
            })
  
          debugger
        // check if the API response is ok Else throw an error
        if (!response.ok) {
            throw new Error(`Failed to fetch. Status code: ${response.status}`);
        }

        // get the data from the API response as json
        let data = await response.json();

        // check if the API response contains an answer
        if (data && data.response) {
            // get the answer from the API response
            let response = data.response

            // chrome.tabs.sendMessage(request.tabId, { from: 'background', type:'answerArrived', answer: response });
            senderResponse({ from: 'background', type:'initialAnswerArrived', data: response });
        }
  
      } catch (error) {
        // chrome.tabs.sendMessage(request.tabId, { from: 'background', type:'answerArrived', answer: 'Server side went wrong, make sure to confirm the reviews.'});
        senderResponse({ from: 'background', type:'initialAnswerArrived', answers: []});
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
  
              debugger
              // chrome.tabs.sendMessage(request.tabId, { from: 'background', type:'answerArrived', answer: response });
              senderResponse({ from: 'background', type:'answerArrived', answer: response });
          }
    
        } catch (error) {
          // chrome.tabs.sendMessage(request.tabId, { from: 'background', type:'answerArrived', answer: 'Server side went wrong, make sure to confirm the reviews.'});
          senderResponse({ from: 'background', type:'answerArrived', answer: 'Server side went wrong, make sure to confirm the reviews.'});
        }    
    }
  }