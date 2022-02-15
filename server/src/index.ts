import { createServer } from "http";
import { Server } from "socket.io";
import { getRoomIndexFromName, getUserIndexFromId } from "./utils";
import { Room , User } from "./types";

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    }
});

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
            socket.emit("createRoomSuccess", room);
        } else {
            socket.emit("error", "Room already exists.");
        }
    });

    socket.on("joinRoom", (room: string) => {
        const roomIndex = getRoomIndexFromName(rooms, room);

        if (roomIndex !== -1) {
            socket.join(room);
            socket.emit("joinRoomSuccess", room);
            socket.emit("messages", rooms[roomIndex].messages);
        } else {
            socket.emit("error", "Room does not exist.");
        }
    });

    socket.on("joinedRoom", (room: string) => {
        const roomIndex = getRoomIndexFromName(rooms, room);

        if (roomIndex !== -1) {
            console.log("rooms[roomIndex].messages: ", rooms[roomIndex].messages);
            socket.join(room);

            rooms[roomIndex].messages.push(`${socket.id} has joined the room!`);
            socket.emit("messages", rooms[roomIndex].messages);
            users.push({
                id: socket.id,
                name: socket.id,
            });
        } else {
            socket.emit("error", "Room does not exist.");
        }
    });

    socket.on("chatMessage", (message) => {
        const userIndex = getUserIndexFromId(users, socket.id);

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
});

httpServer.listen(3001);
console.log("Listening on localhost:3001!");
