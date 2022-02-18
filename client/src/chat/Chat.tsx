import { FormEvent, ChangeEvent, createRef, useContext, useEffect, useState, useRef } from "react";
import "./chat.css";
import { StoreContext } from "../context";
import { useNavigate } from "react-router-dom";
import { Button, Col, Row, Form, Modal, Card, InputGroup } from "react-bootstrap";
import { EmojiConvertor } from "emoji-js";

interface ChatProps {
    room: string | undefined;
}

const emoji = new EmojiConvertor();

emoji.replace_mode = 'unified';
emoji.allow_native = true;

function Chat(props: ChatProps) {
    const [messages, setMessages] = useState<string[]>([]);
    const [chatInput, setChatInput] = useState("");

    const usernameInputRef = useRef<HTMLInputElement>(null);
    const [username, setUsername] = useState("nils");
    const [showUsernamePrompt, setShowUsernamePrompt] = useState(true);
    const [showValidation, setShowValidation] = useState(false);

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
    }, []);

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = 
                messageContainerRef.current.scrollHeight
                - messageContainerRef.current.clientHeight;
        }
    }, [messages, messageContainerRef]);

    useEffect(() => {
        if (usernameInputRef.current) {
            usernameInputRef.current.focus();
        }
    }, [usernameInputRef]);

    const send = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget;
        if (form.checkValidity() !== false) {
            socket.emit("chatMessage", emoji.replace_colons(chatInput));
            
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

    const onUsernameInput = (event: ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    }

    const joinRoom = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget;
        if (form.checkValidity() !== false) {
            socket.emit("joinedRoom", { room: props.room, username: username });
            setShowUsernamePrompt(false);
        } else {
            setShowValidation(true);
        }

    }

    return (
        <>
            <Modal show={showUsernamePrompt} size="sm">
                <Form noValidate validated={showValidation} onSubmit={joinRoom}>
                    <Modal.Header>
                        <Modal.Title>Enter username</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Control
                                className="text-center mb-2"
                                required
                                placeholder="Username"
                                onInput={onUsernameInput}
                                value={username}
                                autoFocus
                                ref={usernameInputRef}
                            />
                        </Form.Group>
                        <Button variant="success" type="submit" className="w-100">
                            Continue
                        </Button>
                    </Modal.Body>
                </Form>
            </Modal>

            <Col xs={12} md={4} className="chatContainer my-4 flex-grow-0">
                <Card className="h-100">
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
        </>
    );
}

export default Chat;
