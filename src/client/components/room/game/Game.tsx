import { useContext, useEffect, useMemo, useState } from "react";
import { ActionTypes, StateContext } from "../../../context";
import { Card, Col, Button, Image, Row, Spinner, Stack } from "react-bootstrap";
import "./game.css";
import { GameState } from "../../../../shared/types";
import Descriptions from "./Descriptions";

interface GameProps {
    roomName: string;
    roomId: string;
}

function Game(props: GameProps) {
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    const [counter, setCounter] = useState(0);
    const [dependency, setDependency] = useState(false);
    const heavyComputation = useMemo(() => {
        for(let i = 0; i <= 1000000000; i++) {
            if (i === 1000000000) {
                return "hello world!";
            }
        }
    }, [dependency])

    const { socket, user, dispatch, gameState } = useContext(StateContext);

    useEffect(() => {
        socket.on("gif", (url) => {
            setImageUrl(url);
        });

        socket.on("gameState", (payload) => {
            dispatch({ type: ActionTypes.SET_GAME_STATE, gameState: payload.gameState });
        });

        return () => {
            socket.off("gif");
            socket.off("gameState");
        }
    }, []);

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

    const gameStateRenderer = () => {
        console.log("gameState: ", gameState);

        switch(gameState) {
            case GameState.Idle:
                return null;
            case GameState.Describe:
            case GameState.Vote:
            case GameState.Review:
                return <Stack className="d-flex align-items-center">
                    { loading && <Spinner animation="border" className="loading position-absolute"/> }
                    { imageUrl && <Image src={imageUrl} alt={imageUrl} onLoad={onImageLoaded} className="gameImage shadow"/> }
                    { !loading && <Descriptions /> }
                </Stack>;
            default:
                return null;
        }
    }

    return (
        <Col sm={12} md={8} className="mt-4 my-md-4 flex-grow-1">
            Hello world!: { heavyComputation }
            <button onClick={() => { setCounter(counter + 1); }}>Counter</button>
            {counter}
            <Card className="h-100 shadow">
                <Row className="h-100">
                    <Col className="d-flex justify-content-center mt-4">
                        { gameStateRenderer() }
                    </Col>
                </Row>
                <Row>
                    <Col className="w-100 d-flex justify-content-center my-4">
                        { user?.isHost && <Button className="w-50" onClick={startGame}>Start game!</Button> }
                    </Col>
                </Row>
            </Card>
        </Col>
    );
}

export default Game;
