/**
 * Client-side controller(s) for full duplex communication with the server-controller(s)
 */
module xsockets {
    export class controller implements icontroller {
        public name: string;
        private _transport: itransport;
        private _isOpen: boolean = false;
        private _controllerId: string;
        private _subscriptions: isubscriptions = {};
        public promises: isubscriptions = {};

        /**
         * Ctor for client side controller
         * @param itransport - the communication layer
         * @param _name - the name of the controller
         */
        constructor(itransport: itransport, _name: string) {
            this._transport = itransport
            this.name = _name;
        }

        /**
         * Will be fired when the controller is opened
         */
        public onOpen: (connInfo: any) => void = function (connInfo) { };
        /**
         * Will be fired when the controller is closed
         */
        public onClose: () => void = function () { };
        /**
         * Will be fired when there is a message dispatched to the
         * controller and there is no promise/subscription for the topic
         */
        public onMessage: (d) => void = function () { };

        /**
         * Dispatches a message to the promise or subscription for the topic.
         * If no promise/subscription is found the onmessage event on the controller will be fired
         * @param message - the message object received from the server
         */
        public dispatchEvent(message: message) {

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
        }

        /**
         * If there is a promise for the topic on the message it wil be fired.
         * Return true if a promise was fired, otherwise false
         * @param message - the received message
         */
        private firePromise(message: message) {
            //Check promises
            var cb = this.promises[message.T];
            if (cb !== undefined) {
                if (message.messageType === messageType.text) {
                    cb(JSON.parse(message.D));
                }
                else {
                    cb(message.D);
                }
                delete this.promises[message.T]
                return true;
            }
            return false;
        }

        /**
         * If there is a subscription for the topic on the message it wil be fired.
         * Return true if a subscription was fired, otherwise false
         * @param message - the received message
         */
        private fireSubscription(message: message) {
            //Check pub/sub and rpc
            var cb = this._subscriptions[message.T];
            if (cb !== undefined) {
                if (message.messageType == messageType.text) {
                    cb(JSON.parse(message.D));
                }
                else {
                    cb({ binary: message.B, metadata: message.D });
                }
                return true;
            }
            return false;
        }

        /**
         * Open up the controller server-side.
         *
         * If the transport/socket is open the controller will communicate to the server to open a instance of the server-side controller
         */
        public open() {
            if (this._transport.isConnected() && !this._isOpen) {
                this._transport.socket.send(new message(this.name, xsockets.events.init));
            }
        }

        /**
         * Close the controller both server-side and client-side (opitonal)
         * @param dispose - if true the client-side controller will be disposed
         */
        public close(dispose: boolean = false) {
            //if socket open... send close message
            if (this._transport.isConnected() && this._isOpen) {

                this._transport.socket.send(new message(this.name, xsockets.events.close));
            }
            this.onClose();
            if (dispose) {
                this._transport.disposeController(this);
            }
        }

        /**
         * Add a callback that will fire for a specific topic
         * @param topic - the topic to add a callback for
         * @param callback - the callback function to fire when the topic arrives
         */
        public on(topic: string, callback: (data) => any) {
            topic = topic.toLowerCase();
            if (typeof callback === 'function') {
                this._subscriptions[topic] = callback;
            }
            if (typeof callback === 'undefined') {
                delete this._subscriptions[topic];
            }
        }

        /**
         * Removes a callback for a specific topic
         * @param topic - the topic to remove the callback for
         */
        public off(topic: string) {
            topic = topic.toLowerCase();
            delete this._subscriptions[topic];
        }

        /**
         * Call a method on the server-side controller
         * @param topic - the method to call
         * @param data - the serializable data to pass into the method
         */
        public invoke(topic: string, data: string | number | boolean | JSON) {
            topic = topic.toLowerCase();

            if (this._transport.isConnected()) {
                if (data === undefined) data = '';
                var m = new message(this.name, topic, data);
                this._transport.socket.send(m);
            }
            return new promise(this, topic);
        }

        /**
         * Send binary data to the XSockets controller
         * @param topic - topic/method to call
         * @param arrayBuffer - the binary data to send
         * @param data - metadata such as information about the binary data
         */
        public invokeBinary(topic: string, arrayBuffer: ArrayBuffer, data: any = undefined) {
            topic = topic.toLowerCase();
            var bm = new message(this.name, topic, data, arrayBuffer);
            this._transport.socket.send(bm.createBuffer());
            return this;
        }

        /**
         * Creates a subscription on the server for the specific topic
         * @param topic - the topic to subscribe to
         * @param callback - the callback to fire when a message with the topic is published
         */
        public subscribe(topic: string, callback: (data) => any) {
            topic = topic.toLowerCase();
            this.on(topic, callback);

            if (this._transport.isConnected() && typeof callback === 'function') {

                var m = new message(this.name, xsockets.events.subscribe, {
                    T: topic,
                    A: false//cb ? true : false
                });
                this._transport.socket.send(m);
            }
        }

        /**
         * Remove the subscription from the server
         * @param topic - the topic to cancel the subscription for
         */
        public unsubscribe(topic: string) {
            topic = topic.toLowerCase();
            delete this._subscriptions[topic];
            if (this._transport.isConnected()) {
                var m = new message(this.name, xsockets.events.unsubscribe, {
                    T: topic,
                    A: false
                });
                this._transport.socket.send(m);
            }
        }

        /**
         * Publish a message for a specific topic.
         * @param topic - topic for publish message
         * @param data - data to publish
         */
        public publish(topic: string, data: string | number | boolean | JSON) {
            topic = topic.toLowerCase();
            this.invoke(topic, data);
        }

        public setProperty(name: string, value: string | number | boolean | JSON) {
            this.invoke('set_' + name, value);
        }

        public getProperty(name: string, callback: (value: JSON) => any) {
            var that = this;
            this.on('get_' + name, function (d) {
                that.off('get_' + name);
                callback(d);
            });
            this.invoke('get_' + name, undefined);
        }
    }
}