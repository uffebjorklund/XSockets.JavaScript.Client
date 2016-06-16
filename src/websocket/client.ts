/**
 * XSockets.NET - WebSocket-client transport
 */
module xsockets {
    export class client implements itransport {
        private _server: string;
        private _autoReconnect: boolean = false;
        private _autoReconnectTimeout: number = 5000;
        private _persistentId: string;
        private _readyState: number = WebSocket.CLOSED;
        public socket: WebSocket;
        public subprotocol: string;
        private _controllers: Array<xsockets.controller>;
        private _parameters: Object;

        /**
         * Ctor for transport, example new xsocketsClient('ws://somehost.com:80',['foo', 'bar']);
         * @param server - uri to server, example ws://somehost.com:80
         * @param controllers - array of controllers use at startup, example ['foo','bar']
         */
        constructor(server: string, controllers: string[] = []) {
            this._parameters = {};
            this._persistentId = localStorage.getItem(server);
            
            this._server = server;
            this.subprotocol = "XSocketsNET";
            this._controllers = new Array<xsockets.controller>();
            for (var c in controllers) {
                this._controllers.push(new xsockets.controller(this, controllers[c].toLowerCase()));
            }
        }

        public onOpen: (ev: Event) => void = function (event: Event) { };
        public onAuthenticationFailed: (ev: any) => void = function (event: any) { };
        public onClose: (ev: CloseEvent) => void = function (event: CloseEvent) { };
        public onMessage: (ev: MessageEvent) => void = function (event: MessageEvent) { };
        public onError: (ev: ErrorEvent) => void = function (event: ErrorEvent) { };

        /**
         * Enables/disables the autoreconnect feature
         * @param enabled - sets the current state, default = true
         * @param timeout - timeout in ms, default = 5000
         */
        autoReconnect(enabled: boolean = true, timeout: number = 5000) {
            this._autoReconnect = enabled;
            this._autoReconnectTimeout = timeout;
        }
        
        /**
         * Set the parameters that you want to pass in with the connection.
         * Do this before calling open
         * @param params - parameters to pass in, example: {foo:'bar',baz:123}
         */
        public setParameters(params: any) {
            this._parameters = params;
        }

        /**
         * Call before calling open
         * @param guid - sets the persistentid for the connection
         */
        public setPersistentId(guid: string) {
            this._persistentId = guid;
            localStorage.setItem(this._server, this._persistentId);
        }

        /**
         * Opens the transport (socket) and setup all basic events (open, close, onmessage, onerror)
         */
        public open() {
            var that = this;

            if (this._persistentId)
                this._parameters["persistentid"] = this._persistentId;

            if (this.socket !== undefined && this.socket.readyState == WebSocket.OPEN)
                return;
            
            this.socket = new WebSocket(this._server + this.querystring(), [this.subprotocol]);
            this.socket.binaryType = "arraybuffer";
            this.socket.onopen = (event: Event) => {
                this._readyState = WebSocket.OPEN;
                this.onOpen(event);
                // Open all controllers
                for (var c in this._controllers) {
                    this.sendtext(new message(this._controllers[c].name, xsockets.events.init));
                }
            };
            this.socket.onclose = (event: CloseEvent) => {
                this.socket = undefined;
                //Fire close if it was ever opened
                if (this._readyState == WebSocket.OPEN) {
                    this.onClose(event);
                    //Close all controllers
                    for (var c in this._controllers) {
                        this._controllers[c].close();
                    }
                }
                this._readyState = WebSocket.CLOSED;
                if (this._autoReconnect) { setTimeout(function () { that.open(); }, this._autoReconnectTimeout); };
            };
            this.socket.onmessage = (event: MessageEvent) => {

                if (typeof event.data === "string") {
                    // TextMessage                
                    var d = JSON.parse(event.data);
                    // TODO: if owin sends a fake ping respond with fake pong. Microsoft did not implement ping/pong following RFC6455

                    var m = new message(d.C, d.T, d.D, undefined);

                    if (m.T === xsockets.events.open) {
                        this.setPersistentId(JSON.parse(m.D).PI);
                    }
                    if (m.T === xsockets.events.error) {
                        this.onError(d);
                        return;
                    }

                    if (m.T === xsockets.events.authfailed) {
                        this.onAuthenticationFailed(m.D);
                        this.close(false);
                        return;
                    }

                    var c = this.controller(m.C, false) as xsockets.controller;
                    if (c == undefined) {
                        this.onMessage(d);
                    }
                    else {
                        c.dispatchEvent(m);
                    }
                }
                else if (typeof (event.data) === "object") {
                    // BinaryMessage                
                    var bm = new message("", "", "", event.data);
                    var bd = bm.extractMessage();
                    var c = this.controller(bd.C, false) as xsockets.controller;
                    if (c == undefined) {
                        this.onMessage(event.data);
                    }
                    else {
                        c.dispatchEvent(bd);
                    }
                }

            };
            this.socket.onerror = (event: ErrorEvent) => {
                this.onError(event);
            };
        }

        /**
         * Close the transport (socket)
         * @param autoReconnect - if true the transport will try to reconnect, default = false
         */
        public close(autoReconnect: boolean = false) {
            this._autoReconnect = autoReconnect;

            if (this.socket != undefined)
                this.socket.close();
        }

        /**
         * Returns the instance of a specific controller
         * @param name - the name of the controller to fetch
         * @param createNewInstanceIfMissing - if true a new instance will be created, default = true
         */
        public controller(name: string, createNewInstanceIfMissing: boolean = true) {
            var instance = undefined;
            for (var c in this._controllers) {
                if (this._controllers[c].name === name.toLowerCase()) {
                    instance = this._controllers[c];
                    break;
                }
            }
            if (instance === undefined && createNewInstanceIfMissing) {
                instance = new xsockets.controller(this, name.toLocaleLowerCase());
                this._controllers.push(instance);
                this.sendtext(new message(instance.name, xsockets.events.init));
            }
            return instance;
        }

        /**
         * Removes a controller from the transport
         * @param controller - controller instance to dispose
         */
        public disposeController(controller: xsockets.controller) {
            var index = this._controllers.indexOf(controller, 0);
            if (index > -1) {
                this._controllers.splice(index, 1);
            }
        }

        private sendtext(data: message) {
            if (this.socket != undefined) {
                this.socket.send(data);
            }
        }

        /**
         * Returns true if the socket is open
         */
        public isConnected() {
            return this.socket !== undefined && this.socket.readyState === WebSocket.OPEN;
        }

        private querystring() {
            var str = "?";
            for (var key in this._parameters) {
                str += key + '=' + encodeURIComponent(this._parameters[key]) + '&';
            }
            str = str.slice(0, str.length - 1);
            
            return str;
        }
    }
}