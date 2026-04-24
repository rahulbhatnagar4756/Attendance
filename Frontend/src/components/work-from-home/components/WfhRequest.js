import React, { useState, useEffect } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import DateRangePicker from "react-bootstrap-daterangepicker";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-daterangepicker/daterangepicker.css";
import { httpClient } from "../../../constants/Api";
import { WORK_FROM_HOME, ORGANISATION } from "../../../constants/AppConstants";
import Select from 'react-select';

const initialState = {
  from: moment(),
  to: moment(),
  wfh_reason: "",
  approved_by: ""
};

function WfhRequest() {
  const [values, setValues] = useState(initialState);
  const [error, setError] = useState({
    textError: "",
    dateError: "",
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

  const handleDateRange = async (event, picker) => {
    setValues({ ...values, from: picker.startDate, to: picker.endDate });
    if (moment(picker.startDate) < moment().subtract(1, "month")) {
      setError({ ...error, dateError: "Please select date within 1 month" });
    } else {
      setError({ ...error, dateError: "" });
    }
  };


  const valid = () => {
    let check = true;
    const checkValues = values;
    if (checkValues.wfh_reason.trim() === "") {
      setError({ ...error, textError: "Please enter reason" });
      check = false;
    } else if(checkValues.approved_by.trim() === ""){
      toast.error("Please select requested to from user list");
      check = false;
    } else if (error.dateError) {
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
      // const formData = new FormData();
      // for (let key of Object.keys(values)) {
      //     formData.append([key], values[key]);
      // }
      try {
        await httpClient
          .post(WORK_FROM_HOME.APPLY, values)
          // .post(WORK_FROM_HOME.APPLY, formData)
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
            Work From Home<span> Request</span>
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
                        WFH Date
                      </label>
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
                    </div>
                    <div className="mb-4 col-lg-12">
                      <label
                        htmlFor="exampleInputEmail1"
                        className="form-label"
                      >
                        WFH Reason
                      </label>
                      <textarea
                        required
                        row="3"
                        className="form-control"
                        placeholder="Enter Reason"
                        value={values.wfh_reason}
                        onChange={(e) => {
                          setValues({
                            ...values,
                            wfh_reason: e.target.value,
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
                          Submit WFH Request
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

export default WfhRequest;
