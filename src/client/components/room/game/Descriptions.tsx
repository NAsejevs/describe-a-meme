import { ChangeEvent, FormEvent, useContext, useEffect, useRef, useState } from "react";
import { Badge, Form, ListGroup } from "react-bootstrap";
import { StateContext } from "../../../context";
import { Description, GameState, Vote } from "../../../../shared/types";

function Descriptions() {
    const [description, setDescription] = useState("");
    const [descriptions, setDescriptions] = useState<Description[]>([]);
    const [described, setDescribed] = useState(false);
    const [votes, setVotes] = useState<Vote[]>([]);
    const [voted, setVoted] = useState(false); 

    const descriptionInputRef = useRef<HTMLInputElement>(null);
    const { socket, user, gameState } = useContext(StateContext);

    useEffect(() => {
        socket.on("descriptions", (serverDescriptions) => {
            setDescriptions(serverDescriptions);
        });

        socket.on("votes", (serverVotes) => {
            setVotes(serverVotes);
        });

        return () => {
            socket.off("descriptions");
            socket.off("votes");
        }
    }, []);

    useEffect(() => {
        descriptionInputRef.current?.focus();
    }, [descriptionInputRef]);

    useEffect(() => {
        if (descriptions.some((d) => d.userId === user?.id)) {
            setDescribed(true);
        }
    }, [descriptions]);

    const onDescriptionInput = (event: ChangeEvent<HTMLInputElement>) => {
        setDescription(event.target.value);
    }

    const addDescription = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setDescription("");
        setDescribed(true);
        setVoted(false);
        socket.emit("addDescription", description);
    }

    const vote = (userId: string) => {
        if (voted) return;
        socket.emit("vote", { descriptionUserId: userId });
        setVoted(true);
    }

    const gameStateToText = (gameState: GameState) => {
        switch(gameState) {
            case GameState.Idle:
                return null;
            case GameState.Describe:
                return "Describe";
            case GameState.Vote:
                return "Vote";
            case GameState.Review:
                return "Review";
        }
    }

    const formClassNames = `w-50 ${ gameState === GameState.Describe ? null : "opacity-0"}`;

    return (
        <>
            <h3 className="mt-4">{ gameStateToText(gameState) }</h3>
            <Form onSubmit={addDescription} className={formClassNames}>
                <Form.Group>
                    <Form.Control
                        className="text-center mt-4"
                        required
                        placeholder="Describe the above meme..."
                        onInput={onDescriptionInput} 
                        value={description}
                        autoFocus
                        ref={descriptionInputRef}
                        disabled={described}
                    />
                </Form.Group>
            </Form>
            <div className="justify-content-center d-flex">
                <ListGroup variant="flush" className="descriptions w-50 overflow-scroll position-absolute mt-4">
                    { 
                        descriptions.map((d) => 
                            <ListGroup.Item key={d.userId} onClick={() => vote(d.userId)}>
                                {
                                    gameState === GameState.Describe && d.userId !== user?.id
                                        ? "..."
                                        : d.text
                                }
                                {
                                    (gameState === GameState.Vote
                                    && votes.some((v) => v.descriptionUserId === d.userId && v.userId === user?.id))
                                    || (gameState === GameState.Review
                                    && votes.some((v) => v.descriptionUserId === d.userId))
                                        ? <Badge bg="secondary" className="vote mx-4 position-absolute">{ votes.filter((v) => v.descriptionUserId === d.userId).length }</Badge>
                                        : null
                                }
                            </ListGroup.Item>
                        )
                    }
                </ListGroup>
            </div>
        </>
    );
}

export default Descriptions;