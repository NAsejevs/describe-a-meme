import React from "react";
import { Container } from "react-bootstrap";
import { Route, BrowserRouter, useParams, Routes } from "react-router-dom";
import Chat from "./chat/Chat";
import Start from "./start/Start";

class App extends React.Component {
    render() {
        return (
            <Container className="h-100">
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Start />}/>
                        <Route path="/:id" element={<Room />}/>
                    </Routes>
                </BrowserRouter>
            </Container>
        );
    }
}

const Room = () => {
    let { id } = useParams();

    return (
        <>
            <Chat id={id || null} />
        </>
    );
}

export default App;