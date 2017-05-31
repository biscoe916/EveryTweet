import $ from 'jquery';
import ElementRegistry from '../utils/element-registry';
import PrettyMs from 'pretty-ms';
import FileSaver from 'file-saver';

import shieldHtml from '../templates/shield.html';
import modalHtml from '../templates/modal.html';
import startHtml from '../templates/start.html';
import statusHtml from '../templates/status.html';
import completedHtml from '../templates/completed.html';

export default class Bot {
  constructor(initObj) {
    this._tweets = [];
    this._user = initObj.user;
    this._totalTweets = parseInt(initObj.tweetCount);
    this._count = 0;
  }
  
  getConfirmation() {
    this._$body = $(document.body);
    this._$shield = $(shieldHtml).appendTo(this._$body);
    this._$modal = $(modalHtml).appendTo(this._$shield);
    this._$modalInner = $('.EveryTweet-modal-inner', this._$modal);
    this._$beginContent = $(startHtml).appendTo(this._$modalInner);
    this._$beginButton = $('#EveryTweet-begin-button', this._$beginContent);    
    this._$userText = $('.EveryTweet-user-name', this._$beginContent).text(`@${this._user}`);

    this._$status = $(statusHtml);
    this._$tweetsCompleted = $('.EveryTweet-tweets-completed', this._$status);
    this._$totalTweets = $('.EveryTweet-total-tweets', this._$status);
    this._$timeRemaining = $('.EveryTweet-time-remaining', this._$status);
    this._$progressBar = $('.EveryTweet-progress-bar-inner', this._$status);
    this._$progressPercentage = $('.EveryTweet-progress-percentage', this._$status);
    this._$haltButton = $('#EveryTweet-halt-button', this._$status);
    this._$completed = $(completedHtml);
    this._$jsonButton = $('#EveryTweet-json-download-button', this._$completed);
    this._$csvButton = $('#EveryTweet-csv-download-button', this._$completed);

    this._$beginButton.on('click', this.beginBot.bind(this));
  }

  beginBot() {
    window.scrollTo(0,0);
    this._$modalInner.html('');
    this._$status.appendTo(this._$modalInner);
    this.updateProgress();
    ElementRegistry.addListen(document.body, '.js-stream-item[data-item-type="tweet"]', this.parseTweet.bind(this));
    this._botInterval = setInterval(() => {
      window.scrollTo(0,document.body.scrollHeight);
      this.updateProgress();
    }, 1000);
    this._$haltButton.on('click', this.finished.bind(this));
  }

  parseTweet(element) {
    let tweetId = element.dataset.itemId;
    let datetime = element.querySelector('._timestamp').dataset.timeMs;
    let datetimeReadable = element.querySelector('.tweet-timestamp').dataset && element.querySelector('.tweet-timestamp').dataset.originalTitle || element.querySelector('.tweet-timestamp').title;
    let replyCount = element.querySelector('.ProfileTweet-action--reply > .ProfileTweet-actionCount').dataset.tweetStatCount;
    let retweetCount = element.querySelector('.ProfileTweet-action--retweet > .ProfileTweet-actionCount').dataset.tweetStatCount;
    let favoriteCount = element.querySelector('.ProfileTweet-action--favorite > .ProfileTweet-actionCount').dataset.tweetStatCount;
    let content = element.querySelector('.js-tweet-text-container').innerHTML;
    this._tweets.push({
      datetime,
      datetimeReadable,
      replyCount,
      retweetCount,
      favoriteCount,
      content
    });
    element.innerHTML = '';
  }

  updateProgress() {
    this._$tweetsCompleted.text(this._tweets.length);
    this._$totalTweets.text(this._totalTweets);
    this._$timeRemaining.text(PrettyMs((this._totalTweets - this._tweets.length)/20*1000, {compact: true, secDecimalDigits: 0}));
    this._$progressBar.css({width: (this._tweets.length / this._totalTweets * 100).toFixed(2) + '%'});

    if (this._tweets.length >= this._totalTweets) {
      this.finished();
    }
  }

  packageJson() {
    this._tweetsJson = this._tweetsJson || JSON.stringify(this._tweets);
    var blob = new Blob([this._tweetsJson], {type : 'application/json'});
    return blob;
  }

  packageCsv() {
    const items = this._tweets;
    const replacer = (key, value) => value === null ? '' : value;
    const header = Object.keys(items[0]);
    let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    csv = csv.join('\r\n');
    var blob = new Blob([csv], {type : 'application/json'});
    return blob;
  }

  finished() {
    clearInterval(this._botInterval);
    this._$modalInner.html('');
    this._$completed.appendTo(this._$modalInner);

    var jsonBlob = this.packageJson();
    var csvBlob = this.packageCsv();

    this._$jsonButton.on('click', () => {
      FileSaver.saveAs(jsonBlob, `${this._user}-tweets.json`);
    });

    this._$csvButton.on('click', () => {
      FileSaver.saveAs(csvBlob, `${this._user}-tweets.csv`);
    });
  }
}