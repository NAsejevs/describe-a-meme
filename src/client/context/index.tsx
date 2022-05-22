import React, { useReducer } from "react";
import { io } from "socket.io-client";
import { GameState, User } from "../../shared/types";
import { State } from "./types";

export const defaultState: State = {
    socket: io("ws://localhost:3001", {
        autoConnect: false,
    }),
    user: undefined,
    roomName: undefined,
    gameState: GameState.Idle,
    dispatch: () => undefined,
};

export type Action =
    | { type: ActionTypes.SET_USER, user: User }
    | { type: ActionTypes.SET_GAME_STATE, gameState: GameState }
    | { type: ActionTypes.SET_ROOM_NAME, roomName: string };

export enum ActionTypes {
    SET_USER = "SET_USER",
    SET_GAME_STATE = "SET_GAME_STATE",
    SET_ROOM_NAME = "SET_ROOM_NAME",
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "SET_USER":
            return { ...state, user: action.user };
        case "SET_GAME_STATE":
            return { ...state, gameState: action.gameState };
        case "SET_ROOM_NAME":
            return { ...state, roomName: action.roomName };
        default:
            return state;
    }
}

export const StateContext = React.createContext(defaultState);

export function ContextWrapper(props: { children?: React.ReactNode}) {
    const [state, dispatch] = useReducer(reducer, defaultState);

    return (
        <StateContext.Provider value={ {...state, dispatch} }>
            { props.children }
        </StateContext.Provider>
    );
}