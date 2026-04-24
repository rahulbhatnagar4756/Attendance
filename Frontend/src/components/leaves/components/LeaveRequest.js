import React, { useState, useEffect } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import DateRangePicker from "react-bootstrap-daterangepicker";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-daterangepicker/daterangepicker.css";
import { httpClient } from "../../../constants/Api";
import { LEAVES, ORGANISATION } from "../../../constants/AppConstants";
import Select from 'react-select';
import { FileUploader } from 'react-drag-drop-files';

const initialState = {
  from: moment(),
  to: moment(),
  start_time: "",
  end_time: "",
  type: "",
  duration: "",
  comp_off_date: "",
  leave_reason: "",
  approved_by: ""
};

function LeaveRequest() {
  const [values, setValues] = useState(initialState);
  const [startFrom, setStartFrom] = useState("");
  const [error, setError] = useState({
    typeError: "",
    textError: "",
    dateError: "",
    endTimeError: "",
  });
  const [loading, setLoading] = useState(false);
  const [tempUsername, setTempUsername] = useState();
  const [options, setOptions] = useState();
  const [userId, setUserId] = useState();
  const [selectedUser, setSelectedUser] = useState([]);
  const [previousSelectedUser, setPreviousSelectedUser] = useState('');

  useEffect(() => {
    getUsers();
  }, []);

  const fileTypes = ['JPG', 'PNG', 'JPEG', 'PDF', 'GIF', 'DOC', 'DOCX'];

  const handleDateRange = async (event, picker) => {
    setValues({ ...values, from: picker.startDate, to: picker.endDate });
    if (moment(picker.startDate) < moment().subtract(1, "month")) {
      setError({ ...error, dateError: "Please select date within 1 month" });
    } else {
      setError({ ...error, dateError: "" });
    }
  };

  const handleEndTime = (e) => {
    const timeDiff = moment(e.target.value, "hh:mm").diff(
      moment(values.start_time, "hh:mm"),
      "m"
    );
    if (values.type === "Half Day" && (timeDiff > 240 || timeDiff < 0)) {
      setError({ ...error, endTimeError: "You can't apply more than 4 hours" });
    } else if (
      values.type === "Short Day" &&
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
    } else if(checkValues.approved_by.trim() === ""){
      toast.error("Please select requested to from user list");
      check = false;
    } else if (error.dateError) {
      check = false;
    } else if (
      values.duration === "Half Day" &&
      (timeDiff > 240 || timeDiff < 0)
    ) {
      setError({ ...error, endTimeError: "you can't apply more than 4 hours" });
      check = false;
    } else if (
      values.duration === "Short Day" &&
      (timeDiff > 120 || timeDiff < 0)
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
    const isValid = valid();
    if (isValid) {
      setLoading(true);
      if (values.duration === "Half Day" || values.duration === "Short Day") {
        values.from = startFrom;
        values.to = startFrom;
      }
      if (values.duration === "Full Day") {
        values.from = startFrom ? startFrom : moment(values.from).format();
        values.to = startFrom ? startFrom : moment(values.to).format();
        delete values.start_time;
        delete values.end_time;
      }
      if (values.type !== "Comp Off") {
        delete values.comp_off_date;
      }
      const formData = new FormData();
      for (let key of Object.keys(values)) {
          formData.append([key], values[key]);
      }
      try {
        await httpClient
          // .post(LEAVES.APPLY, values)
          .post(LEAVES.APPLY, formData)
          .then((res) => {
            if (res.status === 200) {
              toast.success(res.data.message);
              setValues(initialState);
              setSelectedUser([]);
              getUsers();
              setLoading(false);
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
      } catch (err) {
        console.log(err);
      }
    }
  };

  const getUsers = async () => {
    try {
      const users = await httpClient.get(ORGANISATION.GET_ALL_EMPLOYEES);
      const usersList = users.data.result;
      const Labels = usersList.map((data) => {
        return { label: `${data.name} (${data.emp_id})`, value: '' };
      });
      const LabelswithId = usersList.map((data) => {
        return { label: `${data.name} (${data.emp_id})`, value: data.id };
      });
      setUserId(LabelswithId);
      setOptions(Labels);
    } catch (err) {
      if (err.response) toast.error(err.response.data.message);
      else toast.error('Error in fetching user detail');
    }
  };

  const handleChange = (event, index) => {
    setPreviousSelectedUser(event);
    const id = userId.find(({ label }) => label === event.label);
    const selectedUserIndex = options.findIndex((x) => x.label === id.label);
    if (selectedUserIndex >= 0) {
      options.splice(selectedUserIndex, 1);
    }
    // setSelectedUser((selectedUser) => [...selectedUser, id.value]);
    setSelectedUser([id.value]);
    setValues({...values, approved_by: id.value});
    if (previousSelectedUser) {
      options.push(previousSelectedUser);
    }
  };

  const handleRemove = (index, id) => {
    const removedUserData = userId.find((x) => x.value === id);
    const removedUser = { label: removedUserData.label, value: '' };
    options.push(removedUser);
    const remainingSelectedUser = [...selectedUser];
    remainingSelectedUser.splice(index, 1);
    setSelectedUser(remainingSelectedUser);
    setValues({...values, approved_by: ''});
    setPreviousSelectedUser('');
  };

  const handleFileChange = (file) => {
    setValues({ ...values, file_name: file.name, sick_leave_attachment: file });
  };

  const Styles = {
    container: (provided) => ({
      ...provided,
      minWidth: '45%',
      marginTop: '8px',
    }),
  };

  return (
    <>
      <div className="main_content_panel">
        <div className="header_title">
          <h1>
            Leave<span> Request</span>
          </h1>
        </div>
        <div className="row">
          <div className="col-lg-8 mb-4">
            <div className="dashboard_card">
              <div className="employee_profile">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="mb-4 col-lg-6">
                      <label
                        htmlFor="exampleInputEmail1"
                        className="form-label"
                      >
                        Type
                      </label>
                      <select
                        required
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
                      >
                        <option value="">Select...</option>
                        <option value="Leave">Leave</option>
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Comp Off">Comp Off</option>
                        <option value="Maternity Leave">Maternity Leave</option>
                      </select>

                      <small className="text-danger">{error.typeError}</small>
                    </div>
                    <div className="mb-4 col-lg-6">
                      <label
                        htmlFor="exampleInputEmail1"
                        className="form-label"
                      >
                        Duration
                      </label>
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

                      <small className="text-danger">{error.typeError}</small>
                    </div>

                    {values.duration !== "Full Day" && (
                      <div className="mb-4 col-lg-6">
                        <label
                          htmlFor="exampleInputEmail1"
                          className="form-label"
                        >
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
                        <label
                          htmlFor="exampleInputEmail1"
                          className="form-label"
                        >
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
                        <small className="text-danger">
                          {error.endTimeError}
                        </small>
                      </div>
                    )}
                    <div className="mb-4 col-lg-6">
                      <label
                        htmlFor="exampleInputEmail1"
                        className="form-label"
                      >
                        Leave Date
                      </label>
                      {(values.duration === "Full Day" ||
                        values.duration === "") &&
                        values.type !== "Comp Off" && (
                          <DateRangePicker
                           editableDateInputs={true}
                            onApply={handleDateRange}
                            initialSettings={{
                              startDate: values.from,
                              endDate: values.to,
                            }}
                            required
                          >
                            <input type="text" className="form-control" />
                          </DateRangePicker>
                        )}
                      {(values.type === "Comp Off" ||
                        values.duration === "Short Day" ||
                        values.duration === "Half Day") && (
                        <input
                          type="date"
                          value={startFrom}
                          onChange={(e) => setStartFrom(e.target.value)}
                          required
                          className="form-control"
                        />
                      )}
                      <small className="text-danger">{error.dateError}</small>
                    </div>
                    {values.type === "Comp Off" && (
                      <div className="mb-4 col-lg-6">
                        <label
                          htmlFor="exampleInputEmail1"
                          className="form-label"
                        >
                          Comp Off Date
                        </label>
                        <input
                          required
                          type="date"
                          className="form-control"
                          placeholder="Date"
                          max={
                            !startFrom || moment(startFrom) > moment()
                              ? moment().subtract(1, "day").format("YYYY-MM-DD")
                              : moment(startFrom)
                                  .subtract(1, "day")
                                  .format("YYYY-MM-DD")
                          }
                          value={values.comp_off_date}
                          onChange={(e) =>
                            setValues({
                              ...values,
                              comp_off_date: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}
                    <div className="mb-4 col-lg-12">
                      <label
                        htmlFor="exampleInputEmail1"
                        className="form-label"
                      >
                        Leave Reason
                      </label>
                      <textarea
                        required
                        row="3"
                        className="form-control"
                        placeholder="Enter Reason"
                        value={values.leave_reason}
                        onChange={(e) => {
                          setValues({
                            ...values,
                            leave_reason: e.target.value,
                          });
                          setError({ ...error, textError: "" });
                        }}
                      ></textarea>
                      <small className="text-danger">{error.textError}</small>
                    </div>
                    <div className="select_role">
                      <div className="head-title-wrap">
                        <label className="form-label m-0 pe-4">Requested To</label>
                      </div>
                      <div className="mt-2">
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                          }}
                        >
                          {selectedUser &&
                            userId &&
                            selectedUser?.map((item, index) => (
                              <div
                                className="boxed"
                                style={{
                                  borderRadius: '4px',
                                  marginBottom: '10px',
                                  marginRight: '10px',
                                  padding: '4px 8px',
                                  backgroundColor: 'lightgray',
                                }}
                              >
                                {userId.find((opt) => opt.value === item).label}
                                {item ? (
                                  <i
                                    className="fa fa-close mx-2"
                                    aria-hidden="true"
                                    style={{
                                      fontSize: '20px',
                                      color: 'grey',
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => handleRemove(index, item)}
                                  ></i>
                                ) : null}
                              </div>
                            ))}
                        </div>
                        {options && (
                          <div>
                            <div
                              style={{
                                // display: 'flex',
                                marginBottom: '1rem',
                                alignItems: 'center',
                              }}
                            >
                              <Select
                                isSearchable={true}
                                closeMenuOnSelect={true}
                                styles={Styles}
                                menuPosition={'scroll'}
                                placeholder="search user"
                                value={tempUsername}
                                options={options}
                                onChange={(e) => {
                                  handleChange(e);
                                  setTempUsername(e.target ? e.target.value : '');
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {values.type === "Sick Leave" && (
                      <div className="col-md-12 mb-3">
                        <label
                          htmlFor="sickLeaveAttachment"
                          className="form-label"
                        >
                          Attach Medical Documents (If Any)
                        </label>
                        <FileUploader
                          classes="drop_area sick_leave_attachment"
                          label="Upload File here"
                          name="sick_leave_attachment"
                          handleChange={handleFileChange}
                          types={fileTypes}
                          style={{ width: '100%' }}
                        />
                        { values.file_name ? 
                          <div className="mt-2 d-flex align-items-start">
                            <p style={{wordBreak: 'break-all', fontSize: '15px'}}>Selected File Name: <b>{values.file_name}</b></p>
                          </div>
                          : ""
                        }
                      </div>
                    )}
                    <div className="col-lg-12">
                      {loading ? (
                        <button
                          className="btn btn-leave_status"
                          style={{ width: "222px" }}
                          disabled
                        >
                          <div
                            className="spinner-border text-light"
                            style={{ width: "1.3em", height: "1.3em" }}
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </button>
                      ) : (
                        <button type="submit" className="btn btn-leave_status">
                          Submit Leave Request
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LeaveRequest;
