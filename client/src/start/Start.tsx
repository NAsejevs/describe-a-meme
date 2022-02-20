import { ChangeEvent, createRef, useContext, useEffect, useState } from "react";
import { Col, Row, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../context";
import "./start.css";

function Start() {
    const [roomNameInput, setRoomNameInput] = useState("");
    const roomNameRef = createRef<HTMLInputElement>();
    const { socket, setHost } = useContext(StoreContext);
    const navigate = useNavigate();

    useEffect(() => {
        socket.on("roomExists", (room: string) => {
            navigate(`/${room}`);
        });

        socket.on("roomCreated", (room: string) => {
            setHost(true);
            navigate(`/${room}`);
        });
    }, []);

    const onRoomNameInput = (event: ChangeEvent<HTMLInputElement>) => {
        setRoomNameInput(event.target.value);
    }

    const createRoom = (event: any, room: string) => {
        event.preventDefault();
        socket.emit("createRoom", room);
    }

    const checkRoomExists = (event: any, room: string) => {
        event.preventDefault();
        socket.emit("checkRoomExists", room);
    }

    return (
        <>
            <Row className="pt-4">
                <Col className="text-center">
                    <h1 className="display-1 text-light">Describe-A-Meme</h1>
                </Col>
            </Row>
            <Row className="flex-grow-1">
                <Col sm={12} md={6} className="m-auto d-flex justify-content-center">
                    <Form className="d-grid gap-2">
                        <Form.Control
                            required
                            placeholder="Room name"
                            onInput={onRoomNameInput}
                            value={roomNameInput}
                            ref={roomNameRef}
                            className="mb-3"
                        />
                        <Button
                            type="submit"
                            className="btn-primary"
                            onClick={(event) => checkRoomExists(event, roomNameInput)}
                            disabled={roomNameInput.length <= 0}
                        >
                            Join existing game
                        </Button>
                        <Button
                            type="submit"
                            className="btn-success"
                            onClick={(event) => createRoom(event, roomNameInput)}
                            disabled={roomNameInput.length <= 0}
                        >
                            Start a new game
                        </Button>
                    </Form>
                </Col>
            </Row>
        </>
    );
}

export default Start;