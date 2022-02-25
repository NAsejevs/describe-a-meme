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

export interface SocketData {
    user: User;
}

export enum GameState {
    Idle = "idle",
    Describe = "describe",
    Vote = "vote",
    Review = "review",
}

export interface Room {
    id: string;
    name: string;
    users: User[];
    messages: string[];
    gameState: GameState;
    descriptions: Description[];
    describeTime: number;
    describingTimeout?: ReturnType<typeof setTimeout>;
    votes: Vote[],
    votingTime: number;
    votingTimeout?: ReturnType<typeof setTimeout>;
    reviewTime: number;
    reviewTimeout?: ReturnType<typeof setTimeout>;
    gifUrl?: string;
    host?: string;
}

export interface User {
    id: string;
    name: string;
    roomName: string;
}

export interface Description {
    userId: string;
    text: string;
}

export interface Vote {
    userId: string;
    descriptionUserId: string;
}