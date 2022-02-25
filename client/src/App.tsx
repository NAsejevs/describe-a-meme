import React, { useState, useContext, useEffect } from "react";
import { Button, Container, Modal } from "react-bootstrap";
import { Route, Routes, useNavigate } from "react-router-dom";
import { StateContext } from "./context";
import Start from "./start/Start";
import Room from "./room/Room";

function App() {
    const [showError, setShowError] = useState(false);
    const [errorCode, setErrorCode] = useState<undefined | number>(undefined);
    const [errorMessage, setErrorMessage] = useState("");
    const { socket, roomName } = useContext(StateContext);
    const navigate = useNavigate();

    useEffect(() => {
        socket.connect();

        socket.on("error", (payload) => {
            const { code, message } = payload;

            setShowError(true);
            setErrorMessage(message);
            setErrorCode(code);
        });

        return () => {
            socket.off("error");
            socket.disconnect();
        };
    }, []);

    const createRoom = () => {
        if (roomName) {
            setShowError(false);
            socket.emit("createRoom", roomName);
            navigate("/");
        }
    }

    return (
        <Container fluid="lg" className="app d-flex flex-column h-100">
            <Modal show={showError} onHide={() => setShowError(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>{errorMessage}</Modal.Body>
                <Modal.Footer>
                    {
                        errorCode === 1 && roomName &&
                        <Button variant="primary" onClick={() => createRoom()}>
                            Create Room
                        </Button>
                    }
                    <Button variant="secondary" onClick={() => setShowError(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <Routes>
                <Route path="/" element={<Start />}/>
                <Route path="/:roomName" element={<Room />}/>
            </Routes>
        </Container>
    );
}

export default App;