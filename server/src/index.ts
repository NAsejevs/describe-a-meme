import { createServer } from "http";
import { Server } from "socket.io";
import { generateGifUrl, getRoomIndexFromName, getUserIndexFromId, isRoomHost } from "./utils";
import { ClientToServerEvents, GameState, Room , ServerToClientEvents, SocketData, User, Vote } from "./types";
import crypto from "crypto";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

const apiKey = "dkTRN5XKu4syueQPy7pM4TLkpPVEHk3O";
const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, SocketData>(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});

const rooms: Array<Room> = [];

io.on("connection", (socket) => {
    socket.on("disconnect", () => {
        if (!socket.data.user) return;

        const { roomName, name } = socket.data.user;
        const roomIndex = getRoomIndexFromName(rooms, roomName);

        if (roomIndex !== -1) {
            const parsedMessage = `${name} has left the room.`;
            rooms[roomIndex].messages.push(parsedMessage);
            io.to(roomName).emit("chatMessage", parsedMessage);
        }
    });

    socket.on("createRoom", (roomName) => {
        const roomIndex = getRoomIndexFromName(rooms, roomName);

        if (roomIndex === -1) {
            const newRoom = {
                id: crypto.randomBytes(4).toString("hex"),
                name: roomName,
                users: [],
                messages: [],
                descriptions: [],
                describeTime: 10000,
                votes: [],
                votingTime: 10000,
                reviewTime: 10000,
                gameState: GameState.Idle,
            };

            rooms.push(newRoom);
            socket.emit("roomCreated", { roomName: roomName, roomId: newRoom.id });
        } else {
            socket.emit("error", { code: 0, message: "Room already exists." });
        }
    });

    socket.on("checkRoomExists", (roomName: string) => {
        const roomIndex = getRoomIndexFromName(rooms, roomName);

        if (roomIndex !== -1) {
            socket.emit("roomExists", { roomName: roomName, roomId: rooms[roomIndex].id });
        } else {
            socket.emit("error", { code: 1, message: "Room does not exist." });
        }
    });

    socket.on("joinRoom", (payload) => {
        const { roomName, userName, userId } = payload;
        const roomIndex = getRoomIndexFromName(rooms, roomName);

        if (roomIndex !== -1) {
            let user: User = {
                id: crypto.randomBytes(4).toString("hex"),
                name: userName,
                roomName: roomName,
            }

            if (userId) {
                const userIndex = getUserIndexFromId(rooms[roomIndex].users, userId);
                
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

            rooms[roomIndex].users.push(user);
            const userIndex = rooms[roomIndex].users.length - 1;
            socket.data.user = rooms[roomIndex].users[userIndex];

            if (!rooms[roomIndex].host) {
                rooms[roomIndex].host = user.id;
            }

            socket.join(roomName);

            const parsedMessage = `${user.name} has joined the room!`;

            socket.emit("roomJoined", { userId: user.id, userName: user.name, isHost: rooms[roomIndex].host === user.id });
            socket.emit("messages", rooms[roomIndex].messages); // Provide chat history to new users
            socket.emit("gameState", { gameState: rooms[roomIndex].gameState });
            socket.emit("gif", rooms[roomIndex].gifUrl);
            socket.emit("descriptions", rooms[roomIndex].descriptions);

            rooms[roomIndex].messages.push(parsedMessage);
            io.to(roomName).emit("chatMessage", parsedMessage);
        } else {
            socket.emit("error", { code: 1, message: "Room does not exist." });
        }
    });

    socket.on("chatMessage", (payload) => {
        if (!socket.data.user) return;
        
        const { message } = payload;
        const { roomName, id } = socket.data.user;
        const roomIndex = getRoomIndexFromName(rooms, roomName);

        if (roomIndex !== -1) {
            const userIndex = getUserIndexFromId(rooms[roomIndex].users, id);
    
            if (userIndex === -1) {
                socket.emit("error", { code: 0, message: "User does not exist." });
                return;
            }
    
            const parsedMessage = `${rooms[roomIndex].users[userIndex].name}: ${message}`;
    
            socket.rooms.forEach((name) => {
                const roomIndex = getRoomIndexFromName(rooms, name);
    
                if (roomIndex !== -1) {
                    rooms[roomIndex].messages.push(parsedMessage);
                }
            });
    
            io.to(roomName).emit("chatMessage", parsedMessage);
        }
    });

    socket.on("requestGif", () => {
        if (!socket.data.user) return;

        const { roomName } = socket.data.user;
        const roomIndex = getRoomIndexFromName(rooms, roomName);

        if (roomIndex !== -1) {
            generateGifUrl(apiKey, "funny").then((url) => {
                io.to(roomName).emit("gif", url);
                rooms[roomIndex].gifUrl = url;
            });
        }
    });

    socket.on("setGameState", (payload) => {
        if (!socket.data.user) return;

        const { gameState } = payload;
        const { roomName, id } = socket.data.user;
        const roomIndex = getRoomIndexFromName(rooms, roomName);

        if (roomIndex !== -1) {
            let timeout = rooms[roomIndex].describingTimeout;
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = rooms[roomIndex].votingTimeout;
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = rooms[roomIndex].reviewTimeout;
            if (timeout) {
                clearTimeout(timeout);
            }

            switch(gameState) {
                case GameState.Describe: {
                    if (isRoomHost(rooms, roomName, id)) {
                        rooms[roomIndex].gameState = gameState;
                        rooms[roomIndex].describingTimeout = setTimeout(() => {
                            io.to(roomName).emit("gameState", {
                                gameState: GameState.Vote,
                            });

                            rooms[roomIndex].votingTimeout = setTimeout(() => {
                                io.to(roomName).emit("gameState", {
                                    gameState: GameState.Review,
                                });

                                rooms[roomIndex].votingTimeout = setTimeout(() => {
                                    io.to(roomName).emit("gameState", {
                                        gameState: GameState.Idle,
                                    });
    
                                    rooms[roomIndex].descriptions = [];
                                    rooms[roomIndex].votes = [];
    
                                }, rooms[roomIndex].reviewTime);
                            }, rooms[roomIndex].votingTime);
                        }, rooms[roomIndex].describeTime);

                        io.to(roomName).emit("gameState", {
                            gameState: gameState,
                        });

                        generateGifUrl(apiKey, "funny").then((url) => {
                            io.to(roomName).emit("gif", url);
                            rooms[roomIndex].gifUrl = url;
                        });
                    } else {
                        socket.emit("error", { code: 0, message: "You are not the host." });
                    }
                }
            }
        }
    });

    socket.on("addDescription", (text) => {
        if (!socket.data.user) return;

        const { roomName, id } = socket.data.user;
        const roomIndex = getRoomIndexFromName(rooms, roomName);

        if (roomIndex !== -1) {
            if (rooms[roomIndex].descriptions.some((d) => d.userId === id)) {
                socket.emit("error", { code: 0, message: "Meme already described." });
            }

            const description = {
                userId: id,
                text: text,
            }
            rooms[roomIndex].descriptions.push(description);
            io.to(roomName).emit("descriptions", rooms[roomIndex].descriptions);
        }
    });

    socket.on("vote", (payload) => {
        if (!socket.data.user) return;

        const { roomName, id } = socket.data.user;
        const roomIndex = getRoomIndexFromName(rooms, roomName);

        if (roomIndex !== -1) {
            const { descriptionUserId } = payload;

            if (rooms[roomIndex].votes.some((v) => v.userId === id)) {
                socket.emit("error", { code: 0, message: "Vote already submitted." });
            }

            const vote: Vote = {
                userId: id,
                descriptionUserId: descriptionUserId,
            }
            rooms[roomIndex].votes.push(vote);
            io.to(roomName).emit("votes", rooms[roomIndex].votes);
        }
    });
});

httpServer.listen(3001);
console.log("Listening on localhost:3001!");
