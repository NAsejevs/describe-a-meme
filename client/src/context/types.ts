import React from "react";
import { Socket } from "socket.io-client";
import { Action } from ".";

export interface State {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    user: User | undefined;
    roomName: string | undefined;
    gameState: GameState;
    dispatch: React.Dispatch<Action>;
}

export enum GameState {
    Idle = "idle",
    Describe = "describe",
    Vote = "vote",
    Review = "review",
}

export interface ServerToClientEvents {
    error: (payload: { code: number; message: string; }) => void;
    chatMessage: (message: string) => void;
    messages: (messages: string[]) => void;
    roomExists: (payload: { roomName: string; roomId: string; }) => void;
    roomCreated: (payload: { roomName: string; roomId: string; }) => void;
    roomJoined: (payload: { userId: string; userName: string; isHost: boolean }) => void;
    requestName: () => void;
    gif: (url: string | undefined) => void;
    gameState: (payload: { gameState: GameState }) => void;
    descriptions: (descriptions: Description[]) => void;
    votes: (votes: Vote[]) => void;
}

export interface ClientToServerEvents {
    checkRoomExists: (roomName: string) => void;
    createRoom: (roomName: string) => void;
    joinRoom: (payload: { roomName: string, userName: string, userId?: string }) => void;
    chatMessage: (payload: { message: string; }) => void;
    requestGif: () => void;
    setGameState: (payload: { gameState: GameState; }) => void;
    addDescription: (message: string) => void;
    vote: (payload: { descriptionUserId: string; }) => void;
}

export interface User {
    id: string;
    name: string;
    isHost: boolean;
}

export interface Description {
    userId: string;
    text: string;
}

export interface Vote {
    userId: string;
    descriptionUserId: string;
}
