import { ChangeEvent, FormEvent, useContext, useEffect, useRef, useState } from "react";
import { Button, Form, Modal, Row } from "react-bootstrap";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ActionTypes, StateContext } from "../context";
import Chat from "./chat/Chat";
import Game from "./game/Game";
import { LocationState } from "./types";

function Room() {
    const [name, setName] = useState("nils");
    const [showNamePrompt, setShowNamePrompt] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const { socket, dispatch } = useContext(StateContext);
    
    const navigate = useNavigate();
    const [cookies, setCookie, removeCookie] = useCookies();
    const { roomName } = useParams();
    const locationState = useLocation().state as LocationState | null;
    const [ roomId, setRoomId ] = useState(locationState?.roomId);

    useEffect(() => {
        if (!roomName) {
            navigate("/");
            return;
        }

        if (!roomId) {
            socket.on("roomExists", (options) => {
                setRoomId(options.roomId);
            });

            socket.emit("checkRoomExists", roomName);
            return () => {
                socket.off("roomExists");
            };
        }

        socket.on("roomJoined", (payload) => {
            const { userId, userName, isHost } = payload;

            setCookie(roomId, {
                userId: userId,
                userName: userName,
                roomName: roomName,
            });

            dispatch({ type: ActionTypes.SET_IS_HOST, payload: isHost });
        });

        socket.on("requestName", () => {
            setShowNamePrompt(true);
        });

        if (
            cookies[roomId]
            && cookies[roomId].roomName === roomName
        ) {
            socket.emit("joinRoom", { roomName: roomName, userName: cookies[roomId].userName, userId: cookies[roomId].userId });
        } else {
            setShowNamePrompt(true);
        }

        return () => {
            socket.off("roomJoined");
            socket.off("requestName");
        }
    }, [roomId]);

    useEffect(() => {
        nameInputRef.current?.focus();
    }, [nameInputRef]);

    const onNameInput = (event: ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    }

    const joinRoom = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if(!roomName) return;

        const form = event.currentTarget;
        if (form.checkValidity() !== false) {
            socket.emit("joinRoom", { roomName: roomName, userName: name });
            setShowNamePrompt(false);
        } else {
            setShowValidation(true);
        }
    }

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
                    roomName && roomId && <>
                        <Game roomName={roomName} roomId={roomId} />
                        <Chat roomName={roomName} roomId={roomId} />
                    </>
                }
            </Row>
        </>
    );
}

export default Room;