/**
* Static info about the xsockets client, such as events and version.
*/
var xsockets;
(function (xsockets) {
    xsockets.version = '6.0.0-alpha2';
    var events = (function () {
        function events() {
        }
        events.authfailed = '0';
        events.init = '1';
        events.open = '2';
        events.close = '3';
        events.error = '4';
        events.subscribe = '5';
        events.unsubscribe = '6';
        events.ping = '7';
        events.pong = '8';
        return events;
    }());
    xsockets.events = events;
    /**
     * Will probably be removed in v6, not used rigth now.
     */
    var storage = (function () {
        function storage() {
        }
        storage.set = 's1';
        storage.get = 's2';
        storage.clear = 's3';
        storage.remove = 's4';
        return storage;
    }());
    xsockets.storage = storage;
    var utils = (function () {
        function utils() {
        }
        utils.guid = function () {
            var a, b;
            for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-')
                ;
            return b;
        };
        return utils;
    }());
    xsockets.utils = utils;
})(xsockets || (xsockets = {}));
//# sourceMappingURL=xsockets.js.map