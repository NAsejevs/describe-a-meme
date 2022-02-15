import { ChangeEvent, createRef, useContext, useEffect, useState } from "react";
import "./chat.css";
import { StoreContext } from "../context";
import { useNavigate } from "react-router-dom";

interface ChatProps {
    room: string | undefined;
}

function Chat(props: ChatProps) {
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const inputRef = createRef<HTMLInputElement>();
    const messageContainerRef = createRef<HTMLDivElement>();
    const socket = useContext(StoreContext).socket;
    const navigate = useNavigate();

    useEffect(() => {
        if (!props.room) {
            navigate("/");
            return;
        }

        socket.on("messages", (messages: string[]) => {
            setMessages(messages);
        });

        socket.on("chatMessage", (message: string) => {
            setMessages((prevState) => [...prevState, message]);
        });

        socket.emit("joinedRoom", props.room);
    }, []);

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = 
                messageContainerRef.current.scrollHeight
                - messageContainerRef.current.clientHeight;
        }
    }, [messages]);

    const send = () => {
        socket.emit("chatMessage", input);
        
        setInput("");
        inputRef.current?.focus();
    }

    const onInput = (event: ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
    }

    return (
        <div className="chat-container">
            <div className="message-container" ref={messageContainerRef}>
                {
                    messages.map((message, index) => {
                        return (
                            <div key={index}>{message}</div>
                        );
                    })
                }
            </div>
            <div className="input-container">
                <input className="send-input" onChange={onInput} value={input} ref={inputRef}/>
                <button className="send-button" onClick={send}>Send!</button>
            </div>
        </div>
    );
}

export default Chat;
