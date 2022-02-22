export interface Room {
    id: string;
    name: string;
    users: User[];
    messages: Array<string>;
    host?: string;
}

export interface User {
    id: string;
    name: string;
    room: string;
}