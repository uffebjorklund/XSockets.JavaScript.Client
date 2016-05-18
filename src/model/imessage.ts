enum messageType {
    text, binary
}
interface imessage {
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