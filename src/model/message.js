var message = (function () {
    /**
     * Ctor for message
     * @param controller - the controller name
     * @param topic - the name of the server-side method
     * @param data - the object received (or to send)
     */
    function message(controller, topic, data) {
        if (data === void 0) { data = undefined; }
        this.C = controller;
        this.T = topic;
        if (data !== undefined)
            this.D = JSON.stringify(data);
    }
    /**
     * Return the string representation if the imessage
     */
    message.prototype.toString = function () {
        return JSON.stringify(this);
    };
    return message;
}());
//# sourceMappingURL=message.js.map