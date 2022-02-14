import React from "react";
import { Col, Row, Button } from "react-bootstrap";
import "./start.css";

class Start extends React.Component {
    render() {
        return (
            <>
                <Row className="pt-4">
                    <Col className="text-center">
                        <h1 className="display-1 text-light">Describe-A-Meme</h1>
                    </Col>
                </Row>
                <Row className="h-75">
                    <Col className="text-center my-auto">
                        <Button className="btn-lg btn-success btn-block">Start a new game!</Button>
                    </Col>
                </Row>
            </>
        );
    }
}

export default Start;