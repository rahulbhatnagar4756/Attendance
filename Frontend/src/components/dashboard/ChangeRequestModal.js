import React, { useEffect, useState } from "react";
import moment from "moment";
import { Modal } from "react-bootstrap";
import { REQUEST } from "../../constants/AppConstants";
import { toast } from "react-toastify";
import { httpClient } from "../../constants/Api";
import { useSelector } from "react-redux";

function ChangeRequestModal(props) {
  const data = props.data;
  const userDetail = useSelector((state) => state.user.user.user);
  const [values, setValues] = useState("");
  const [totalWorkHour, setTotalWorkHour] = useState("");
  const [employeeRegex, setEmployeeRegex] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let breakTime = [];
    data.result?.breaks?.map((getTime) => {
      const startTime = moment(getTime.start);
      const endTime = getTime.end ? moment(getTime.end) : 
      moment(getTime.start)
      // moment(
      //   moment(data.result.check_in).format("YYYY-MM-DD") +
      //   userDetail.out_time,
      //   "YYYY-MM-DD hh:mm"
      // );
      const mins = endTime.diff(startTime, "s");
      breakTime.push(mins);
    })
    let totalBreak = breakTime.reduce((a, b) => a + b, 0);
    if (data.result) {
      if (
          //  !data.result.check_out && moment(data.result.entry_date).isBefore(moment().format("YYYY-MM-DD"))
          ((data.result.breaks && data.result.breaks.length === 0 && !data.result.check_out) || 
              (!data.result.check_out && data.result.breaks && data.result.breaks.length > 0 && (!(data.result.breaks[data.result.breaks.length-1].end) ||
                    moment(data.result.breaks[data.result.breaks.length-1].end).isBefore(moment(data.result.check_in).format("YYYY-MM-DD") +
                    "T" + userDetail.out_time,"YYYY-MM-DDTHH:mm:ss"))))  && moment(data.result.entry_date).isBefore(moment().format("YYYY-MM-DD"))
         ) 
        {
        const checkIN = moment(data.result.check_in);
        const checkOut = moment(
          moment(data.result.check_in).format("YYYY-MM-DD") +
          userDetail.out_time,
          "YYYY-MM-DD hh:mm"
        );

        let totalWorking = checkOut.diff(checkIN, "s"); 
        const working = totalWorking-totalBreak; 
        var workingHours = working / 3600;
        var totalWorkingHour = Math.floor(workingHours);
        var totalWorkingMin = (workingHours - totalWorkingHour) * 60;
        data.totalWorkingTime =
          totalWorkingHour +
          ":" +
          (totalWorkingMin < 10
            ? "0" + Math.floor(totalWorkingMin)
            : Math.floor(totalWorkingMin));
        setTotalWorkHour(data.totalWorkingTime);
      }else if(!data.result.check_out && data.result.breaks && data.result.breaks.length > 0 && data.result.breaks[data.result.breaks.length-1].end &&
        moment(data.result.breaks[data.result.breaks.length-1].end).isAfter(moment(data.result.check_in).format("YYYY-MM-DD") +
        "T" + userDetail.out_time,"YYYY-MM-DDTHH:mm:ss") && moment(data.result.entry_date).isBefore(moment().format("YYYY-MM-DD"))){
        const checkIN = moment(data.result.check_in);
        // const checkOut = moment(
        //   moment(data.result.check_in).format("YYYY-MM-DD") +
        //   userDetail.out_time,
        //   "YYYY-MM-DD hh:mm"
        // );
        const checkOut = moment(data.result.breaks[data.result.breaks.length-1].end);

        let totalWorking = checkOut.diff(checkIN, "s"); 
        const working = totalWorking-totalBreak; 
        var workingHours = working / 3600;
        var totalWorkingHour = Math.floor(workingHours);
        var totalWorkingMin = (workingHours - totalWorkingHour) * 60;
        data.totalWorkingTime =
          totalWorkingHour +
          ":" +
          (totalWorkingMin < 10
            ? "0" + Math.floor(totalWorkingMin)
            : Math.floor(totalWorkingMin));
        setTotalWorkHour(data.totalWorkingTime);
      }
    }
  }, []);

  const sendRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    values.request_message = values.request_message.trim();
    if (!values.request_message) {
      setEmployeeRegex("Please enter the message blank spaces is not allowed.");
      return false;
    }
    values.attendence_id = data.result ? data.result._id : " ";
    values.user_id = data.user_id ? data.user_id : "";
    values.date = moment(props.date);
    values.type = "Change Request";
    await httpClient
      .post(REQUEST.POST_REQUEST, values)
      .then((res) => {
        if (res.status === 200) {
          toast.success("Request send successfully");
          props.close();
        }
      })
      .catch((err) => {
        if (err.response) {
          toast.error(err.response.data.message);
        } else {
          toast.error("Something went wrong");
        }
        setLoading(false);
      });
  };
  return (
    <>
      <Modal
        show={props.show}
        onHide={props.close}
        keyboard={false}
        centered
        size="lg"
        backdrop="static"
      >
        <form onSubmit={sendRequest}>
          <Modal.Header className="border-0">
            <h5 className="modal-title" id="exampleModalLabel">
              {moment(props.date).format("D MMMM Y")}
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={() => props.close()}
            />
          </Modal.Header>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-6">
                <ul className="day_info">
                  <li>
                    <div className="details_q">
                      <p>In Time</p>
                    </div>
                    <div className="details_a">
                      <p className="color_green">
                        {data.result?.check_in
                          ? moment(data.result?.check_in).format("LT")
                          : "-- : --"}
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="details_q">
                      <p>Out Time</p>
                    </div>
                    <div className="details_a">
                      <p className="color_red">
                        {data.result ? data.result.check_out ? moment(data.result.check_out).format("LT") :
                          !data.result.check_out && data.result.breaks && data.result.breaks.length > 0 && data.result.breaks[data.result.breaks.length-1].end
                           && moment(data.result.breaks[data.result.breaks.length-1]?.end).isAfter(moment(
                              moment(data.result.check_in).format("YYYY-MM-DD") + "T" + userDetail.out_time, "YYYY-MM-DDTHH:mm:ss")) 
                           && moment(data.result.entry_date).isBefore(moment().format("YYYY-MM-DD")) ?
                              moment(data.result.breaks[data.result.breaks.length-1]?.end).format("hh:mm A") :
                              (!data.result.breaks[data.result.breaks.length-1]?.end || !data.result.check_out) 
                           &&  moment(data.result.entry_date).isBefore(moment().format("YYYY-MM-DD")) ?
                              moment(moment().format("YYYY-MM-DD") + userDetail.out_time,"YYYY-MM-DD hh:mm").format("hh:mm A"):
                              "-- : --"
                          : "-- : --"}
                      </p>
                      {/* <p className="color_red">
                        {data.result
                          ? !data.result.check_out &&
                            moment(data.result.entry_date).isBefore(
                              moment().format("YYYY-MM-DD")
                            )
                            ? moment(
                              moment().format("YYYY-MM-DD") +
                              userDetail.out_time,
                              "YYYY-MM-DD hh:mm"
                            ).format("hh:mm A")
                            : data.result.check_out
                              ? moment(data.result.check_out).format("LT")
                              : "-- : --"
                          : "-- : --"}
                      </p> */}
                    </div>
                  </li>
                  <li>
                    <div className="details_q">
                      <p>Breaks</p>
                    </div>
                    <div className="details_a">
                      {data.result?.breaks.map((br, i) => (
                        <div key={i}>
                          <p className="color_orange">
                            {br?.start
                              ? moment(br?.start).format("LT")
                              : "-- : -- : --"}{" "}
                            -{" "}
                            {
                              br.end ? moment(br?.end).format("LT") : "--:--"
                            }
                            {/* {br?.end
                              ? moment(br?.end).format("LT")
                              : moment(data.result.entry_date).isBefore(moment().format("YYYY-MM-DD")) ? 
                              moment(
                                moment(data.result.check_in).format(
                                  "YYYY-MM-DD"
                                ) + userDetail.out_time,
                                "YYYY-MM-DD hh:mm"
                              ).format("hh:mm A")
                               : ""} */}
                          </p>
                        </div>
                      ))}
                    </div>
                  </li>
                  <li>
                    <div className="details_q">
                      <p>Total Time</p>
                    </div>
                    <div className="details_a">
                      <p className="color_blue">
                        {data.result
                          ? data.result.working_hours
                            ? data.result.working_hours
                            : totalWorkHour
                          : totalWorkHour}{" "}
                        (HH:MM)
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    rows="6"
                    id="message-text"
                    required
                    placeholder="Send a change request"
                    value={values.request_message}
                    onChange={(e) =>
                      setValues({ ...values, request_message: e.target.value })
                    }
                  />
                  <small style={{ color: "red" }} role="alert">
                    {employeeRegex}
                  </small>
                </div>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="border-0 modal-footer pt-0">
              <button
                type="button"
                className="btn btn-submit "
                disabled
                style={{ width: "121px" }}
              >
                {" "}
                <div
                  className="spinner-border text-light"
                  style={{ width: "1.3em", height: "1.3em" }}
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              </button>
            </div>
          ) : (
            <div className="border-0 modal-footer pt-0">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={props.close}
              >
                Close
              </button>
              <button type="submit" className="btn btn-submit ">
                Save changes
              </button>
            </div>
          )}
        </form>
      </Modal>
    </>
  );
}

export default ChangeRequestModal;
