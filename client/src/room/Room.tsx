import { ChangeEvent, FormEvent, useContext, useEffect, useRef, useState } from "react";
import { Button, Form, Modal, Row } from "react-bootstrap";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { StoreContext } from "../context";
import Chat from "./chat/Chat";
import Game from "./game/Game";
import { LocationState } from "./types";

function Room() {
    const [name, setName] = useState("nils");
    const [showNamePrompt, setShowNamePrompt] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const { socket, setIsHost } = useContext(StoreContext);
    
    const navigate = useNavigate();
    const [cookies, setCookie, removeCookie] = useCookies();
    const { room } = useParams();
    const locationState = useLocation().state as LocationState | null;
    const [ roomId, setRoomId ] = useState(locationState?.roomId);

    const onNameInput = (event: ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    }

    const joinRoom = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget;
        if (form.checkValidity() !== false) {
            socket.emit("joinRoom", { room: room, name: name });
            setShowNamePrompt(false);
        } else {
            setShowValidation(true);
        }
    }

    useEffect(() => {
        if (!room) {
            navigate("/");
            return;
        }

        if (!roomId) {
            socket.on("roomExists", (options: { room: string; roomId: string; }) => {
                setRoomId(options.roomId);
            });

            socket.emit("checkRoomExists", room);
            return () => {
                socket.off("roomExists");
            };
        }

        socket.on("roomJoined", (options: { id: string; name: string; isHost: boolean }) => {
            setCookie(roomId, {
                id: options.id,
                name: options.name,
                room: room,
            });

            setIsHost(options.isHost);
        });

        socket.on("requestName", () => {
            setShowNamePrompt(true);
        });

        if (
            cookies[roomId]
            && cookies[roomId].room === room
        ) {
            socket.emit("joinRoom", { room: room, name: cookies[roomId].name, id: cookies[roomId].id });
        } else {
            setShowNamePrompt(true);
        }

        return () => {
            socket.off("roomJoined");
            socket.off("requestName");
        }
    }, [roomId]);

    useEffect(() => {
        if (nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, [nameInputRef]);

    return (
        <>
            <Modal show={showNamePrompt} size="sm">
                <Form noValidate validated={showValidation} onSubmit={joinRoom}>
                    <Modal.Header>
                        <Modal.Title>Enter name</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Control
                                className="text-center mb-2"
                                required
                                placeholder="Name"
                                onInput={onNameInput}
                                value={name}
                                autoFocus
                                ref={nameInputRef}
                            />
                        </Form.Group>
                        <Button variant="success" type="submit" className="w-100">
                            Continue
                        </Button>
                    </Modal.Body>
                </Form>
            </Modal>
            <Row className="roomContainer h-100 flex-column flex-md-row">
                {
                    room && roomId && <>
                        <Game room={room} roomId={roomId} />
                        <Chat room={room} roomId={roomId} />
                    </>
                }
            </Row>
        </>
    );
}

export default Room;