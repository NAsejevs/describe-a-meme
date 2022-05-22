import { FormEvent, ChangeEvent, createRef, useContext, useEffect, useState } from "react";
import "./chat.css";
import { StateContext } from "../../../context";
import { Button, Col, Row, Form, Card, InputGroup } from "react-bootstrap";
import { EmojiConvertor } from "emoji-js";

interface ChatProps {
    roomName: string;
    roomId: string;
}

const emoji = new EmojiConvertor();

emoji.replace_mode = 'unified';
emoji.allow_native = true;

function Chat(props: ChatProps) {
    const [messages, setMessages] = useState<string[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [showValidation, setShowValidation] = useState(false);

    const inputRef = createRef<HTMLInputElement>();
    const messageContainerRef = createRef<HTMLDivElement>();
    const { socket } = useContext(StateContext);

    useEffect(() => {
        socket.on("messages", (messages) => {
            setMessages(messages);
        });

        socket.on("chatMessage", (message) => {
            setMessages((prevState) => [...prevState, message]);
        });

        return () => {
            socket.off("messages");
            socket.off("chatMessage");
        }
    }, []);

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = 
                messageContainerRef.current.scrollHeight
                - messageContainerRef.current.clientHeight;
        }
    }, [messages, messageContainerRef]);

    const send = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget;
        if (form.checkValidity() !== false) {
            socket.emit("chatMessage", { message: emoji.replace_colons(chatInput) });
            
            setChatInput("");
            inputRef.current?.focus();
            setShowValidation(false);
        } else {
            setShowValidation(true);
        }

    }

    const onChatInput = (event: ChangeEvent<HTMLInputElement>) => {
        setChatInput(event.target.value);
    }

    return (
        <Col xs={12} md={4} className="chatContainer my-4 flex-grow-0">
            <Card className="h-100 shadow">
                <Row className="h-100">
                    <Col className="messageContainer" ref={messageContainerRef}>
                        {
                            messages.map((message, index) => {
                                return (
                                    <Row key={index}>
                                        <Col className="mx-2">{message}</Col>
                                    </Row>
                                );
                            })
                        }
                    </Col>
                </Row>
                <Row>
                    <Form noValidate validated={showValidation} onSubmit={send}>
                        <InputGroup>
                            <Form.Control
                                onInput={onChatInput}
                                value={chatInput}
                                ref={inputRef}
                                autoFocus
                                required
                            />
                            <Button variant="primary" type="submit">
                                Send
                            </Button>
                        </InputGroup>
                    </Form>
                </Row>
            </Card>
        </Col>
    );
}

export default Chat;
