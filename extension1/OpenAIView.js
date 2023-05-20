const queryInput = document.getElementById("query-input");
const asinCode = document.getElementById("asinCode");
const previousButton = document.getElementById("prevous-button");
const submitButton = document.getElementById("submit-button");
const clearButton = document.getElementById("clear-button");
const queriesAnswersContainer = document.getElementById("queriesAnswersContainer");
const showHideWrapper = document.getElementById("show-hide-wrapper");
const loader = document.getElementById("loaderContainer");
const downloadButton = document.getElementById("download-button");

const container = document.getElementById("container")
const faildMessage = document.getElementById("faildMessage")

const loadStatus = document.getElementById("loadStatus");

var asin = ''

// async function getTab() {
//   let queryOptions = { active: true, currentWindow: true };
//   let tabs = await chrome.tabs.query(queryOptions);
//   return tabs[0];
// }

// function getCookies(callback) {
//     chrome.tabs.query(
//     {
//         status: 'complete',
//         active: true,
//     },
//     tab => {

//         if( tab.length == 0 ) {
//           getCookies(callback)
//           return;
//         }

//         chrome.cookies.getAll({ url: 'https://www.amazon.com/' }, cookies => {
//           if(cookies.length == 0) return;
          
//           allCookie = ''
//           cookies.forEach((item) => {
//             allCookie += item["name"] + '=' + item["value"] + ';'
//           })

//           callback(allCookie)
//         });
//     },
// ); 
// }

//usage:

// get current tab url
// getTab().then(tab => {

// var url = tab.url
// var regex = RegExp("https://www.amazon.com/([\\w-]+/)?(dp|gp/product)/(\\w+/)?(\\w{10})");
// m = url.match(regex);

// faildMessage.innerText = 'Sorry, faild to get ASIN.'
// faildMessage.style.display = 'block'
// container.style.display = 'none'

// if (m) {
//     faildMessage.style.display = 'none'
//     loader.style.display = "flex";

//   getCookies();
// }
// })

async function downloadAllReviews(asin) {

  loader.style.display = 'flex';
  loadStatus.innerText = '0 / 0';
  
  let page = 1;
  const url = `https://www.amazon.com/product-reviews/${asin}/ref=cm_cr_getr_d_paging_btm_next_3?ie=UTF8&reviewerType=all_reviews&sortBy=recent&pageNumber${page}&pageNumber=${page}`;
  const res = await fetch(url);

  const html = await res.text();
  
  // Convert the HTML string into a document object
	var parser = new DOMParser();
	var doc = parser.parseFromString(html, 'text/html');

  const tempRatingCount = doc.querySelector(
    `div[data-hook="cr-filter-info-review-rating-count"]`
  )?.innerText.trim();

  const reviewsCount = parseInt(
    tempRatingCount
      ?.split("total ratings, ")
      .pop()
      ?.replace(/[^0-9]/g, "") ?? "0"
  );
  
  totalReviews = []
  page = 1, totalPageCount = reviewsCount / 10;
  // totalPageCount = 10;
  for(page = 1; page <= totalPageCount; page ++) {
    loadStatus.innerText = `${totalReviews.length} / ${reviewsCount}`;

    const url = `https://www.amazon.com/product-reviews/${asin}/ref=cm_cr_getr_d_paging_btm_next_3?ie=UTF8&reviewerType=all_reviews&sortBy=recent&pageNumber${page}&pageNumber=${page}`;
    const res = await fetch(url);
    const html = await res.text();

    // Convert the HTML string into a document object
    var parser = new DOMParser();
    var $ = parser.parseFromString(html, 'text/html');

    const reviews = $.querySelectorAll(".a-section.review.aok-relative");
    const reviewData = reviews.forEach((review) => {
      const rating = review.querySelector(".a-icon-alt")?.innerText;
      const title = review.querySelector(".review-title")?.innerText;
      const date = review.querySelector(".review-date")?.innerText;
      const customer_review = review.querySelector(".review-text")?.innerText;
      const verified = review.querySelector(".a-declarative") ? true : false;
      const name = review.querySelector(".a-profile-name")?.innerText;
      totalReviews.push({
        rating: rating?.trim(),
        title_review: title?.trim(),
        date: date?.trim(),
        customer_review: customer_review
          ?.trim()
          .startsWith("The media could not be loaded.")
          ? "No Media"
          : customer_review?.trim(),
        verified: verified,
        customer_name: name?.trim(),
      });
    });
  }
  // loader.style.display = 'none';
  // loader.style.display = 'flex';
  loadStatus.innerText = '';

  // alert(totalReviews.length)
  window.parent.postMessage({from:'openai', type:'reviewDownloadCompleted', reviews: totalReviews, asin: asin}, "*")
}

function init(asin, cookie, url) {
    loader.style.display = "none";

    // faildMessage.style.display = 'none'
    container.style.display = 'block'

    asinCode.innerHTML = 'ASIN:' + asin;
  
    // send a message to the background script to reset the message array
    // chrome.runtime.sendMessage({ openedPopup: true });
    // focus on the input field
    queryInput.focus();
  
    // disable the submit button if the input field is empty
    queryInput.addEventListener("keyup", () => {
      if (queryInput.value === "") {
        submitButton.disabled = true;
      } else {
        submitButton.disabled = false;
      }
    });
  
    // If the user presses enter, click the submit button
    queryInput.addEventListener("keyup", (event) => {
      if (event.code === "Enter") {
        event.preventDefault();
        submitButton.click();
      }
    });

    downloadButton.addEventListener("click", () => {
      downloadAllReviews(asin);    
    })
  
    // Listen for clicks on the clear button 
    clearButton.addEventListener("click", () => {
      // Clear the queriesAnswers array from local storage
      chrome.storage.local.set({ queriesAnswers: [] }, () => {
        console.log("queriesAnswers array cleared");
      });
      // Hide the last query and answer
      showHideWrapper.style.display = "none";
      // Clear the queriesAnswers container
      queriesAnswersContainer.innerHTML = "";
      queriesAnswersContainer.style.display = "none";
    });

    // previousButton.addEventListener("click", () => {
    //     window.parent.postMessage({from:'openai', type:'previous'}, "*")
    // });
  
    // Listen for clicks on the submit button
    submitButton.addEventListener("click", async () => {
      // Get the message from the input field
      const message = queryInput.value;
  
      // // Send the query to the background script
      // chrome.runtime.sendMessage({ input: message });
  
      // Clear the answer
      document.getElementById("answer").innerHTML = "";
      // Hide the answer
      document.getElementById("answerWrapper").style.display = "none";
      // Show the loading indicator
      document.getElementById("loading-indicator").style.display = "block";
  
      // queryData = {"url":url, "cookie":cookie,"asin":asin,"prompt":message}
      
      // var formData = new FormData();
      // formData.append('url', url);
      // formData.append('cookie', cookie);
      // formData.append('asin', asin);
      // formData.append('prompt', message);

      // chrome.runtime.sendMessage({ from: 'openai', type:'prompt', input: {url: url, cookie: cookie, asin: asin, message: message} });
      window.parent.postMessage({ from: 'openai', type:'prompt', input: {url: url, cookie: cookie, asin: asin, prompt: message} }, "*")

      // Create queriesAnswers array from local storage 
      // displayQueriesAnswers();
    });
  
    // Get the button and the last request element
    const showHideLastAnswerButton = document.getElementById('show-hide-last-answer-button');
    // Initially hide the last request
    queriesAnswersContainer.style.display = "block";
    showHideWrapper.style.display = "none";
    // Get localised strings
    document.getElementById("lastRequestsTitle").innerText = chrome.i18n.getMessage("lastMessagesTitle");
    // Add a click event listener to the button
    showHideLastAnswerButton.addEventListener('click', () => {
      // If the last answer is currently hidden
      if (queriesAnswersContainer.style.display === "none") {
        // Show the last answer
        queriesAnswersContainer.style.display = "block";
        // Change the button text to "Hide Last Answer"
        showHideLastAnswerButton.innerHTML = '<i class="fa fa-eye-slash"></i>';
      } else {
        // Hide the last answer
        queriesAnswersContainer.style.display = "none";
        // Change the button text to "Show Last Answer"
        showHideLastAnswerButton.innerHTML = '<i class="fa fa-eye"></i>';
      }
    });
  
    // Create queriesAnswers array from local storage on popup open
    displayQueriesAnswers();
  }

  
  function showAnswer( {answer, error} ) {
  
    if (answer) {
      // Show the answer
      document.getElementById("answerWrapper").style.display = "block";
      const answerWithBreaks = answer.replace(/\n/g, '<br>');
      document.getElementById("answer").innerHTML += answerWithBreaks;
      // Add event listener to copy button
      document.getElementById("copyAnswer").addEventListener("click", () => {
        // Get the answer text
        const answerText = answer;
        // Copy the answer text to the clipboard
        navigator.clipboard.writeText(answerText)
          .then(() => console.log("Answer text copied to clipboard"))
          .catch((err) => console.error("Could not copy text: ", err));
      });
      const options = { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      const time = new Date().toLocaleString('en-US', options);
      // Give the span with the id timestamp the current time
      document.getElementById("timestamp").innerText = time;
      // Hide the loading indicator
      document.getElementById("loading-indicator").style.display = "none";
      // Get the query from the input field
      const query = queryInput.value;
      // Save the query and answer to the queriesAnswers array and add a timestamp to the last query and answer
      chrome.storage.local.get({ queriesAnswers: [] }, ({ queriesAnswers }) => {
        queriesAnswers.push({ asin, query, answer, timeStamp: time });
        // Save the array to local storage and add a timestamp to the last query and answer
        chrome.storage.local.set({ queriesAnswers }, () => {
          console.log("queriesAnswers array updated");
        });
      });
    } else if (error) {
      // Show the error message
      document.getElementById("answerWrapper").style.display = "block";
      document.getElementById("answer").innerText = error;
      // Hide the loading indicator
      document.getElementById("loading-indicator").style.display = "none";
    }  
  }
    // Listen for clicks on the submit button
    function displayQueriesAnswers() {
      chrome.storage.local.get(['queriesAnswers'], ({ queriesAnswers }) => {
        // Check if queriesAnswers is null or empty
        if (!queriesAnswers || queriesAnswers.length === 0) {
          return;
        }
        // Reverse the array so that the last item is displayed first
        queriesAnswers = queriesAnswers.reverse();
        // If the queriesAnswers array is not empty
        if (queriesAnswers.length > 0) {
          // Show the last query and answer
          showHideWrapper.style.display = "flex";
          // Clear the queriesAnswers container
          queriesAnswersContainer.innerHTML = "";
          // Iterate through the queriesAnswers array and display each item
          queriesAnswers.forEach(({ qasin, query, answer, timeStamp }, i) => {
            if( asin != qasin ) {
              const answerWithBreaks = answer.replace(/\n/g, '<br>');
              // Create an HTML element to display the query and answer
              const item = document.createElement('div');
              item.className = "queriesAnswers";
              // Add margin on the bottom of each item except the last one
              item.style.marginBottom = i < queriesAnswers.length - 1 ? "0.5rem" : "0";
              // Create a remove button
              const removeButton = `<button id=removeButton${i} class="btn removeButton" title="Remove this query and answer from the list"><i class="fa fa-trash"></i></button>`;
              // Create a copy button
              const copyButton = `<button id=copyLastAnswer${i} class="btn copyButton" title="Copy the Answer to the Clipboard"><i class="fa fa-clipboard" style="font-size: small"></i></button>`;
              // Create a time stamp the time now in the format hh:mm:ss
              const options = { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
              const time = new Date().toLocaleString('en-US', options);
              const timeStampElem = `<div class="timeStamp">${timeStamp || time}</div>`;
              // Add query, answer, copy button, and remove button to the HTML element
              item.innerHTML = `
                <div style="color: rgb(188, 188, 188); margin-bottom: 0.2rem;">${query}</div>
                <div>${answerWithBreaks}</div>
                <div class="copyRow">
                  ${timeStampElem}
                  <div>${removeButton}${copyButton}</div>
                </div>
              `;
              // Append the item to the container element
              queriesAnswersContainer.appendChild(item);
              // Add event listener to the remove button
              document.getElementById(`removeButton${i}`).addEventListener("click", () => {
                // Remove the item from the queriesAnswers array
                queriesAnswers.splice(i, 1);
                // Update the queriesAnswers array in local storage
                chrome.storage.local.set({ queriesAnswers }, () => {
                  console.log("queriesAnswers array updated");
                });
                // Remove the item from the container
                item.remove();
                // If the queriesAnswers array is empty, hide the last query and answer
                if (queriesAnswers.length === 0) {
                  showHideWrapper.style.display = "none";
                  queriesAnswersContainer.style.display = "none";
                }
              });
              // Add event listener to copy button
              document.getElementById(`copyLastAnswer${i}`).addEventListener("click", () => {
                // Get the answer text
                const answerText = answer;
                // Copy the answer text to the clipboard
                navigator.clipboard.writeText(answerText)
                  .then(() => console.log("Answer text copied to clipboard"))
                  .catch((err) => console.error("Could not copy text: ", err));
              });
            }
          });
        } else {
          // Hide the last query and answer
          showHideWrapper.style.display = "none";
        }
      });
    }


  window.parent.postMessage({from:'openai', type:'ping'}, "*")

  window.addEventListener('message', (event)=> {
    if(event.data.from === 'content' && event.data.type === 'pong') {
      asin = event.data.asin;
      init(event.data.asin, event.data.cookie, event.data.url)
    }
    if (event.data.from === 'content' && event.data.type === 'answerArrived') {
      debugger
      showAnswer( {answer: event.data.answer} )
      // Create queriesAnswers array from local storage 
      displayQueriesAnswers();
    }
    if (event.data.from === 'content' && event.data.type === 'reviewTrainCompleted') {
      loader.style.display = 'none';
    }
  });