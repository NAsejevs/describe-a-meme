import { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context";
import { useNavigate } from "react-router-dom";
import { Card, Col, Button, Image, Row } from "react-bootstrap";
import "./game.css";

interface GameProps {
    room: string | undefined;
}

function Game(props: GameProps) {
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

    const { socket, isHost } = useContext(StoreContext);
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
        <Col sm={12} md={8} className="mt-4 my-md-4 flex-grow-1">
            <Card className="h-100 shadow">
                <Row className="h-100">
                    <Col className="d-flex justify-content-center mt-4">
                        <Image src={imageUrl} alt={imageUrl} className="gameImage"/>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        { isHost && <Button onClick={requestGif}>Request new GIF!</Button>}
                    </Col>
                </Row>
            </Card>
        </Col>
    );
}

export default Game;
