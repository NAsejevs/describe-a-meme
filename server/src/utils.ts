import { Room, User } from "./types";

export const getRoomIndexFromName = (rooms: Room[], name: string) => {
    return rooms.findIndex((room) => room.name === name);
}

export const getUserIndexFromId = (users: User[], id: string) => {
    return users.findIndex((user) => user.id === id);
}

export const isRoomHost = (rooms: Room[], room: Room, id: string) => {
    return rooms.find((r) => r === room)?.host === id;
}