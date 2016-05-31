module xsockets {
    export class promise {
        private _controller: xsockets.controller;
        private _name: string;

        /**
         * Adds a callback for a call the the server-side that is expected to return a result
         * @param fn
         */
        public then(fn: (d) => any) {
            this._controller.promises[this._name] = fn;
        }

        /**
         * Ctor for promise, that attaches the promise to a controller and a topic
         * @param controller - the controller instance that is communicating 
         * @param name - the name of the method that expects to return a result
         */
        constructor(controller: xsockets.controller, name: string) {
            this._controller = controller;
            this._name = name;
        }
    }
}