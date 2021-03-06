declare module xsockets {
    interface icontroller {
        name: string;
        open(): void;
        close(dispose: boolean): void;
        onOpen(connInfo: JSON): void;
        onClose(): void;
        onMessage(ev: any): void;
        on(topic: string, callback: (data) => any): void;
        off(topic: string): void;
        invoke(topic: string, data: string | number | boolean | JSON): promise;
        invokeBinary(topic: string, arrayBuffer: ArrayBuffer, data: any): icontroller;
        subscribe(topic: string, callback: (data) => any): void;
        publish(topic: string, data: string | number | boolean | JSON): promise;
        unsubscribe(topic: string): void;
        publishBinary(topic: string, arrayBuffer: ArrayBuffer, data: any): icontroller;
        dispatchEvent(message: imessage): void;
        setProperty(name: string, value: string | number | boolean | JSON): void;
        getProperty(name: string, callback: (value: JSON) => any): void;
    }
}
/**
* Client-side controller(s) for full duplex communication with the server-controller(s)
*/
declare module xsockets {
    class controller implements icontroller {
        name: string;
        private _transport;
        private _isOpen;
        private _controllerId;
        private _subscriptions;
        promises: isubscriptions;
        /**
         * Ctor for client side controller
         * @param itransport - the communication layer
         * @param _name - the name of the controller
         */
        constructor(itransport: itransport, _name: string);
        /**
         * Will be fired when the controller is opened
         */
        onOpen: (connInfo: JSON) => void;
        /**
         * Will be fired when the controller is closed
         */
        onClose: () => void;
        /**
         * Will be fired when there is a message dispatched to the
         * controller and there is no promise/subscription for the topic
         */
        onMessage: (d) => void;
        /**
         * Dispatches a message to the promise or subscription for the topic.
         * If no promise/subscription is found the onmessage event on the controller will be fired
         * @param message - the imessage object received from the server
         */
        dispatchEvent(message: imessage): void;
        /**
         * If there is a promise for the topic on the message it wil be fired.
         * Return true if a promise was fired, otherwise false
         * @param message - the received imessage
         */
        private firePromise(message);
        /**
         * If there is a subscription for the topic on the message it wil be fired.
         * Return true if a subscription was fired, otherwise false
         * @param message - the received imessage
         */
        private fireSubscription(message);
        /**
         * Open up the controller server-side.
         *
         * If the transport/socket is open the controller will communicate to the server to open a instance of the server-side controller
         */
        open(): void;
        /**
         * Close the controller both server-side and client-side (opitonal)
         * @param dispose - if true the client-side controller will be disposed
         */
        close(dispose?: boolean): void;
        /**
         * Add a callback that will fire for a specific topic
         * @param topic - the topic to add a callback for
         * @param callback - the callback function to fire when the topic arrives
         */
        on(topic: string, callback: (data) => any): void;
        /**
         * Removes a callback for a specific topic
         * @param topic - the topic to remove the callback for
         */
        off(topic: string): void;
        /**
         * Call a method on the server-side controller
         * @param topic - the method to call
         * @param data - the serializable data to pass into the method
         */
        invoke(topic: string, data: string | number | boolean | JSON): promise;
        /**
         * Send binary data to the XSockets controller
         * @param topic - topic/method to call
         * @param arrayBuffer - the binary data to send
         * @param data - metadata such as information about the binary data
         */
        invokeBinary(topic: string, arrayBuffer: ArrayBuffer, data?: any): icontroller;
        /**
         * Send binary data to the XSockets controller
         * @param topic - topic/method to call
         * @param arrayBuffer - the binary data to send
         * @param data - metadata such as information about the binary data
         */
        publishBinary(topic: string, arrayBuffer: ArrayBuffer, data?: any): icontroller;
        /**
         * Creates a subscription on the server for the specific topic
         * @param topic - the topic to subscribe to
         * @param callback - the callback to fire when a message with the topic is published
         */
        subscribe(topic: string, callback: (data) => any): void;
        /**
         * Remove the subscription from the server
         * @param topic - the topic to cancel the subscription for
         */
        unsubscribe(topic: string): void;
        /**
         * Publish a message for a specific topic.
         * @param topic - topic for publish message
         * @param data - data to publish
         */
        publish(topic: string, data: string | number | boolean | JSON): promise;
        setProperty(name: string, value: string | number | boolean | JSON): promise;
        getProperty(name: string, callback: (value: JSON) => any): promise;
    }
}
declare module xsockets {
    enum messageType {
        text = 0,
        binary = 1,
    }
    interface imessage {
        C: string;
        T: string | number;
        D: string;
        Q: number;
        I: number;
        R: boolean;
        B: ArrayBuffer;
        messageType: messageType;
        createBuffer(): ArrayBuffer;
        extractMessage(): imessage;
        toString(): string;
    }
}
declare module xsockets {
    class message implements imessage {
        C: string;
        T: string | number;
        D: string;
        Q: number;
        I: number;
        R: boolean;
        B: ArrayBuffer;
        messageType: messageType;
        /**
         * Ctor for message
         * @param controller - the controller name
         * @param topic - the name of the server-side method
         * @param data - the object received (or to send)
         */
        constructor(controller: string, topic: string | number, data?: any, binary?: ArrayBuffer);
        /**
         * Use this to create a binary message to send to the server
         * The object need to have the arraybuffer (B) set for this to work
         */
        createBuffer(): ArrayBuffer;
        /**
         * Extract a message from binary data received from the server
         */
        extractMessage(): imessage;
        private parse(text, binary);
        /**
         * Return the string representation of the imessage
         */
        toString(): string;
        private appendBuffer(a, b);
        private stringToBuffer(str);
        private longToByteArray(size);
    }
}
/**
* Static info about the xsockets client, such as events and version.
*/
declare module xsockets {
    var version: string;
    class events {
        static authfailed: string;
        static init: string;
        static open: string;
        static close: string;
        static error: string;
        static subscribe: string;
        static unsubscribe: string;
        static ping: string;
        static pong: string;
    }
    /**
     * Will probably be removed in v6, not used rigth now.
     */
    class storage {
        static set: string;
        static get: string;
        static clear: string;
        static remove: string;
    }
    class utils {
        static guid(): any;
        static isJson(str: any): boolean;
    }
}
declare module xsockets {
    class promise {
        private _controller;
        private _name;
        /**
         * Adds a callback for a call the the server-side that is expected to return a result
         * @param fn
         */
        then(fn: (d) => any): void;
        /**
         * Ctor for promise, that attaches the promise to a controller and a topic
         * @param controller - the controller instance that is communicating
         * @param name - the name of the method that expects to return a result
         */
        constructor(controller: controller, name: string);
    }
}
declare module xsockets {
    interface isubscriptions {
        [topic: string]: (d) => any;
    }
}
declare module xsockets {
    interface itransport {
        socket: WebSocket;
        open(): void;
        close(autoReconnect: boolean): void;
        autoReconnect(enabled: boolean, timeout: number): void;
        setPersistentId(guid: string): void;
        setParameters(params: JSON): void;
        onOpen(ev: Event): void;
        onAuthenticationFailed(ev: Event): void;
        onClose(ev: CloseEvent): void;
        onError(ev: ErrorEvent): void;
        onMessage(ev: MessageEvent): void;
        controller(name: string, createNewInstanceIfMissing: boolean): icontroller;
        disposeController(controller: icontroller): void;
        isConnected(): boolean;
    }
}
/**
* XSockets.NET - WebSocket-client transport
*/
declare module xsockets {
    class client implements itransport {
        private _server;
        private _autoReconnect;
        private _autoReconnectTimeout;
        private _persistentId;
        private _readyState;
        socket: WebSocket;
        subprotocol: string;
        private _controllers;
        private _parameters;
        /**
         * Ctor for transport, example new xsocketsClient('ws://somehost.com:80',['foo', 'bar']);
         * @param server - uri to server, example ws://somehost.com:80
         * @param controllers - array of controllers use at startup, example ['foo','bar']
         */
        constructor(server: string, controllers?: string[]);
        onOpen: (ev: Event) => void;
        onAuthenticationFailed: (ev: any) => void;
        onClose: (ev: CloseEvent) => void;
        onMessage: (ev: MessageEvent) => void;
        onError: (ev: ErrorEvent) => void;
        /**
         * Enables/disables the autoreconnect feature
         * @param enabled - sets the current state, default = true
         * @param timeout - timeout in ms, default = 5000
         */
        autoReconnect(enabled?: boolean, timeout?: number): void;
        /**
         * Set the parameters that you want to pass in with the connection.
         * Do this before calling open
         * @param params - parameters to pass in, example: {foo:'bar',baz:123}
         */
        setParameters(params: JSON): void;
        /**
         * Call before calling open
         * @param guid - sets the persistentid for the connection
         */
        setPersistentId(guid: string): void;
        /**
         * Opens the transport (socket) and setup all basic events (open, close, onmessage, onerror)
         */
        open(): void;
        /**
         * Close the transport (socket)
         * @param autoReconnect - if true the transport will try to reconnect, default = false
         */
        close(autoReconnect?: boolean): void;
        /**
         * Returns the instance of a specific controller
         * @param name - the name of the controller to fetch
         * @param createNewInstanceIfMissing - if true a new instance will be created, default = true
         */
        controller(name: string, createNewInstanceIfMissing?: boolean): icontroller;
        /**
         * Removes a controller from the transport
         * @param controller - controller instance to dispose
         */
        disposeController(controller: icontroller): void;
        private sendtext(data);
        /**
         * Returns true if the socket is open
         */
        isConnected(): boolean;
        private querystring();
    }
}
