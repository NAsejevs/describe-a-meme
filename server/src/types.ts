export interface Room {
    id: number;
    name: string;
    messages: Array<string>;
    host?: string;
}

export interface User {
    id: string;
    name: string;
}