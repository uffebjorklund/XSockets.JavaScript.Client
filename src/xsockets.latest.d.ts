interface icontroller {
    name: string;
    open(): any;
    close(dispose: boolean): any;
    onOpen(connInfo: any): any;
    onClose(): any;
    onMessage(ev: any): any;
    on(topic: string, callback: (data) => any): any;
    invoke(topic: string, data: string | number | boolean | JSON): any;
    subscribe(topic: string, callback: (data) => any): any;
    publish(topic: string, data: string | number | boolean | JSON): any;
    unsubscribe(topic: string): any;
    dispatchEvent(message: message): any;
}
/**
* Client-side controller(s) for full duplex communication with the server-controller(s)
*/
declare class controller implements icontroller {
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
    onOpen: (connInfo: any) => void;
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
     * @param message - the message object received from the server
     */
    dispatchEvent(message: message): void;
    /**
     * If there is a promise for the topic on the message it wil be fired.
     * Return true if a promise was fired, otherwise false
     * @param message - the received message
     */
    private firePromise(message);
    /**
     * If there is a subscription for the topic on the message it wil be fired.
     * Return true if a subscription was fired, otherwise false
     * @param message - the received message
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
    publish(topic: string, data: string | number | boolean | JSON): void;
}
interface imessage {
    C: string;
    T: string | number;
    D: string;
    Q: number;
    I: number;
    R: boolean;
    toString(): any;
}
declare class message implements imessage {
    C: string;
    T: string | number;
    D: string;
    Q: number;
    I: number;
    R: boolean;
    /**
     * Ctor for message
     * @param controller - the controller name
     * @param topic - the name of the server-side method
     * @param data - the object received (or to send)
     */
    constructor(controller: string, topic: string | number, data?: any);
    /**
     * Return the string representation if the imessage
     */
    toString(): string;
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
    }
}
declare class promise {
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
interface isubscriptions {
    [topic: string]: (d) => any;
}
interface itransport {
    socket: WebSocket;
    open(): any;
    close(autoReconnect: boolean): any;
    autoReconnect(enabled: boolean, timeout: number): any;
    setPersistentId(guid: string): any;
    setParameters(params: any): any;
    onOpen(ev: Event): any;
    onAuthenticationFailed(ev: Event): any;
    onClose(ev: CloseEvent): any;
    onError(ev: ErrorEvent): any;
    onMessage(ev: MessageEvent): any;
    controller(name: string, createNewInstanceIfMissing: boolean): any;
    disposeController(controller: controller): any;
    isConnected(): any;
}
/**
* XSockets.NET - WebSocket-client transport
*/
declare class xsocketsClient implements itransport {
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
    setParameters(params: any): void;
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
    controller(name: string, createNewInstanceIfMissing?: boolean): any;
    /**
     * Removes a controller from the transport
     * @param controller - controller instance to dispose
     */
    disposeController(controller: controller): void;
    private sendtext(data);
    /**
     * Returns true if the socket is open
     */
    isConnected(): boolean;
    private querystring();
}
