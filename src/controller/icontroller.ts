interface icontroller{
    name: string;

    open();
    close(dispose: boolean);

    // Events
    onOpen(connInfo:any);
    onClose();
    onMessage(ev:any);
    // RPC
    on(topic: string, callback: (data)=>any);
    invoke(topic: string, data: string | number | boolean | JSON);

    // BINARY
    invokeBinary(topic: string, arrayBuffer: ArrayBuffer, data:any);

    // PUB/SUB
    subscribe(topic: string, callback: (data) => any);
    publish(topic: string, data: string | number | boolean | JSON);
    unsubscribe(topic: string);

    dispatchEvent(message: message);
}