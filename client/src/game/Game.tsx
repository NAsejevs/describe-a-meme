import { useContext, useEffect, useState } from "react";
import { StoreContext } from "../context";
import { useNavigate } from "react-router-dom";
import { Card, Col, Button } from "react-bootstrap";

interface GameProps {
    room: string | undefined;
}

function Game(props: GameProps) {
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

    const socket = useContext(StoreContext).socket;
    const navigate = useNavigate();

    useEffect(() => {
        if (!props.room) {
            navigate("/");
            return;
        }

        socket.on("receiveGif", (url: string) => {
            setImageUrl(url);
        });
    }, []);

    const requestGif = () => {
        socket.emit("requestGif");
    }

    return (
        <Col sm={12} md={8} className="my-4 flex-grow-1">
            <Card className="h-100">
                <img src={imageUrl} alt={imageUrl}/>
                <Button onClick={requestGif}>Request new GIF!</Button>
            </Card>
        </Col>
    );
}

export default Game;
