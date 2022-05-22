import { useContext, useEffect, useState } from "react";
import { Row } from "react-bootstrap";
import { useCookies } from "react-cookie";
import { useLocation, useParams } from "react-router-dom";
import { ActionTypes, StateContext } from "../../context";
import Chat from "./chat/Chat";
import Game from "./game/Game";
import { LocationState } from "./types";
import UsernamePopup from "./UsernamePopup";

function Room() {
    const locationState = useLocation().state as LocationState | null;
    const [ roomId, setRoomId ] = useState(locationState?.roomId);
    const [showNamePopup, setShowNamePopup] = useState(false);

    const [cookies, setCookie] = useCookies();
    const { socket, dispatch } = useContext(StateContext);
    const { roomName } = useParams();

    useEffect(() => {
        if (!roomName) {
            return;
        }

        dispatch({
            type: ActionTypes.SET_ROOM_NAME,
            roomName: roomName,
        });

        if (!roomId) {
            socket.on("roomExists", (payload) => {
                setRoomId(payload.roomId);
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

            dispatch({ type: ActionTypes.SET_USER, user: {
                id: userId,
                name: userName,
                roomName: roomName,
                isHost: isHost
            }});
        });

        socket.on("requestName", () => {
            setShowNamePopup(true);
        });

        if (cookies[roomId] && cookies[roomId].roomName === roomName) {
            joinRoom(roomName, cookies[roomId].userName, cookies[roomId].userId);
        } else {
            setShowNamePopup(true);
        }

        return () => {
            socket.off("requestName");
            socket.off("roomJoined");
        }
    }, [roomId]);

    const joinRoom = (roomName: string, name: string, userId?: string) => {
        socket.emit("joinRoom", { roomName: roomName, userName: name, userId: userId });
        setShowNamePopup(false);
    }

    return (
        <>
            { roomName && <UsernamePopup onJoinRoom={(name) => joinRoom(roomName, name)} show={showNamePopup}/> }
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