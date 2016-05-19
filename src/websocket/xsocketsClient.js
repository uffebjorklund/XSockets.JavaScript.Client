/**
* XSockets.NET - WebSocket-client transport
*/
var xsocketsClient = (function () {
    /**
     * Ctor for transport, example new xsocketsClient('ws://somehost.com:80',['foo', 'bar']);
     * @param server - uri to server, example ws://somehost.com:80
     * @param controllers - array of controllers use at startup, example ['foo','bar']
     */
    function xsocketsClient(server, controllers) {
        if (controllers === void 0) { controllers = []; }
        this._autoReconnect = false;
        this._autoReconnectTimeout = 5000;
        this._readyState = WebSocket.CLOSED;
        this.onOpen = function (event) { };
        this.onAuthenticationFailed = function (event) { };
        this.onClose = function (event) { };
        this.onMessage = function (event) { };
        this.onError = function (event) { };
        this._parameters = {};
        //this._parameters = new Array<any>();
        this._persistentId = localStorage.getItem(server);
        this._server = server;
        this.subprotocol = "XSocketsNET";
        this._controllers = new Array();
        for (var c in controllers) {
            this._controllers.push(new controller(this, controllers[c].toLowerCase()));
        }
    }
    /**
     * Enables/disables the autoreconnect feature
     * @param enabled - sets the current state, default = true
     * @param timeout - timeout in ms, default = 5000
     */
    xsocketsClient.prototype.autoReconnect = function (enabled, timeout) {
        if (enabled === void 0) { enabled = true; }
        if (timeout === void 0) { timeout = 5000; }
        this._autoReconnect = enabled;
        this._autoReconnectTimeout = timeout;
    };
    //public setCleanSession(value: boolean) {
    //}
    /**
     * Set the parameters that you want to pass in with the connection.
     * Do this before calling open
     * @param params - parameters to pass in, example: {foo:'bar',baz:123}
     */
    xsocketsClient.prototype.setParameters = function (params) {
        this._parameters = params;
    };
    /**
     * Call before calling open
     * @param guid - sets the persistentid for the connection
     */
    xsocketsClient.prototype.setPersistentId = function (guid) {
        this._persistentId = guid;
        localStorage.setItem(this._server, this._persistentId);
    };
    /**
     * Opens the transport (socket) and setup all basic events (open, close, onmessage, onerror)
     */
    xsocketsClient.prototype.open = function () {
        var _this = this;
        var that = this;
        if (this.socket !== undefined && this.socket.readyState == WebSocket.OPEN)
            return;
        // TODO: build parameters to pass in...        
        this._parameters["persistentid"] = this._persistentId;
        this.socket = new WebSocket(this._server + this.querystring(), [this.subprotocol]);
        this.socket.binaryType = "arraybuffer";
        this.socket.onopen = function (event) {
            _this._readyState = WebSocket.OPEN;
            _this.onOpen(event);
            // Open all controllers
            for (var c in _this._controllers) {
                _this.sendtext(new message(_this._controllers[c].name, xsockets.events.init));
            }
        };
        this.socket.onclose = function (event) {
            _this.socket = undefined;
            //Fire close if it was ever opened
            if (_this._readyState == WebSocket.OPEN) {
                _this.onClose(event);
                //Close all controllers
                for (var c in _this._controllers) {
                    _this._controllers[c].close();
                }
            }
            _this._readyState = WebSocket.CLOSED;
            if (_this._autoReconnect) {
                setTimeout(function () { that.open(); }, _this._autoReconnectTimeout);
            }
            ;
        };
        this.socket.onmessage = function (event) {
            if (typeof event.data === "string") {
                // TextMessage                
                var d = JSON.parse(event.data);
                // TODO: if owin sends a fake ping respond with fake pong. Microsoft did not implement ping/pong following RFC6455
                if (d.T == xsockets.events.authfailed) {
                    _this.onAuthenticationFailed(d.D);
                    _this.close(false);
                    return;
                }
                var c = _this.controller(d.C, false);
                if (c == undefined) {
                    _this.onMessage(d);
                }
                else {
                    c.dispatchEvent(d);
                }
            }
            else if (typeof (event.data) === "object") {
                // BinaryMessage
                console.log('binary', event.data);
            }
        };
        this.socket.onerror = function (event) {
            _this.onError(event);
        };
    };
    /**
     * Close the transport (socket)
     * @param autoReconnect - if true the transport will try to reconnect, default = false
     */
    xsocketsClient.prototype.close = function (autoReconnect) {
        if (autoReconnect === void 0) { autoReconnect = false; }
        this._autoReconnect = autoReconnect;
        if (this.socket != undefined)
            this.socket.close();
    };
    /**
     * Returns the instance of a specific controller
     * @param name - the name of the controller to fetch
     * @param createNewInstanceIfMissing - if true a new instance will be created, default = true
     */
    xsocketsClient.prototype.controller = function (name, createNewInstanceIfMissing) {
        if (createNewInstanceIfMissing === void 0) { createNewInstanceIfMissing = true; }
        var instance = undefined;
        for (var c in this._controllers) {
            if (this._controllers[c].name === name.toLowerCase()) {
                instance = this._controllers[c];
                break;
            }
        }
        if (instance === undefined && createNewInstanceIfMissing) {
            instance = new controller(this, name.toLocaleLowerCase());
            this._controllers.push(instance);
            this.sendtext(new message(instance.name, xsockets.events.init));
        }
        return instance;
    };
    /**
     * Removes a controller from the transport
     * @param controller - controller instance to dispose
     */
    xsocketsClient.prototype.disposeController = function (controller) {
        var index = this._controllers.indexOf(controller, 0);
        if (index > -1) {
            this._controllers.splice(index, 1);
        }
    };
    xsocketsClient.prototype.sendtext = function (data) {
        if (this.socket != undefined) {
            this.socket.send(data);
        }
    };
    /**
     * Returns true if the socket is open
     */
    xsocketsClient.prototype.isConnected = function () {
        return this.socket !== undefined && this.socket.readyState === WebSocket.OPEN;
    };
    xsocketsClient.prototype.querystring = function () {
        var str = "?";
        for (var key in this._parameters) {
            str += key + '=' + encodeURIComponent(this._parameters[key]) + '&';
        }
        str = str.slice(0, str.length - 1);
        return str;
    };
    return xsocketsClient;
}());
//# sourceMappingURL=xsocketsClient.js.map