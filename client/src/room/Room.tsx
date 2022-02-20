import { ChangeEvent, FormEvent, useContext, useEffect, useRef, useState } from "react";
import { Button, Form, Modal, Row } from "react-bootstrap";
import { useCookies } from "react-cookie";
import { useParams } from "react-router-dom";
import { StoreContext } from "../context";
import Chat from "./chat/Chat";
import Game from "./game/Game";

function Room() {
    const [username, setUsername] = useState("nils");
    const [showUsernamePrompt, setShowUsernamePrompt] = useState(true);
    const [showValidation, setShowValidation] = useState(false);
    const usernameInputRef = useRef<HTMLInputElement>(null);
    const [cookies, setCookie, removeCookie] = useCookies(["user"]);

    const { room } = useParams();
    const { socket } = useContext(StoreContext);

    const onUsernameInput = (event: ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    }

    const joinRoom = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget;
        if (form.checkValidity() !== false) {
            socket.emit("joinRoom", { room: room, username: username });
            setShowUsernamePrompt(false);
        } else {
            setShowValidation(true);
        }
    }

    useEffect(() => {
        socket.on("roomJoined", (id: string) => {
            setCookie("user", {
                id: id,
                username: username,
            });
            console.log("id: ", id);
        });
    }, []);

    useEffect(() => {
        if (usernameInputRef.current) {
            usernameInputRef.current.focus();
        }
    }, [usernameInputRef]);

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
            <Row className="roomContainer h-100 flex-column flex-md-row">
                <Game room={room} />
                <Chat room={room} />
            </Row>
        </>
    );
}

export default Room;