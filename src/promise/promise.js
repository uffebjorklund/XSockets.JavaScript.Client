var promise = (function () {
    /**
     * Ctor for promise, that attaches the promise to a controller and a topic
     * @param controller - the controller instance that is communicating
     * @param name - the name of the method that expects to return a result
     */
    function promise(controller, name) {
        this._controller = controller;
        this._name = name;
    }
    /**
     * Adds a callback for a call the the server-side that is expected to return a result
     * @param fn
     */
    promise.prototype.then = function (fn) {
        this._controller.promises[this._name] = fn;
    };
    return promise;
}());
//# sourceMappingURL=promise.js.map