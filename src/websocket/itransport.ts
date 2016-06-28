module xsockets {
    export interface itransport {
        socket: WebSocket;
        open():void;
        close(autoReconnect: boolean):void;

        autoReconnect(enabled: boolean, timeout: number):void;
        //setCleanSession(value: boolean);
        setPersistentId(guid: string):void;
        setParameters(params: JSON):void;

        onOpen(ev: Event):void;
        onAuthenticationFailed(ev: Event):void;
        onClose(ev: CloseEvent):void;
        onError(ev: ErrorEvent):void;

        // Will only fire when there is no controller to use.
        onMessage(ev: MessageEvent):void;

        controller(name: string, createNewInstanceIfMissing: boolean):icontroller;
        disposeController(controller: icontroller):void;
        isConnected():boolean;
    }
}