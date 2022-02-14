import React from "react";
import { io } from "socket.io-client";
import { Store } from "./types";

export const defaultStore: Store = {
    socket: io("ws://localhost:3001", {
        autoConnect: false,
    }),
};

export const StoreContext = React.createContext(defaultStore);