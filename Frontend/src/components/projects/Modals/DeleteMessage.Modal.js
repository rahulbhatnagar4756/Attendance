import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { PROJECT } from "../../../constants/AppConstants";
import { httpClient } from "../../../constants/Api";

function DeleteMessageModal(props) {
  const { show, onHide} = props;
  const messageId = show.messageId;

  const deleteMessage = async () => {

    try {
        const res = await httpClient
            .delete(PROJECT.DELETE_MESSAGE.replace("{messageId}", messageId))
        if (res.status === 200) {
            toast.success(" Message Deleted Sucessfully");
            onHide();
        }
    } catch (err) {
        if (err.response) {
            toast.error(err.response.data.message);
        } else {
            toast.error("Something went wrong");
        }
    }
};
  return (
    <>
      <Modal show={show} onHide={onHide}>
        <Modal.Header>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ paddingBottom: "10px" }}>
            Are you sure you want to delete this Message?
          </div>
          </Modal.Body>
          <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            No
          </Button>
          <Button variant="primary" onClick={deleteMessage}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DeleteMessageModal;
