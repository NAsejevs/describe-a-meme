import { Socket } from "socket.io-client";

export interface Store {
    socket: Socket;
}