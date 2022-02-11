import React, { ChangeEvent } from "react";
import { io } from "socket.io-client";

interface AppState {
    connected: boolean;
    chat: Array<string>;
    input: string;
}

const socket = io("ws://localhost:3001", {
    autoConnect: false,
});

class App extends React.Component<{}, AppState> {
    constructor(props: any) {
        super(props);

        this.state = {
            connected: false,
            chat: [],
            input: "",
        }

        socket.on("connect", () => {
            this.setState({
                connected: true,
            });
        });

        socket.on("disconnect", () => {
            this.setState({
                connected: false,
            });
        })

        socket.on("chatMessage", (message: string) => {
            this.setState({
                chat: [...this.state.chat, message],
            });
        });
    }

    render() {
        return (
            <div className="App">
                <div>
                    
                </div>
                <button onClick={this.connect}>Connect!</button><button onClick={this.disconnect}>Disconnect!</button><br/><br/>
                <input onChange={this.onInput} value={this.state.input}/><button onClick={this.send} disabled={!this.state.connected}>Send!</button>
                {
                    this.state.chat.map((message) => {
                        return (<div>{ message }</div>);
                    })
                }
            </div>
        )
    }

    onInput = (event: ChangeEvent<HTMLInputElement>) => {
        this.setState({
            input: event.target.value,
        })
    }

    send = () => {
        socket.emit("chatMessage", this.state.input);
        this.setState({
            input: "",
        })
    }

    connect = () => {
        socket.connect();
    }

    disconnect = () => {
        socket.disconnect();
    }
}

export default App;
