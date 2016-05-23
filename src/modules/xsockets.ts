/**
 * Static info about the xsockets client, such as events and version.
 */
module xsockets {
    export var version = '6.0.0-rc1';
    export class events {
        static authfailed: string = '0';
        static init: string = '1';
        static open: string = '2';
        static close: string = '3';
        static error: string = '4';
        static subscribe: string = '5';
        static unsubscribe: string = '6';
        static ping: string = '7';
        static pong: string = '8';
    }
    /**
     * Will probably be removed in v6, not used rigth now.
     */
    export class storage {
        static set: string = 's1';
        static get: string = 's2';
        static clear: string = 's3';
        static remove: string = 's4';
    }

    export class utils {
        static guid() {
            var a, b;
            for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-');
            return b;
        }
    } 
}