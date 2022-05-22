import { Description, GameState, User, Vote } from "../../shared/types";

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