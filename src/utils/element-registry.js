/**
 * Uses the MutationObserver API to react to changes in the DOM.
 * Drive makes a lot of changes to the DOM as the result of XHRs,
 * so this ElementRegistry object provides a unified means of
 * listening for and reacting to specific changes.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
 */

var $ = require('jquery');

var ElementRegistry = {};
var registeredElements = {};

/**
 * Adds a MutationObserver for the provided elements and executes the callback
 *
 * @param  {Element}  Parent element of the target element
 * @param  {String}   Selector string for the target element
 * @param  {Function} Function to call once the target element is available
 * @param  {Object}   Optional parameters
 */
ElementRegistry.addListen = function(parent, selector, callback, options) {
  $(document).ready(function elementRegistryReady() {
    var opts = options || {};

    if (!registeredElements.hasOwnProperty(selector)) {
      registeredElements[selector] = [];
    }

    // Check if there are elements there already
    if (!opts.justNew) {
      $(selector, parent).each(function elementRegistryFirstMatchCallback(index, element) {
        if (!opts.filter || (opts.filter && opts.filter(element))) {
          registeredElements[selector].push(element);
          callback(element);
        }
      });
    }

    if (!opts.once || registeredElements[selector].length === 0) {
      addedObserver(parent, selector, function addedObserverCallback(element, observer) {
        if (!opts.filter || (opts.filter && opts.filter(element))) {
          registeredElements[selector].push(element);
          callback(element);
          if (opts.once) {
            observer.disconnect();
          }
        }
      });
    }
  });
};

/**
 * Performs the actual MutationObserver instantiation
 *
 * @param  {Element}  Parent element of the target element
 * @param  {String}   Selector string for the target element
 * @param  {Function} Function to call once the target element is available
 */
function addedObserver(parent, selector, callback) {
  /*eslint-disable */
  MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  /*eslint-enable */
  var observer = new MutationObserver(function MutationObserverCallback(mutations, obs) {
    mutations.forEach(function MutationLoopCallback(mutation) {
      var node;
      for (var i = 0, len = mutation.addedNodes.length; i < len; ++i) {
        node = mutation.addedNodes[i];
        if ($(node).is(selector)) {
          callback(node, obs);
        }
      }
    });
  });

  observer.observe(parent, { subtree: true, childList: true });
}

module.exports = ElementRegistry;