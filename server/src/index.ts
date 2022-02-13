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
    socket.on("createRoom", (name) => {
        const roomIndex = getRoomIndexFromName(rooms, name);

        if (roomIndex === -1) {
            rooms.push({
                id: rooms.length,
                name: name,
                messages: [],
            });
        } else {
            io.emit("error", "Room name is taken.");
        }
    });

    socket.on("joinRoom", (options: { room: string; name: string; }) => {
        const roomIndex = getRoomIndexFromName(rooms, options.room);

        if (roomIndex !== -1) {
            socket.join(options.room);
            io.to([...socket.rooms]).emit("messages", rooms[roomIndex].messages);

            users.push({
                id: socket.id,
                name: options.name,
            })
        } else {
            io.emit("error", "Room does not exist.");
        }
    });

    socket.on("chatMessage", (message) => {
        const userIndex = getUserIndexFromId(users, socket.id);
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
