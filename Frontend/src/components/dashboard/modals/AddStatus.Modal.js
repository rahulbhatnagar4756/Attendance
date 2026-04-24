import React from "react";
import { Modal, Button } from "react-bootstrap";

function AddStatusAlert(props) {
    // const dispatch = useDispatch()
    return (
        <>
            <Modal show={props.open} onHide={() => props.close()} >
                <Modal.Header>
                    <Modal.Title  className="text-center">Alert!!!</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        Please Add Your Daily Status first
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => props.close()}>
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default AddStatusAlert;
