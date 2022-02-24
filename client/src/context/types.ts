import React from "react";
import { Socket } from "socket.io-client";
import { Action } from ".";

export interface State {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    gameState: GameState;
    isHost: boolean;
    dispatch: React.Dispatch<Action>;
}

export enum GameState {
    Idle = "idle",
    Describe = "describe",
    Vote = "vote",
}

export interface ServerToClientEvents {
    error: (message: string) => void;
    chatMessage: (message: string) => void;
    messages: (messages: string[]) => void;
    roomExists: (payload: { roomName: string; roomId: string; }) => void;
    roomCreated: (payload: { roomName: string; roomId: string; }) => void;
    roomJoined: (payload: { userId: string; userName: string; isHost: boolean }) => void;
    requestName: () => void;
    gif: (url: string | undefined) => void;
    gameState: (payload: { gameState: GameState }) => void;
    descriptions: (messages: string[]) => void;
}

export interface ClientToServerEvents {
    checkRoomExists: (roomName: string) => void;
    createRoom: (roomName: string) => void;
    joinRoom: (payload: { roomName: string, userName: string, userId?: string }) => void;
    chatMessage: (payload: { message: string; }) => void;
    requestGif: () => void;
    setGameState: (payload: { gameState: GameState; }) => void;
    addDescription: (message: string) => void;
}