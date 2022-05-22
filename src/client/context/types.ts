import React from "react";
import { Socket } from "socket.io-client";
import { Action } from ".";
import { ServerToClientEvents, ClientToServerEvents, User, GameState } from "../../shared/types";

export interface State {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    user: User | undefined;
    roomName: string | undefined;
    gameState: GameState;
    dispatch: React.Dispatch<Action>;
}