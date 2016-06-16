module xsockets {
    export class message implements imessage {

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
        constructor(controller: string, topic: string | number, data: any = undefined, binary: ArrayBuffer = undefined) {
            this.C = controller;
            this.T = topic;
            this.B = binary;
            if (!xsockets.utils.isJson(data)) {//(data !== undefined && typeof (data) !== 'string') {
                this.D = JSON.stringify(data);
            }
            else {
                this.D = data;
            }
            if (this.B == undefined) {
                this.messageType = messageType.text;
            }
            else {
                this.messageType = messageType.binary;
            }
        }

        /**
         * Use this to create a binary message to send to the server
         * The object need to have the arraybuffer (B) set for this to work
         */
        public createBuffer() {
            var payload = this.toString();
            var header = new Uint8Array(this.longToByteArray(payload.length));
            return this.appendBuffer(this.appendBuffer(header, this.stringToBuffer(payload)), this.B);
        }

        /**
         * Extract a message from binary data received from the server
         */
        public extractMessage() {
            var ab2str = function (buf) {
                return String.fromCharCode.apply(null, new Uint16Array(buf));
            };
            var byteArrayToLong = function (byteArray) {
                var value = 0;
                for (var i = byteArray.byteLength - 1; i >= 0; i--) {
                    value = (value * 256) + byteArray[i];
                }
                return value;
            };
            var header = new Uint8Array(this.B, 0, 8);
            var payloadLength = byteArrayToLong(header);
            var offset = 8 + byteArrayToLong(header);
            var buffer = new Uint8Array(this.B, offset, this.B.byteLength - offset);
            var str = new Uint8Array(this.B, 8, payloadLength);
            var result = this.parse(ab2str(str), buffer);
            result.D = typeof result.D === "object" ? result.D : JSON.parse(result.D);

            return result;
        }

        private parse(text: string, binary: Uint8Array) {
            var data = JSON.parse(text);            
            return new message(data.C, data.T, data.D || JSON.stringify({}), binary);
        };

        /**
         * Return the string representation of the imessage
         */
        public toString() {
            return JSON.stringify({ C: this.C, D: this.D, T: this.T, Q: this.Q, R: this.R, I: this.I });
        }


        private appendBuffer(a, b) {
            var c = new Uint8Array(a.byteLength + b.byteLength);
            c.set(new Uint8Array(a), 0);
            c.set(new Uint8Array(b), a.byteLength);
            return c.buffer;
        }

        private stringToBuffer(str: string) {
            var i, len = str.length, arr = new Array(len);
            for (i = 0; i < len; i++) {
                arr[i] = str.charCodeAt(i) & 0xFF;
            }
            return new Uint8Array(arr).buffer;
        }

        private longToByteArray(size: number) {
            var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
            for (var index = 0; index < byteArray.length; index++) {
                var byte = size & 0xff;
                byteArray[index] = byte;
                size = (size - byte) / 256;
            }
            return byteArray;
        }
    }
}