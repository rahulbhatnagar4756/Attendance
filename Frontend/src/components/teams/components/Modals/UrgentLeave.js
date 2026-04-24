import React, { useState } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { Modal } from "react-bootstrap";
import { httpClient } from "../../../../constants/Api";
import { LEAVES } from "../../../../constants/AppConstants";

function UrgentLeave(props) {
  const [values, setValues] = useState([]);
  const [error, setError] = useState({
    typeError: "",
    textError: "",
    dateError: "",
    endTimeError: "",
  });

  const handleEndTime = (e) => {
    const timeDiff = moment(e.target.value, "hh:mm").diff(
      moment(values.start_time, "hh:mm"),
      "m"
    );
    if (values.duration === "Half Day" && (timeDiff > 240 || timeDiff < 0)) {
      setError({ ...error, endTimeError: "You can't apply more than 4 hours" });
    } else if (
      values.duration === "Short Day" &&
      (timeDiff > 120 || timeDiff < 0)
    ) {
      setError({ ...error, endTimeError: "You can't apply more than 2 hours" });
    } else {
      setValues({ ...values, end_time: e.target.value });
      setError({ ...error, endTimeError: "" });
    }
  };
  const valid = () => {
    let check = true;
    const checkValues = values;
    const timeDiff = moment(values.end_time, "hh:mm").diff(
      moment(values.start_time, "hh:mm"),
      "m"
    );
    if (!checkValues.type) {
      setError({ ...error, typeError: "Please select leave type" });
      check = false;
    } else if (checkValues.leave_reason.trim() === "") {
      setError({ ...error, textError: "Please enter reason" });
      check = false;
    } else if (error.dateError) {
      check = false;
    } else if (
      values.duration === "Half Day" &&
      (timeDiff > 240 || timeDiff < 0 || Number.isNaN(timeDiff))
    ) {
      setError({ ...error, endTimeError: "you can't apply more than 4 hours" });
      check = false;
    } else if (
      values.duration === "Short Day" &&
      (timeDiff > 120 || timeDiff < 0 || Number.isNaN(timeDiff))
    ) {
      setError({ ...error, endTimeError: "you can't apply more than 2 hours" });
      check = false;
    } else {
      setError("");
      check = true;
    }
    return check;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData=JSON.parse(localStorage.getItem('user'));
    const isValid = valid();
    values.from = moment().format();
    values.to = moment().format();
   values.approved_by =userData.user.id;
    values.status = "approved";
    if (isValid) {
      try {
        await httpClient
          .post(LEAVES.URGENT_LEAVE.replace("{id}", props.userId), values)
          .then((res) => {
            if (res.status === 200) {
                toast.success(res.data.message);
              props.close();
              props.handleUserOnLeave();
            }
          })
          .catch((err) => {
            if (err.response) {
                toast.error(err.response.data.message);
            } else {
                toast.error("Something went wrong");
            }
          });
      } catch (err) {
        console.log(err);
      }
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
        <form onSubmit={handleSubmit}>
          <Modal.Header className="border-0">
            <h5 className="modal-title" id="exampleModalLabel">
              Grant Urgent Leave
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
              <div className="mb-4 col-md-6">
                <label className="form-label">Type</label>
                <select
                  className="form-control"
                  aria-label="Default select example"
                  value={values.type}
                  onChange={(e) => {
                    const leaveType = e.target.value;
                    if(leaveType === "Maternity Leave"){
                      setValues({...values, type: leaveType, duration: 'Full Day'})
                    }else{
                      setValues({ ...values, type: leaveType, duration: "" })
                    }
                  }}
                  required
                >
                  <option value="">Select...</option>
                  <option value="Leave">Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Comp Off">Comp Off</option>
                  <option value="Maternity Leave">Maternity Leave</option>
                </select>
              </div>
              <div className="mb-4 col-md-6">
                <label className="form-label">Duration</label>
                <select
                  className="form-control"
                  aria-label="Default select example"
                  value={values.duration}
                  disabled = {values.type === "Maternity Leave" ? true : false}
                  onChange={(e) =>
                    setValues({ ...values, duration: e.target.value })
                  }
                  required
                >
                  <option value="">Select...</option>
                  <option value="Short Day">Short Day</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Full Day">Full Day</option>
                </select>
              </div>
              {values.duration !== "Full Day" && (
                <div className="mb-4 col-lg-6">
                  <label htmlFor="exampleInputEmail1" className="form-label">
                    Leave Start Time
                  </label>
                  <input
                    required
                    type="time"
                    className="form-control"
                    placeholder="Time From"
                    value={values.start_time}
                    onChange={(e) =>
                      setValues({ ...values, start_time: e.target.value })
                    }
                  />
                </div>
              )}
              {values.duration !== "Full Day" && (
                <div className="mb-4 col-lg-6">
                  <label htmlFor="exampleInputEmail1" className="form-label">
                    Leave End Time
                  </label>
                  <input
                    required
                    type="time"
                    className="form-control"
                    placeholder="Time To"
                    value={values.end_time}
                    onChange={handleEndTime}
                  />
                  <small className="text-danger">{error.endTimeError}</small>
                </div>
              )}
              {values.type === "Comp Off" && (
                <div className="mb-4 col-lg-6">
                  <label htmlFor="exampleInputEmail1" className="form-label">
                    Comp Off Date
                  </label>
                  <input
                    required
                    type="date"
                    className="form-control"
                    placeholder="Date"
                    max={moment().subtract(1, "day").format("YYYY-MM-DD")}
                    value={values.comp_off_date}
                    onChange={(e) =>
                      setValues({ ...values, comp_off_date: e.target.value })
                    }
                  />
                </div>
              )}
              <div className="col-md-12">
                <label>Leave Reason</label>
                <textarea
                  required
                  rows="4"
                  className="form-control"
                  value={values.leave_reason}
                  onChange={(e) => {
                    setValues({ ...values, leave_reason: e.target.value });
                    setError({ ...error, textError: "" });
                  }}
                />
                <small className="text-danger">{error.textError}</small>
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

export default UrgentLeave;
