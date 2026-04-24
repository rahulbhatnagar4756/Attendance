import React from "react";
import { Modal, Button } from "react-bootstrap";

function ViewDailyStatusModal(props) {
    const {
        show,
        onHide,
    } = props;

    return (
        <>
            <Modal show={show} onHide={onHide}  centered>
                <Modal.Header>
                    <Modal.Title>{show?.subject}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p dangerouslySetInnerHTML={{
                        __html: show?.message
                            .replaceAll("&lt;", "<")
                            .replaceAll("&gt;", ">"),
                    }}></p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ViewDailyStatusModal;
