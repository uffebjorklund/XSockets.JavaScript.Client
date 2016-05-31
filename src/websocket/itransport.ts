module xsockets {
    export interface itransport {
        socket: WebSocket;
        open();
        close(autoReconnect: boolean);

        autoReconnect(enabled: boolean, timeout: number);
        //setCleanSession(value: boolean);
        setPersistentId(guid: string);
        setParameters(params: any);

        onOpen(ev: Event);
        onAuthenticationFailed(ev: Event);
        onClose(ev: CloseEvent);
        onError(ev: ErrorEvent);

        // Will only fire when there is no controller to use
        onMessage(ev: MessageEvent);

        controller(name: string, createNewInstanceIfMissing: boolean);
        disposeController(controller: controller);
        isConnected();
    }
}