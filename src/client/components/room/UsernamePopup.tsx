import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

interface UsernamePopupProps {
    show: boolean;
    onJoinRoom: (name: string) => void;
}

function UsernamePopup(props: UsernamePopupProps) {
    const [name, setName] = useState("nils");
    const [showValidation, setShowValidation] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        nameInputRef.current?.focus();
    }, [nameInputRef]);

    const onNameInput = (event: ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    }

    const joinRoom = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget;
        if (form.checkValidity() !== false) {
            props.onJoinRoom(name);
        } else {
            setShowValidation(true);
        }
    }

    return (
        <Modal show={props.show} size="sm">
            <Form noValidate validated={showValidation} onSubmit={joinRoom}>
                <Modal.Header>
                    <Modal.Title>Enter name</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Control
                            className="text-center mb-2"
                            required
                            placeholder="Name"
                            onInput={onNameInput}
                            value={name}
                            autoFocus
                            ref={nameInputRef}
                        />
                    </Form.Group>
                    <Button variant="success" type="submit" className="w-100">
                        Continue
                    </Button>
                </Modal.Body>
            </Form>
        </Modal>
    );
}

export default UsernamePopup;