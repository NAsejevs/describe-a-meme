import React, { useState, useContext, useEffect } from "react";
import { Button, Container, Modal } from "react-bootstrap";
import { Route, BrowserRouter, useParams, Routes } from "react-router-dom";
import Chat from "./chat/Chat";
import { StoreContext } from "./context";
import Start from "./start/Start";

function App() {
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const socket = useContext(StoreContext).socket;

    useEffect(() => {
        socket.connect();

        socket.on("error", (message: string) => {
            setShowError(true);
            setErrorMessage(message);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <Container className="d-flex flex-column h-100">
            <Modal show={showError} onHide={() => setShowError(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>{errorMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowError(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Start />}/>
                    <Route path="/:room" element={<Room />}/>
                </Routes>
            </BrowserRouter>
        </Container>
    );
}

function Room() {
    let { room } = useParams();

    return <Chat room={room} />;
}

export default App;