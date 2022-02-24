import React, { useReducer } from "react";
import { io } from "socket.io-client";
import { GameState, State } from "./types";

export const defaultState: State = {
    socket: io("ws://localhost:3001", {
        autoConnect: false,
    }),
    gameState: GameState.Idle,
    isHost: false,
    dispatch: () => undefined,
};

export type Action =
    | { type: ActionTypes.SET_IS_HOST, payload: boolean }
    | { type: ActionTypes.SET_GAME_STATE, payload: GameState };

export enum ActionTypes {
    SET_IS_HOST = "SET_IS_HOST",
    SET_GAME_STATE = "SET_GAME_STATE",
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "SET_IS_HOST":
            return { ...state, isHost: action.payload };
        case "SET_GAME_STATE":
            return { ...state, gameState: action.payload };
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