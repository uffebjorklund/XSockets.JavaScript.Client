/**
* Client-side controller(s) for full duplex communication with the server-controller(s)
*/
var controller = (function () {
    /**
     * Ctor for client side controller
     * @param itransport - the communication layer
     * @param _name - the name of the controller
     */
    function controller(itransport, _name) {
        this._isOpen = false;
        this._subscriptions = {};
        this.promises = {};
        /**
         * Will be fired when the controller is opened
         */
        this.onOpen = function (connInfo) { };
        /**
         * Will be fired when the controller is closed
         */
        this.onClose = function () { };
        /**
         * Will be fired when there is a message dispatched to the
         * controller and there is no promise/subscription for the topic
         */
        this.onMessage = function () { };
        this._transport = itransport;
        this.name = _name;
    }
    /**
     * Dispatches a message to the promise or subscription for the topic.
     * If no promise/subscription is found the onmessage event on the controller will be fired
     * @param message - the message object received from the server
     */
    controller.prototype.dispatchEvent = function (message) {
        switch (message.T) {
            case xsockets.events.open:
                this._isOpen = true;
                var clientInfo = JSON.parse(message.D);
                this._controllerId = clientInfo.CI;
                this._transport.setPersistentId(clientInfo.PI);
                this.onOpen(message.D);
                break;
            case xsockets.events.close:
                this._isOpen = false;
                this.onClose();
                break;
            default:
                if (!this.firePromise(message) && !this.fireSubscription(message)) {
                    this.onMessage(message);
                }
        }
    };
    /**
     * If there is a promise for the topic on the message it wil be fired.
     * Return true if a promise was fired, otherwise false
     * @param message - the received message
     */
    controller.prototype.firePromise = function (message) {
        //Check promises
        var cb = this.promises[message.T];
        if (cb !== undefined) {
            cb(JSON.parse(message.D));
            delete this.promises[message.T];
            return true;
        }
        return false;
    };
    /**
     * If there is a subscription for the topic on the message it wil be fired.
     * Return true if a subscription was fired, otherwise false
     * @param message - the received message
     */
    controller.prototype.fireSubscription = function (message) {
        //Check pub/sub and rpc
        var cb = this._subscriptions[message.T];
        if (cb !== undefined) {
            cb(JSON.parse(message.D));
            return true;
        }
        return false;
    };
    /**
     * Open up the controller server-side.
     *
     * If the transport/socket is open the controller will communicate to the server to open a instance of the server-side controller
     */
    controller.prototype.open = function () {
        if (this._transport.isConnected() && !this._isOpen) {
            this._transport.socket.send(new message(this.name, xsockets.events.init));
        }
    };
    /**
     * Close the controller both server-side and client-side (opitonal)
     * @param dispose - if true the client-side controller will be disposed
     */
    controller.prototype.close = function (dispose) {
        if (dispose === void 0) { dispose = false; }
        //if socket open... send close message
        if (this._transport.isConnected() && this._isOpen) {
            this._transport.socket.send(new message(this.name, xsockets.events.close));
        }
        this.onClose();
        if (dispose) {
            this._transport.disposeController(this);
        }
    };
    /**
     * Add a callback that will fire for a specific topic
     * @param topic - the topic to add a callback for
     * @param callback - the callback function to fire when the topic arrives
     */
    controller.prototype.on = function (topic, callback) {
        topic = topic.toLowerCase();
        if (typeof callback === 'function') {
            console.log(topic);
            this._subscriptions[topic] = callback;
        }
        if (typeof callback === 'undefined') {
            delete this._subscriptions[topic];
        }
    };
    /**
     * Removes a callback for a specific topic
     * @param topic - the topic to remove the callback for
     */
    controller.prototype.off = function (topic) {
        topic = topic.toLowerCase();
        delete this._subscriptions[topic];
    };
    /**
     * Call a method on the server-side controller
     * @param topic - the method to call
     * @param data - the serializable data to pass into the method
     */
    controller.prototype.invoke = function (topic, data) {
        topic = topic.toLowerCase();
        if (this._transport.isConnected()) {
            if (data === undefined)
                data = '';
            var m = new message(this.name, topic, data);
            this._transport.socket.send(m);
        }
        return new promise(this, topic);
    };
    /**
     * Send binary data to the XSockets controller
     * @param topic - topic/method to call
     * @param arrayBuffer - the binary data to send
     * @param data - metadata such as information about the binary data
     */
    controller.prototype.invokeBinary = function (topic, arrayBuffer, data) {
        if (data === void 0) { data = undefined; }
        topic = topic.toLowerCase();
        var bm = new binaryMessage(new message(topic, this.name, data), arrayBuffer);
        this._transport.socket.send(bm.buffer);
        return this;
    };
    /**
     * Creates a subscription on the server for the specific topic
     * @param topic - the topic to subscribe to
     * @param callback - the callback to fire when a message with the topic is published
     */
    controller.prototype.subscribe = function (topic, callback) {
        topic = topic.toLowerCase();
        this.on(topic, callback);
        if (this._transport.isConnected() && typeof callback === 'function') {
            var m = new message(this.name, xsockets.events.subscribe, {
                T: topic,
                A: false //cb ? true : false
            });
            this._transport.socket.send(m);
        }
    };
    /**
     * Remove the subscription from the server
     * @param topic - the topic to cancel the subscription for
     */
    controller.prototype.unsubscribe = function (topic) {
        topic = topic.toLowerCase();
        delete this._subscriptions[topic];
        if (this._transport.isConnected()) {
            var m = new message(this.name, xsockets.events.unsubscribe, {
                T: topic,
                A: false
            });
            this._transport.socket.send(m);
        }
    };
    /**
     * Publish a message for a specific topic.
     * @param topic - topic for publish message
     * @param data - data to publish
     */
    controller.prototype.publish = function (topic, data) {
        topic = topic.toLowerCase();
        this.invoke(topic, data);
    };
    return controller;
}());
//# sourceMappingURL=controller.js.map