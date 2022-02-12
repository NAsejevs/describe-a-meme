import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    }
});

const messages: Array<string> = [];

io.on("connection", (socket) => {
    io.emit("messages", messages);
    socket.on("chatMessage", (message) => {
        messages.push(message);
        io.emit("chatMessage", message);
    });
});


httpServer.listen(3001);
console.log("Listening on localhost:3001!");
