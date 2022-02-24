import { ChangeEvent, FormEvent, useContext, useEffect, useRef, useState } from "react";
import { ActionTypes, StateContext } from "../../context";
import { Card, Col, Button, Image, Row, Spinner, Form, Stack, ListGroup } from "react-bootstrap";
import "./game.css";
import { GameState } from "../../context/types";

interface GameProps {
    roomName: string;
    roomId: string;
}

function Game(props: GameProps) {
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState("");
    const [descriptions, setDescriptions] = useState<string[]>([]);
    const descriptionInputRef = useRef<HTMLInputElement>(null);

    const { socket, isHost, dispatch, gameState } = useContext(StateContext);

    useEffect(() => {
        socket.on("gif", (url) => {
            setImageUrl(url);
        });

        socket.on("gameState", (payload) => {
            dispatch({ type: ActionTypes.SET_GAME_STATE, payload: payload.gameState });
        });

        socket.on("descriptions", (messages) => {
            setDescriptions(messages);
        });

        return () => {
            socket.off("gif");
            socket.off("gameState");
        }
    }, []);

    useEffect(() => {
        descriptionInputRef.current?.focus();
    }, [descriptionInputRef]);

    const startGame = () => {
        socket.emit("setGameState", {
            gameState: GameState.Describe,
        });
        setImageUrl(undefined);
        setLoading(true);
    }

    const onImageLoaded = () => {
        setLoading(false);
    }

    const onDescriptionInput = (event: ChangeEvent<HTMLInputElement>) => {
        setDescription(event.target.value);
    }

    const addDescription = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        socket.emit("addDescription", description);
    }

    const gameStateRenderer = () => {
        switch(gameState) {
            case GameState.Idle:
                return null;
            case GameState.Describe: 
                return <Stack className="d-flex align-items-center">
                    { loading && <Spinner animation="border" className="loading position-absolute"/> }
                    { imageUrl && <Image src={imageUrl} alt={imageUrl} onLoad={onImageLoaded} className="gameImage shadow"/> }
                    { !loading && 
                        <>
                            <Form onSubmit={addDescription} className="w-50">
                                <Form.Group>
                                    <Form.Control
                                        className="text-center mt-4"
                                        required
                                        placeholder="Describe the above meme..."
                                        onInput={onDescriptionInput}
                                        value={description}
                                        autoFocus
                                        ref={descriptionInputRef}
                                    />
                                </Form.Group>
                            </Form>
                            <div className="justify-content-center d-flex">
                                <ListGroup variant="flush" className="descriptions w-50 overflow-scroll position-absolute">
                                    { descriptions.map((d) => <ListGroup.Item>{d}</ListGroup.Item>) }
                                </ListGroup>
                            </div>
                        </>
                    }
                </Stack>;
            default:
                return null;
        }
    }

    return (
        <Col sm={12} md={8} className="mt-4 my-md-4 flex-grow-1">
            <Card className="h-100 shadow">
                <Row className="h-100">
                    <Col className="d-flex justify-content-center mt-4">
                        { gameStateRenderer() }
                    </Col>
                </Row>
                <Row>
                    <Col>
                        { isHost && <Button onClick={startGame}>Start game!</Button> }
                    </Col>
                </Row>
            </Card>
        </Col>
    );
}

export default Game;
