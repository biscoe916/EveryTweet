chrome.browserAction.onClicked.addListener(function(tab) {  
  chrome.tabs.query({ active: true }, function(tabs) {
    var tabId = tabs[0].id;
    chrome.tabs.sendMessage(tabId, {action: 'requestConfirmation'}, begin.bind(null, tabId));
  });
});

function begin(tabId, resp) {
  chrome.tabs.update(tabId, {url: 'https://twitter.com/search?q=from%3A' + resp.user + '&src=typd&EveryTweet=true&EveryTweetCount='+resp.tweetCount});
}