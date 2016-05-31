module xsockets {
    export enum messageType {
        text, binary
    }
    export interface imessage {
        C: string;
        T: string | number;
        D: string;
        Q: number;
        I: number;
        R: boolean;
        B: ArrayBuffer;

        messageType: messageType;

        createBuffer();
        extractMessage();

        toString();
    }
}