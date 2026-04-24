import React, { useState } from "react";
import { Modal } from "react-bootstrap";

function RejectWorkFromHome(props) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault();
    const valid = validData()
    if (valid) {
      props.rejectWfh(reason);
    }
  };

  const validData = () => {
    let valid = true;
    if (reason.trim() === "") {
      setError("Please enter rejection reason")
      valid = false
    }
    return valid;
  }

  return (
    <>
      <Modal
        show={props.open}
        onHide={props.close}
        keyboard={false}
        size="md"
        centered
      >
        <form onSubmit={handleSubmit}>
          <Modal.Header className="border-0">
            <h5 className="modal-title" id="exampleModalLabel">
              WFH Rejection reason
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={props.close}
            ></button>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col-md-12">
                <label>Enter Reason</label>
                <textarea
                  required
                  rows="4"
                  className="form-control"
                  value={reason}
                  onChange={(e) => { setReason(e.target.value); setError("") }}
                />
                <small className="text-danger">{error}</small>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={props.close}
            >
              Close
            </button>
            <button type="submit" className="btn btn-submit ">
              Submit
            </button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}

export default RejectWorkFromHome;