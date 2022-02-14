import React, { ChangeEvent } from "react";
import { getRandomEmoji } from "./utils";
import "./chat.css";
import { StoreContext } from "../context";
import { Store } from "../context/types";

interface ChatState {
    connected: boolean;
    chat: Array<string>;
    input: string;
}

interface ChatProps {
    id: string | null;
}

class Chat extends React.Component<ChatProps, ChatState> {
    private messageContainerRef;
    private inputRef;
    private socket;

    constructor(props: any, context: Store) {
        super(props);
        this.messageContainerRef = React.createRef<HTMLDivElement>();
        this.inputRef = React.createRef<HTMLInputElement>();
        this.socket = context.socket;

        this.state = {
            connected: false,
            chat: [],
            input: "",
        }


        this.socket.on("connect", () => {
            console.log("connected");
            this.setState({
                connected: true,
            });
        });

        this.socket.on("disconnect", () => {
            this.setState({
                connected: false,
            });
        });

        this.socket.on("messages", (messages: Array<string>) => {
            this.setState({
                chat: messages,
            }, () => {
                if (this.messageContainerRef.current) {
                    this.messageContainerRef.current.scrollTop = 
                        this.messageContainerRef.current.scrollHeight
                        - this.messageContainerRef.current.clientHeight;
                }
            });
        });

        this.socket.on("chatMessage", (message: string) => {
            this.setState({
                chat: [...this.state.chat, message],
            }, () => {
                if (this.messageContainerRef.current) {
                    this.messageContainerRef.current.scrollTop = 
                        this.messageContainerRef.current.scrollHeight
                        - this.messageContainerRef.current.clientHeight;
                }
            });
        });

        this.socket.on("error", (message: string) => {
            alert(message);
        });

        if (this.props.id) {
            this.joinRoom(this.props.id)
        }
    }

    componentDidMount() {
        this.connect();
    }

    render() {
        return (
            <div className="chat-container">
                <div className="admin-container">
                    <button onClick={this.connect}>Connect</button>
                    <button onClick={this.disconnect}>Disconnect</button>
                    <button onClick={this.createRoom}>Create room</button>
                    <button onClick={() => this.joinRoom()}>Join room</button>
                </div>
                <div className="message-container" ref={this.messageContainerRef}>
                    {
                        this.state.chat.map((message, index) => {
                            return (
                                <div key={index}>{message}</div>
                                );
                            })
                    }
                </div>
                <div className="input-container">
                    <input className="send-input" onChange={this.onInput} value={this.state.input} ref={this.inputRef}/>
                    <button className="send-button" onClick={this.send} disabled={!this.state.connected}>Send!</button>
                </div>
            </div>
        )
    }

    onInput = (event: ChangeEvent<HTMLInputElement>) => {
        this.setState({
            input: event.target.value,
        })
    }

    send = () => {
        this.socket.emit("chatMessage", this.state.input);
        this.setState({
            input: "",
        });

        this.inputRef.current?.focus();
    }

    connect = () => {
        this.socket.connect();
    }

    disconnect = () => {
        this.socket.disconnect();
    }

    createRoom = () => {
        const roomName = prompt("Enter room name to create", "room1");
        if (!roomName) return;
        
        this.socket.emit("createRoom", roomName);
    }

    joinRoom = (id: string | null = null) => {
        let room = id;

        if (!id) {
            room = prompt("Enter room name to join", "room1");
            if (!room) return;
        }
        const name = prompt("Enter username", getRandomEmoji());
        if (!name) return;

        this.socket.emit("joinRoom", {
            room: room,
            name: name,
        });
    }
}
Chat.contextType = StoreContext;

export default Chat;
