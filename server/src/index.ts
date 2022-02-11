import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    }
});

io.on("connection", (socket) => {
    socket.on("chatMessage", (message) => {
        console.log("message");
        io.emit("chatMessage", message);
    });
    console.log("Someone connected...");
});


httpServer.listen(3001);
console.log("Listening on localhost:3001!");
