export default class Router {
  constructor() {
    this._funcs = {};
  }

  register(actionName, fn) {
    if (!this._funcs[actionName]) {
      this._funcs[actionName] = [];
    }

    this._funcs[actionName].push(fn);
  }

  route() {
    return function(request, sender, response) {
      let action = request.action;
      let funcs = this._funcs[action];

      if (funcs) {
        funcs.forEach((fn) => {
          fn(request, sender, response);
        });
      }

    }.bind(this);
  }
}