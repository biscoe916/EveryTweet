import Router from './js/router';
import $ from 'jquery';
import utils from './utils';
import UrlParse from 'url-parse';
import Bot from './js/bot';



$(document).ready(function() {
  var location = UrlParse(window.location.href, true);
  if (location.pathname === '/search' && location.query.EveryTweet) {
    var bot = new Bot({user: location.query.q.split('from:')[1], tweetCount: location.query.EveryTweetCount});
    bot.getConfirmation();
  } else {
    let router = new Router();
    chrome.runtime.onMessage.addListener(router.route());

    router.register('requestConfirmation', (request, sender, response) => {
      if (confirm('Get all this users tweets?')) {
        response({user: utils.getUserName(), tweetCount: $('.ProfileNav-item--tweets .ProfileNav-value').attr('data-count')});
      }
    });
  }
});
