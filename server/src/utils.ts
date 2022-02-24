import axios from "axios";
import { Room, User } from "./types";

export const getRoomIndexFromName = (rooms: Room[], name: string) => {
    return rooms.findIndex((room) => room.name === name);
}

export const getUserIndexFromId = (users: User[], id: string) => {
    return users.findIndex((user) => user.id === id);
}

export const isRoomHost = (rooms: Room[], roomName: string, id: string) => {
    return rooms.find((r) => r.name === roomName)?.host === id;
}

export const generateGifUrl = (apikey: string, tag: string): Promise<string | undefined> => {
    return axios.get(`https://api.giphy.com/v1/gifs/random?api_key=${apikey}&tag=${tag}`)
        .then((res) => {
            return res.data.data.images.original.url;
        })
        .catch(() => undefined);
}