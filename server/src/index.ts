import { createServer } from "http";
import axios from "axios";
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
            socket.emit("createRoomSuccess", room);
        } else {
            socket.emit("error", "Room already exists.");
        }
    });

    socket.on("joinRoom", (room: string) => {
        const roomIndex = getRoomIndexFromName(rooms, room);

        if (roomIndex !== -1) {
            socket.emit("joinRoomSuccess", room);
        } else {
            socket.emit("error", "Room does not exist.");
        }
    });

    socket.on("joinedRoom", (options: { room: string, username: string, }) => {
        const roomIndex = getRoomIndexFromName(rooms, options.room);

        if (roomIndex !== -1) {
            socket.join(options.room);

            const parsedMessage = `${options.username} has joined the room!`;
            rooms[roomIndex].messages.push(parsedMessage);
            io.to(options.room).emit("chatMessage", parsedMessage);

            // socket.emit("messages", rooms[roomIndex].messages);
            users.push({
                id: socket.id,
                name: options.username,
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

    socket.on("requestGif", () => {
        axios.get(`https://api.giphy.com/v1/gifs/random?api_key=${apiKey}`)
            .then((res) => {
                io.to([...socket.rooms]).emit("receiveGif", res.data.data.images.original.url);
            })
            .catch((reason) => new Error(reason));
    });
});

httpServer.listen(3001);
console.log("Listening on localhost:3001!");
