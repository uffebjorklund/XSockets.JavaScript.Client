module xsockets {
    export interface isubscriptions {
        [topic: string]: (d) => any;
    }
}