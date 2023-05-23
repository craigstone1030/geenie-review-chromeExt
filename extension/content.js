var asin, tabId;

// alert('content.js loaded')

// chrome.runtime.sendMessage({ type: "getCurrentTabId"});

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
//     if(request.type == "getCurrentTabId")
//     {
//         tabId = request.tabId
//         alert('tabId loaded ' + tabId)  
//         validateAmazonUrl();
//     }
// });

const validateAmazonUrl = () => {
    var url = window.location.href

    var regex = RegExp("https://www.amazon.com/([\\w-]+/)?(dp|gp/product)/(\\w+/)?(\\w{10})");
    matchedResult = url.match(regex);

    if( matchedResult ) {
        let asin = matchedResult[4];
        // downloadReviews(asin).then(() => {
            initContent(asin);
        // })
    }
}

const initContent = (newAsin) => {
    
    asin = newAsin;
    const contentContainer = document.createElement("div");
    contentContainer.innerHTML = `
    <div class="intel-ant-drawer intel-ant-drawer-right intel-ant-drawer-open" tabindex="-1" style="z-index: 2147483647;">
        <div class="intel-ant-drawer-mask"></div>
        <div tabindex="0" aria-hidden="true" data-sentinel="start" style="width: 0px; height: 0px; overflow: hidden; outline: none; position: absolute;"></div>
        <div class="intel-ant-drawer-content-wrapper" style="width: 538px;">
            <div class="intel-ant-drawer-content drawerContent--XKLpJ" aria-modal="true" role="dialog">
                <iframe id="drawerContentIframe" style="height:99%; width:100%; display: none"></iframe>
                <iframe id="chatAIIframe" style="height:99%; width:100%; display: none"></iframe>

                <div id="loaderContainer">
                    <div id="loader"></div>
                    <div id="loadStatus"></div>
                </div>                
            </div>
        </div>
        <div tabindex="0" aria-hidden="true" data-sentinel="end" style="width: 0px; height: 0px; overflow: hidden; outline: none; position: absolute;">
        </div>
    </div>
    `

    document.body.appendChild(contentContainer);
    const drawerMask = contentContainer.getElementsByClassName("intel-ant-drawer-mask")[0];
    const drawerContentWrapper = contentContainer.getElementsByClassName("intel-ant-drawer-content-wrapper")[0];
    const drawerContentIframe = document.getElementById("drawerContentIframe");
    const chatAIIframe = document.getElementById("chatAIIframe");
    var loaderContainer = document.getElementById("loaderContainer");
    var loadStatus = document.getElementById("loadStatus");

    const modalVisible = (bShow, bFirst) => {
        if( bShow == true ) {
            drawerMask.style.display = 'block';
            drawerContentWrapper.style.right = '0px'
        } else {
            if( bFirst ) {
                drawerContentWrapper.style.transition = 'none';
            } 
            drawerMask.style.display = 'none';
            drawerContentWrapper.style.right = '-538px'
            if( bFirst ) {
                setTimeout(() => {
                    drawerContentWrapper.style.transition = 'all 0.3s';
                }, 300)
            }        
        }
    }

    modalVisible(false, true)

    drawerMask.addEventListener("click", () => {
        modalVisible(false)
    });

    // Listen for messages from the background.
    chrome.runtime.onMessage.addListener((msg, sender, response) => {
        if ((msg.from === 'background') && (msg.type === 'showModal')) {
            modalVisible(true);
        }
    });

    // message from nextjs & openai
    window.addEventListener('message', function(event) {
        if(event.data.from === 'nextjs' && event.data.type === 'ping') {
            drawerContentIframe.contentWindow.postMessage({from:'content', type:'pong', asin: newAsin, browserUrl: window.location.href}, "*")
        }
        if(event.data.from === 'nextjs' && event.data.type === 'openChatAIView') {
            chatAIIframe.style.display = 'block';
            drawerContentIframe.style.display = 'none';       
        }
        if(event.data.from === 'nextjs' && event.data.type === 'getProductInfo') {
            // chrome.runtime.sendMessage({ from: 'nextjs', tabId: tabId,  type:'getProductInfo', input: {url: this.window.location.href, cookie: '', asin: asin} });
            chrome.runtime.sendMessage({ from: 'nextjs', type:'getProductInfo', input: {url: this.window.location.href, cookie: '', asin: asin} }, response => {
                debugger
                drawerContentIframe.contentWindow.postMessage({from:'content', type:'pdInfoArrvied', pdInfos: response.pdInfos}, "*")
            });
        }
        if(event.data.from === 'nextjs' && event.data.type === 'getInitialAnswer') {
            // chrome.runtime.sendMessage({ from: 'nextjs', tabId: tabId,  type:'getProductInfo', input: {url: this.window.location.href, cookie: '', asin: asin} });
            // console.log("request question:" + question)
            chrome.runtime.sendMessage({ from: 'nextjs', type:'getInitialAnswer', input: {url: this.window.location.href, cookie: '', asin: asin, question: event.data.question} }, response => {
                drawerContentIframe.contentWindow.postMessage({from:'content', type:'initialAnswerArrived', question: response.data.question, answer: response.data.answer}, "*")
            });
        }        
        if(event.data.from === 'openai' && event.data.type === 'ping') {
            chatAIIframe.contentWindow.postMessage({from:'content', type:'pong', asin: asin, cookie: '', url: this.window.location.href}, "*")
        }
        if(event.data.from === 'openai' && event.data.type === 'previous') {
            chatAIIframe.style.display = 'none';
            drawerContentIframe.style.display = 'block';
        }
        if(event.data.from === 'openai' && event.data.type === 'prompt') {
            chrome.runtime.sendMessage({ from: 'openai', type:'prompt', input: event.data.input }, response => {
                chatAIIframe.contentWindow.postMessage({from:'content', type:'answerArrived', answer: response.answer}, "*")
            });
        }   
        if(event.data.from === 'nextjs' && event.data.type === 'prompt') {
            chrome.runtime.sendMessage({ from: 'nextjs', type:'prompt', input: {url: this.window.location.href, cookie: '', asin: asin, prompt: event.data.prompt} }, response => {
                drawerContentIframe.contentWindow.postMessage({from:'content', type:'answerArrived', answer: response.answer}, "*")
            });
        }  
    });
    // message from background
    // chrome.runtime.onMessage.addListener(function (request) {
    //     if (request.from === 'background' && request.type === 'pdInfoArrvied' && request.answers) {
    //         // drawerContentIframe.contentWindow.postMessage({from:'content', type:'pdInfoArrvied', pdInfos: request.pdInfos, answers: request.answers}, "*")
    //     }
    //     if (request.from === 'background' && request.type === 'answerArrived' && request.answer) {
    //         // chatAIIframe.contentWindow.postMessage({from:'content', type:'answerArrived', answer: request.answer}, "*")
    //     }        
    // }); 


    chrome.runtime.sendMessage({ from: 'nextjs', type:'reviewDownloadAvailable', asin: asin }, response => {
        if ( response.status ) {
            loaderContainer.style.display = 'flex';
            downloadReviews(asin, loaderContainer, loadStatus, drawerContentIframe, chatAIIframe);
        } else {
            // drawerContentIframe.src = "https://geenieai.com/";
            drawerContentIframe.src = "https://54.85.82.33/";
            // drawerContentIframe.src = "http://52.201.118.164:3000/";            
            // drawerContentIframe.src = "http://localhost:3000/";
            drawerContentIframe.frameBorder = 0;
            drawerContentIframe.style.display = 'block';
        
            chatAIIframe.src = chrome.runtime.getURL("OpenAIView.html");
            chatAIIframe.frameBorder = 0;
            chatAIIframe.style.display = 'none'; 
    
            loaderContainer.style.display = 'none';                 
        }
    });
}

const downloadReviews = async (asin, loaderContainer, downloadStatusText, drawerContentIframe, chatAIIframe) => {
    let page = 1;
    const url = `https://www.amazon.com/product-reviews/${asin}/ref=cm_cr_getr_d_paging_btm_next_3?ie=UTF8&reviewerType=all_reviews&sortBy=recent&pageNumber${page}&pageNumber=${page}`;

    try {
      const res = await fetch(url);
      // const res = await axios.get(url);    
    
      const html = await res.text();
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');
      
      // Convert the HTML string into a document object
      // let parser as any = new DOMParser();
      // const doc = (new DOMParser()).parseFromString(html, 'text/html');
    
      const tempRatingCount = doc.querySelector('div[data-hook="cr-filter-info-review-rating-count"]')?.innerText.trim();

      const reviewsCount = parseInt(
        tempRatingCount
          ?.split("total ratings, ")
          .pop()
          ?.replace(/[^0-9]/g, "") ?? "0"
      );
      
      let totalReviews = [];
      let totalPageCount = reviewsCount / 10;
      downloadStatusText.innerText = `${totalReviews.length} / ${reviewsCount}`
      for(page = 1; page <= totalPageCount; page ++) {    
        const url = `https://www.amazon.com/product-reviews/${asin}/ref=cm_cr_getr_d_paging_btm_next_3?ie=UTF8&reviewerType=all_reviews&sortBy=recent&pageNumber${page}&pageNumber=${page}`;
        const res = await fetch(url);
        const html = await res.text();
    
        // Convert the HTML string into a document object
        var parser = new DOMParser();
        var $ = parser.parseFromString(html, 'text/html');
    
        const reviews = $.querySelectorAll(".a-section.review.aok-relative");
        const reviewData = (reviews).forEach((review) => {
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
          debugger
        });

        downloadStatusText.innerText = `${totalReviews.length} / ${reviewsCount}`
      }

      // loader.style.display = 'none';
      // loader.style.display = 'flex';
      downloadStatusText.innerText = "Just a sec, Waiting for server's response";
    
      // alert(totalReviews.length)
      chrome.runtime.sendMessage({ from: 'nextjs', type:'reviewDownloadCompleted', reviews: totalReviews, asin: asin }, response => {
        drawerContentIframe.src = "http://localhost:3000/";
        drawerContentIframe.frameBorder = 0;
        drawerContentIframe.style.display = 'block';
    
        chatAIIframe.src = chrome.runtime.getURL("OpenAIView.html");
        chatAIIframe.frameBorder = 0;
        chatAIIframe.style.display = 'none'; 

        loaderContainer.style.display = 'none';
    });
          
    } catch(error) {
      console.error('Error fetching data:', error);
    }
}

validateAmazonUrl()