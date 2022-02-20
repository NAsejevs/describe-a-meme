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
const users: Array<User> = [];

io.on("connection", (socket) => {
    socket.on("createRoom", (room) => {
        const roomIndex = getRoomIndexFromName(rooms, room);

        if (roomIndex === -1) {
            rooms.push({
                id: rooms.length,
                name: room,
                messages: [],
            });
            socket.emit("roomCreated", room);
        } else {
            socket.emit("error", "Room already exists.");
        }
    });

    socket.on("checkRoomExists", (room: string) => {
        const roomIndex = getRoomIndexFromName(rooms, room);

        if (roomIndex !== -1) {
            socket.emit("roomExists", room);
        } else {
            socket.emit("error", "Room does not exist.");
        }
    });

    socket.on("joinRoom", (options: { room: string, username: string, }) => {
        const roomIndex = getRoomIndexFromName(rooms, options.room);

        if (roomIndex !== -1) {
            socket.join(options.room);

            const parsedMessage = `${options.username} has joined the room!`;
            rooms[roomIndex].messages.push(parsedMessage);
            io.to(options.room).emit("chatMessage", parsedMessage);

            // socket.emit("messages", rooms[roomIndex].messages); // Provide chat history to new users

            const user: User = {
                id: crypto.randomBytes(4).toString("hex"),
                name: options.username,
            }

            if (!rooms[roomIndex].host) {
                rooms[roomIndex].host = user.id;
            }

            socket.data.user = user;

            users.push(user);

            socket.emit("roomJoined", user.id);
        } else {
            socket.emit("error", "Room does not exist.");
        }
    });

    socket.on("chatMessage", (message) => {
        const userIndex = getUserIndexFromId(users, socket.data.user.id);

        if (userIndex === -1) {
            socket.emit("error", "User does not exist.");
            return;
        }

        const parsedMessage = `${users[userIndex].name}: ${message}`;

        socket.rooms.forEach((name) => {
            const roomIndex = getRoomIndexFromName(rooms, name);

            if (roomIndex !== -1) {
                rooms[roomIndex].messages.push(parsedMessage);
            }
        });

        io.to([...socket.rooms]).emit("chatMessage", parsedMessage);
    });

    socket.on("requestGif", () => {
        axios.get(`https://api.giphy.com/v1/gifs/random?api_key=${apiKey}&tag=racist`)
            .then((res) => {
                io.to([...socket.rooms]).emit("receiveGif", res.data.data.images.original.url);
            })
            .catch((reason) => new Error(reason));
    });
});

httpServer.listen(3001);
console.log("Listening on localhost:3001!");
