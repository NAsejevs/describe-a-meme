import { createServer } from "http";
import axios from "axios";
import { Server } from "socket.io";
import { getRoomIndexFromName, getUserIndexFromId, isRoomHost } from "./utils";
import { Room , User } from "./types";
import crypto from "crypto";

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});

const apiKey = "dkTRN5XKu4syueQPy7pM4TLkpPVEHk3O";

const rooms: Array<Room> = [];

io.on("connection", (socket) => {
    socket.on("disconnect", () => {
        if (!socket.data.user) return;

        const { room, name } = socket.data.user;
        const roomIndex = getRoomIndexFromName(rooms, room);

        if (roomIndex !== -1) {
            const parsedMessage = `${name} has left the room.`;
            rooms[roomIndex].messages.push(parsedMessage);
            io.to(socket.data.room).emit("chatMessage", parsedMessage);
        }
    });

    socket.on("createRoom", (room) => {
        const roomIndex = getRoomIndexFromName(rooms, room);

        if (roomIndex === -1) {
            const newRoom = {
                id: crypto.randomBytes(4).toString("hex"),
                name: room,
                users: [],
                messages: [],
            };

            rooms.push(newRoom);
            socket.emit("roomCreated", { room: room, roomId: newRoom.id });
        } else {
            socket.emit("error", "Room already exists.");
        }
    });

    socket.on("checkRoomExists", (room: string) => {
        const roomIndex = getRoomIndexFromName(rooms, room);

        if (roomIndex !== -1) {
            socket.emit("roomExists", { room: room, roomId: rooms[roomIndex].id });
        } else {
            socket.emit("error", "Room does not exist.");
        }
    });

    socket.on("joinRoom", (options: { room: string, name: string, id?: string }) => {
        const { room, name, id } = options;
        const roomIndex = getRoomIndexFromName(rooms, room);

        if (roomIndex !== -1) {
            let user: User = {
                id: crypto.randomBytes(4).toString("hex"),
                name: name,
                room: room,
            }

            if (id) {
                const userIndex = getUserIndexFromId(rooms[roomIndex].users, id);

                if (userIndex === -1) {
                    // User does not exist, request user to enter name
                    socket.emit("requestName");
                    return;
                } else {
                    user = {
                        ...user,
                        id: rooms[roomIndex].users[userIndex].id,
                        name: rooms[roomIndex].users[userIndex].name,
                    }
                }
            }

            socket.join(room);

            const parsedMessage = `${user.name} has joined the room!`;
            rooms[roomIndex].messages.push(parsedMessage);
            io.to(room).emit("chatMessage", parsedMessage);
            socket.emit("messages", rooms[roomIndex].messages); // Provide chat history to new users

            rooms[roomIndex].users.push(user);
            socket.data.user = user;

            if (!rooms[roomIndex].host) {
                console.log(`${user.name} is now host of ${room}`);
                rooms[roomIndex].host = user.id;
            }

            socket.emit("roomJoined", { id: user.id, name: user.name, isHost: rooms[roomIndex].host === user.id });
        } else {
            socket.emit("error", "Room does not exist.");
        }
    });

    socket.on("chatMessage", (options: { room: string; message: string; }) => {
        const { room, message } = options;
        const roomIndex = getRoomIndexFromName(rooms, room);

        if (roomIndex !== -1) {
            const userIndex = getUserIndexFromId(rooms[roomIndex].users, socket.data.user.id);
    
            if (userIndex === -1) {
                socket.emit("error", "User does not exist.");
                return;
            }
    
            const parsedMessage = `${rooms[roomIndex].users[userIndex].name}: ${message}`;
    
            socket.rooms.forEach((name) => {
                const roomIndex = getRoomIndexFromName(rooms, name);
    
                if (roomIndex !== -1) {
                    rooms[roomIndex].messages.push(parsedMessage);
                }
            });
    
            io.to([...socket.rooms]).emit("chatMessage", parsedMessage);
        }
    });

    socket.on("requestGif", () => {
        axios.get(`https://api.giphy.com/v1/gifs/random?api_key=${apiKey}&tag=funny`)
            .then((res) => {
                io.to([...socket.rooms]).emit("receiveGif", res.data.data.images.original.url);
            })
            .catch((reason) => new Error(reason));
    });
});

httpServer.listen(3001);
console.log("Listening on localhost:3001!");
