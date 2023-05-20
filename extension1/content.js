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
        initContent(asin);
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
                <iframe id="chatAIIframe" style="height:99%; width:100%;"></iframe>
            </div>
        </div>
        <div tabindex="0" aria-hidden="true" data-sentinel="end" style="width: 0px; height: 0px; overflow: hidden; outline: none; position: absolute;">
        </div>
    </div>
    <a id="downloadReviews" style="display: none"></a>
    `

    document.body.appendChild(contentContainer);
    const drawerMask = contentContainer.getElementsByClassName("intel-ant-drawer-mask")[0];
    const drawerContentWrapper = contentContainer.getElementsByClassName("intel-ant-drawer-content-wrapper")[0];
    const chatAIIframe = document.getElementById("chatAIIframe");

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

    chatAIIframe.src = chrome.runtime.getURL("OpenAIView.html");
    chatAIIframe.frameBorder = 0;
    chatAIIframe.style.display = 'block';

    // message from nextjs & openai
    window.addEventListener('message', function(event) {    
        if(event.data.from === 'openai' && event.data.type === 'ping') {
            chatAIIframe.contentWindow.postMessage({from:'content', type:'pong', asin: asin, cookie: '', url: this.window.location.href}, "*")
        }
        if(event.data.from === 'openai' && event.data.type === 'prompt') {
            chrome.runtime.sendMessage({ from: 'openai', type:'prompt', input: event.data.input }, response => {
                chatAIIframe.contentWindow.postMessage({from:'content', type:'answerArrived', answer: response.answer}, "*")
            });
        }  
        if(event.data.from === 'openai' && event.data.type === 'reviewDownloadCompleted') {
            chrome.runtime.sendMessage({ from: 'openai', type:'reviewDownloadCompleted', reviews: event.data.reviews, asin: event.data.asin }, response => {
                chatAIIframe.contentWindow.postMessage({from:'content', type:'reviewTrainCompleted'}, "*")
            });

            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(event.data.reviews));
            var dlAnchorElem = window.parent.document.getElementById('downloadReviews');
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("style", "display:none");
            dlAnchorElem.setAttribute("download", `${asin}.json`);
            dlAnchorElem.click();
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
}

// window.addEventListener('load', function () {
// })

validateAmazonUrl()