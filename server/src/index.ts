import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    }
});

interface Room {
    name: string;
    messages: Array<string>;
}

const rooms: Array<Room> = [];

io.on("connection", (socket) => {
    socket.on("createRoom", (name) => {
        rooms.push({
            name: name,
            messages: [],
        });
    });

    socket.on("joinRoom", (name) => {
        const roomIndex = rooms.findIndex((room) => room.name === name);

        if (roomIndex !== -1) {
            socket.join(name);
            io.emit("messages", rooms[roomIndex].messages);
        } else {
            io.emit("error", "Room does not exist.");
        }
    });

    socket.on("chatMessage", (message) => {
        // messages.push(message);
        // socket.roo
        io.to([...socket.rooms]).emit("chatMessage", message);
    });
});


httpServer.listen(3001);
console.log("Listening on localhost:3001!");
