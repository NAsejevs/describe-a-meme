import React, { ChangeEvent } from "react";
import { io } from "socket.io-client";
import "./chat.css";

interface ChatState {
    connected: boolean;
    chat: Array<string>;
    input: string;
}

const socket = io("ws://localhost:3001", {
    autoConnect: false,
});

class Chat extends React.Component<{}, ChatState> {
    private messageContainerRef;

    constructor(props: any) {
        super(props);
        this.messageContainerRef = React.createRef<HTMLDivElement>();

        this.state = {
            connected: false,
            chat: [],
            input: "",
        }

        socket.on("connect", () => {
            console.log("connected");
            this.setState({
                connected: true,
            });
        });

        socket.on("disconnect", () => {
            this.setState({
                connected: false,
            });
        });

        socket.on("messages", (messages: Array<string>) => {
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

        socket.on("chatMessage", (message: string) => {
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
    }

    componentDidMount() {
        this.connect();
    }

    render() {
        return (
            <div className="chat-container">
                <div className="admin-container">
                    <button onClick={this.connect}>Connect!</button>
                    <button onClick={this.disconnect}>Disconnect!</button>
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
                    <input className="send-input" onChange={this.onInput} value={this.state.input}/>
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
        socket.emit("chatMessage", `${socket.id}: ${this.state.input}`);
        this.setState({
            input: "",
        })
    }

    connect = () => {
        socket.connect();
    }

    disconnect = () => {
        socket.disconnect();
        this.setState({
            chat: [],
        });
    }
}

export default Chat;
