module xsockets {
    export interface icontroller {
        name: string;

        open();
        close(dispose: boolean);

        // Events
        onOpen(connInfo: any);
        onClose();
        onMessage(ev: any);

        // RPC
        on(topic: string, callback: (data) => any);
        off(topic: string);
        invoke(topic: string, data: string | number | boolean | JSON);

        // BINARY
        invokeBinary(topic: string, arrayBuffer: ArrayBuffer, data: any);

        // PUB/SUB
        subscribe(topic: string, callback: (data) => any);
        publish(topic: string, data: string | number | boolean | JSON);
        unsubscribe(topic: string);

        dispatchEvent(message: message);

        // Getters/Setters for server-side properties/enums
        setProperty(name: string, value: string | number | boolean | JSON);
        getProperty(name: string, callback: (value: JSON) => any);
    }
}