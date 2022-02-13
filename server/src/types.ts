export interface Room {
    id: number;
    name: string;
    messages: Array<string>;
}

export interface User {
    id: string;
    name: string;
}