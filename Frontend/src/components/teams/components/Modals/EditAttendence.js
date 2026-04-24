import React, { useState } from "react";
import moment from "moment";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { httpClient } from "../../../../constants/Api";
import { ATTENDENCE } from "../../../../constants/AppConstants";

function EditAttendence(props) {
  const [values, setValues] = useState(props.data);

  const getTime = (time) => {
    return time ? moment(time).format("YYYY-MM-DDTHH:mm") : "";
  };

  const handleInTime = (e) => {
    // const data = values;
    // let checkIn = moment(data.check_in);
    // const time = moment(e.target.value, "HH:mm");
    // checkIn.set({
    //   hour: time.get("hour"),
    //   minute: time.get("minute"),
    //   second: time.get("second"),
    // });
    // data.check_in = checkIn;
    values.check_in = moment(e.target.value).format();
    setValues(values);
  };
  const handleCheckOut = (e) => {
    // let checkOut = moment(values.check_in);
    // const time = moment(e.target.value, "HH:mm");
    // checkOut.set({
    //   hour: time.get("hour"),
    //   minute: time.get("minute"),
    //   second: time.get("second"),
    // });
    // values.check_out = checkOut;
    values.check_out = moment(e.target.value).format();
    setValues(values);
  };

  const handleBreakStart = (e, br) => {
    const index = values.breaks.findIndex((b) => b._id === br._id);
    let newArray = [...values.breaks];
    // const time = moment(e.target.value, "HH:mm");
    const breakStart = moment(e.target.value).format();
    // breakStart.set({
    //   hour: time.get("hour"),
    //   minute: time.get("minute"),
    //   second: time.get("second"),
    // });
    newArray[index] = { ...newArray[index], start: breakStart };
    values.breaks = newArray;
    setValues(values);
  };

  const handleBreakEnd = (e, br) => {
    const index = values.breaks.findIndex((b) => b._id === br._id);
    let newArray = [...values.breaks];
    // const time = moment(e.target.value, "HH:mm");
    const breakEnd = moment(e.target.value).format();
    // breakEnd.set({
    //   hour: time.get("hour"),
    //   minute: time.get("minute"),
    //   second: time.get("second"),
    // });
    newArray[index] = { ...newArray[index], end: breakEnd };
    values.breaks = newArray;
    setValues(values);
  };

  const handleSubmit = async () => {
    try {
      await httpClient
        .put(ATTENDENCE.UPDATE_ATTENDENCE.replace("{id}", props.userId), values)
        .then((res) => {
            toast.success(res.data.message);
          props.close();
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
  };

  return (
    <>
      <Modal
        show={props.open}
        onHide={props.close}
        keyboard={false}
        size="md"
        centered
      >
        <Modal.Header className="border-0">
          <h5 className="modal-title" id="exampleModalLabel">
            Update Time
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
          <div className="row mb-4">
            <div className="col-md-6">
              <label>In Time</label>
              <input
                type="datetime-local"
                max={getTime(values.check_out)}
                className="form-control"
                placeholder="10:00 AM"
                defaultValue={getTime(values.check_in)}
                onChange={(e) => handleInTime(e)}
              />
            </div>
            <div className="col-md-6">
              <label>Out Time</label>
              <input
                type="datetime-local"
                min={getTime(values.check_in)}
                name="check_out"
                className="form-control"
                placeholder="07:00 PM"
                defaultValue={getTime(values.check_out)}
                onChange={(e) => handleCheckOut(e)}
              />
            </div>
          </div>
          {values.breaks?.map((br, i) => (
            <div className="row mb-4" key={i}>
              <div className="col-md-6">
                <label>Break {i + 1} IN</label>
                <input
                  type="datetime-local"
                  max={getTime(br.end)}
                  className="form-control"
                  placeholder="10:00 AM"
                  defaultValue={getTime(br.start)}
                  onChange={(e) => handleBreakStart(e, br)}
                />
              </div>
              <div className="col-md-6">
                <label>Break {i + 1} OUT</label>
                <input
                  type="datetime-local"
                  min={getTime(br.end)}
                  className="form-control"
                  placeholder="07:00 PM"
                  defaultValue={getTime(br.end)}
                  onChange={(e) => handleBreakEnd(e, br)}
                />
              </div>
            </div>
          ))}
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
            onClick={() => handleSubmit()}
          >
            Save changes
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default EditAttendence;
