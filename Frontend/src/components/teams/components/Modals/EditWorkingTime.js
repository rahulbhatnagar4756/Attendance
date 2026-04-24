import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { USER } from "../../../../constants/AppConstants";
import { httpClient } from "../../../../constants/Api";

function EditWorkingTime(props) {
  const [values, setValues] = useState({
    in_time: props.data.in_time,
    out_time: props.data.out_time,
  });

  const handleSubmit = async () => {
    try {
      await httpClient
        .put(USER.UPDATE_USER.replace("{id}", props.userId), values)
        .then((res) => {
          if (res.status === 200) {
            toast.success(res.data.message);
            props.close();
          }
        })
        .catch((err) => {
          if (err.response) {
            toast.error(err.response.data.message);
          } else {
            toast.error("Something went wrong");
          }
        });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <Modal
        show={props.show}
        onHide={props.close}
        keyboard={false}
        size="md"
        centered
      >
        <Modal.Header className="border-0">
          <h5 className="modal-title" id="exampleModalLabel">
            Request for time change
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
            <div className="col-md-6">
              <label>In Time</label>
              <input
                type="time"
                className="form-control"
                placeholder="10:00 AM"
                value={values.in_time}
                onChange={(e) =>
                  setValues({ ...values, in_time: e.target.value })
                }
              />
            </div>
            <div className="col-md-6">
              <label>Out Time</label>
              <input
                type="time"
                className="form-control"
                placeholder="07:00 PM"
                value={values.out_time}
                onChange={(e) =>
                  setValues({ ...values, out_time: e.target.value })
                }
              />
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
          <button
            type="button"
            className="btn btn-submit "
            onClick={handleSubmit}
          >
            Save changes
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default EditWorkingTime;
