module xsockets {
    export interface icontroller {
        name: string;

        open() : void;
        close(dispose: boolean) : void;

        // Events
        onOpen(connInfo: JSON): void;
        onClose(): void;
        onMessage(ev: any): void;

        // RPC
        on(topic: string, callback: (data) => any): void;
        off(topic: string): void;
        invoke(topic: string, data: string | number | boolean | JSON) : promise;

        // BINARY
        invokeBinary(topic: string, arrayBuffer: ArrayBuffer, data: any): icontroller;

        // PUB/SUB
        subscribe(topic: string, callback: (data) => any): void;
        publish(topic: string, data: string | number | boolean | JSON): promise;
        unsubscribe(topic: string): void;

        // BINARY
        publishBinary(topic: string, arrayBuffer: ArrayBuffer, data: any): icontroller;


        dispatchEvent(message: imessage): void;

        // Getters/Setters for server-side properties/enums
        setProperty(name: string, value: string | number | boolean | JSON): void;
        getProperty(name: string, callback: (value: JSON) => any): void;
    }
}