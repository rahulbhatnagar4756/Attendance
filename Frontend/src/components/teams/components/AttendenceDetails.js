import react, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
// import { toast } from "react-toastify";
import moment from "moment";
import { useSelector } from "react-redux";
import DateRangePicker from "react-bootstrap-daterangepicker";
import "font-awesome/css/font-awesome.min.css";
import "../../../assets/css/dashboard.css";
import { ATTENDENCE, USER, LEAVES } from "../../../constants/AppConstants";
import { toast } from "react-toastify";
import { httpClient } from "../../../constants/Api";
import LeavesApplied from "./AttendenceComponent/LeavesApplied";
import EditWorkingTime from "./Modals/EditWorkingTime";
import UrgentLeave from "./Modals/UrgentLeave";
import EditAttendence from "./Modals/EditAttendence";
import ConfirmDialog from "./Modals/ConfirmDialog";

const AttendenceDetails = () => {
  const ref = useRef();
  const userDetail = useSelector((state) => state.user.user.user);
  //   // const [date, setDate] = useState({ start: moment(), end: moment() });
  const { userId } = useParams();
  const [user, setUser] = useState("");
  const [currentSession, setCurrentSession] = useState("");
  const [attendenceDetail, setAttendenceDetail] = useState([]);
  const [openEditWorkTimeModal, setOpenEditWorkTimeModal] = useState(false);
  const [urgentLeaveModal, setUrgentLeaveModal] = useState(false);
  const [editAttendence, setEditAttendence] = useState({
    openModal: false,
    attendenceData: "",
  });
  const [selectedOption, setSelectedOption] = useState("currentMonth");
  const [focus, setFocus] = useState(false);
  const [markAbsent, setMarkAbsent] = useState(false);
  const [checkOnLeave, setCheckOnLeave] = useState(false);

    useEffect(() => {
      getUserDetail();
      checkTodayOnLeave();
    }, []);

    useEffect(() => {
      getCurrentMonthAttendence();
      getUserCurrentSession();
    }, [user]);

  //   const deleteTimeOut = async (e, id) => {
  //     const attandence_id = id;
  //     try {
  //       await httpClient
  //         .post(ATTENDENCE.DELETE_TIMEOUT.replace("{id}", attandence_id))
  //         .then(async (res) => {
  //           if (res.status === 200) {
  //             toast.success("Checkout Time Removed Successfully");
  //             getUserCurrentSession();
  //             getCurrentMonthAttendence();
  //           }
  //         })
  //         .catch((err) => {
  //           console.log(err);
  //           if (err.response) {
  //             toast.error(err.response.data.message);
  //           }
  //         });
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };

  const getUserDetail = async () => {
    try {
      await httpClient
        .get(USER.GET_BY_ID.replace("{id}", userId))
        .then((res) => {
          if (res.status === 200) {
            setUser(res.data.user);
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
  };

  const checkTodayOnLeave = async () => {
    try {
      const result = await httpClient.get(
        LEAVES.TODAY_ON_LEAVE.replace("{id}", userId)
      );
      if (result.status === 200) {
        setCheckOnLeave(result.data.onLeave);
      }
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const getUserCurrentSession = async () => {
    try {
      await httpClient
        .get(ATTENDENCE.GET_CURRENT_SESSION.replace("{id}", userId))
        .then((res) => {
          if (res.status === 200) {
            setCurrentSession(res.data.result);
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
  };

  const getCurrentMonthAttendence = async () => {
    setSelectedOption("currentMonth");
    try {
      await httpClient
        .get(ATTENDENCE.GET_CURRENT_MONTH_ATTENDENCE.replace("{id}", userId))
        .then((res) => {
          if (res.status === 200) {
            setDataToBind(res.data.result);
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
  };


  const handleDateRange = async (event, picker) => {
    setSelectedOption("dateRange");
    try {
      await httpClient
        .post(
          ATTENDENCE.GET_SELECTED_RANGE_ATTENDENCE.replace("{id}", userId),
          { start: picker.startDate, end: picker.endDate }
        )
        .then((res) => {
          if (res.status === 200) {
            setDataToBind(res.data.result);
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



  const setDataToBind = async (response) => {
    try {
      await httpClient
        .get(USER.GET_BY_ID.replace("{id}", userId))
        .then((res) => {
          if (res.status === 200) {
            response.map((data) => {
              let breakTime = [];
              if (data.breaks) {
                data.breaks.map((getTime) => {
                  let startTime = "";
                  let endTime = "";
                  if (getTime.start && getTime.end) {
                    startTime = moment(getTime.start);
                    endTime = moment(getTime.end);
                    const mins = endTime.diff(startTime, "s");
                    breakTime.push(mins);
                  } else if (
                    getTime.start &&
                    !data.check_out &&
                    moment(data.entry_date).isBefore(
                      moment().format("YYYY-MM-DD")
                    )
                  ) {
                    startTime = moment(getTime.start);
                    endTime = moment(getTime.start);
                    const mins = endTime.diff(startTime, "s");
                    breakTime.push(mins);
                  }
                });
              }
              if (data.breaks.length) {
                let breaksStatusValue = data.breaks[data.breaks.length - 1];
                if (breaksStatusValue.start && !breaksStatusValue.end) {
                  let status = 1;
                  data.breakStatus = status;
                }
              } else {
                let status = 0;
                data.breakStatus = status;
              }
              let totalBreak = breakTime.reduce((a, b) => a + b, 0);
              var hours = totalBreak / 3600;
              var breakHour = Math.floor(hours);
              var minutes = (hours - breakHour) * 60;
              var breakMinutes = Math.round(minutes);
              if (breakHour === 0 && breakMinutes === 0) {
                data.totalTime = "-";
              } else {
                data.totalTime = breakHour + " Hr " + breakMinutes + " Mins";
              }
              const checkIN = moment(data.check_in);
              let checkOut = "";
              const checkOutMeridian = moment(
                moment(data.check_in).format("YYYY-MM-DD") +
                "T" +
                res.data.user.out_time,
                "YYYY-MM-DDTHH:mm:ss"
              ).format("A");
              const checkInMeridian = moment(data.check_in).format("A");
              if (((data.breaks && data.breaks.length === 0 && !data.check_out) || 
              (!data.check_out && data.breaks && data.breaks.length > 0 && (!(data.breaks[data.breaks.length-1].end) ||
                    moment(data.breaks[data.breaks.length-1].end).isBefore(moment(data.check_in).format("YYYY-MM-DD") +
                    "T" + res.data.user.out_time,"YYYY-MM-DDTHH:mm:ss"))))  && moment(data.entry_date).isBefore(moment().format("YYYY-MM-DD"))) 
              {
                if (
                  (checkInMeridian === "AM" && checkOutMeridian === "PM") ||
                  (checkInMeridian === "PM" && checkOutMeridian === "PM")
                ) {
                  checkOut = moment(
                    moment(data.check_in).format("YYYY-MM-DD") +
                    "T" +
                    res.data.user.out_time,
                    "YYYY-MM-DDTHH:mm:ss"
                  );
                } else {
                  checkOut = moment(
                    moment(data.check_in).format("YYYY-MM-DD") +
                    "T" +
                    res.data.user.out_time,
                    "YYYY-MM-DDTHH:mm:ss"
                  ).add(1, "days");
                }
                const totalWorking = checkOut.diff(checkIN, "s");
                const working = totalWorking - totalBreak;
                var workingHours = working / 3600;
                var totalWorkingHour = Math.floor(workingHours);
                var totalWorkingMin = (workingHours - totalWorkingHour) * 60;
                data.totalWorkingTime =
                  totalWorkingHour +
                  ":" +
                  (totalWorkingMin < 10
                    ? "0" + Math.floor(totalWorkingMin)
                    : Math.floor(totalWorkingMin)) +
                  " (HH:MM)";
              }else if(!data.check_out && data.breaks && data.breaks.length > 0 && data.breaks[data.breaks.length-1].end &&
                moment(data.breaks[data.breaks.length-1].end).isAfter(moment(data.check_in).format("YYYY-MM-DD") +
                "T" + res.data.user.out_time,"YYYY-MM-DDTHH:mm:ss") && moment(data.entry_date).isBefore(moment().format("YYYY-MM-DD")))
              {
                if (
                  (checkInMeridian === "AM" && checkOutMeridian === "PM") ||
                  (checkInMeridian === "PM" && checkOutMeridian === "PM")
                ) {
                  checkOut = moment(
                    // moment(data.check_in).format("YYYY-MM-DD") +
                    // "T" +
                    // res.data.user.out_time,
                    data.breaks[data.breaks.length-1].end,
                    // "YYYY-MM-DDTHH:mm:ss"
                  );
                } else {
                  checkOut = moment(
                    moment(data.check_in).format("YYYY-MM-DD") +
                    "T" +
                    res.data.user.out_time,
                    "YYYY-MM-DDTHH:mm:ss"
                  ).add(1, "days");
                }
                const totalWorking = checkOut.diff(checkIN, "s");
                const working = totalWorking - totalBreak;
                var workingHours = working / 3600;
                var totalWorkingHour = Math.floor(workingHours);
                var totalWorkingMin = (workingHours - totalWorkingHour) * 60;
                data.totalWorkingTime =
                  totalWorkingHour +
                  ":" +
                  (totalWorkingMin < 10
                    ? "0" + Math.floor(totalWorkingMin)
                    : Math.floor(totalWorkingMin)) +
                  " (HH:MM)";
              }
            });
            setAttendenceDetail(response);
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
  };


  const closeModal = () => {
    setOpenEditWorkTimeModal(false);
    setUrgentLeaveModal(false);
    setEditAttendence(false);
    setMarkAbsent(false);
    getUserDetail();
    getCurrentMonthAttendence();
  };

  const getWorkingHours = (intime, outtime) => {
    const inTime = moment(intime, "hh:mm");
    const outTime = moment(outtime, "HH:mm");
    const duration = moment.duration(outTime.diff(inTime));
    const hours = duration.get("hours");
    const minutes = duration.get("minutes");
    return moment(`${hours}:${minutes}`, "h:m").format("hh:mm");
  };

  const formatTime = (time) => {
    return moment(time, "h:m").format("hh:mm A");
  };

  const handlePendingLeaves = async () => {
    const data = ref.current.innerText;
    setFocus(false);
    try {
      await httpClient
        .put(USER.UPDATE_USER.replace("{id}", userId), { pending_leaves: data })
        .then((res) => {
          if (res.status === 200) {
            getUserDetail();
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
  };

  const handleMarkAbsent = async () => {
    try {
      const result = await httpClient.post(
        LEAVES.MARK_ABSENT.replace("{id}", userId)
      );
      if (result.status === 200) {
        toast.success(result.data.message);
        checkTodayOnLeave();
        closeModal();
      }
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const handleOnFocus = async () => {
    setFocus(true);
  };

  return (
    <>
      <div className="main_content_panel">
        <div className="header_title">
          <h1>
            <span>Employee</span> Attendance Detail
          </h1>
        </div>
        <div className="row">
          <div className="col-lg-12 mb-4">
            <div className="dashboard_card p-0">
              <div className="employee_profile">
                <div className="row">
                  <div className="col-lg-4">
                    <div className="user_profile text-center">
                      <div className="profile_img mb-4">
                        <img
                          src={user?.profile_image}
                          alt=""
                          className="img-fluid"
                        />
                      </div>
                      <h4>{user?.name}</h4>
                      <p>{user?.designation}</p>
                    </div>
                  </div>
                  <div className="col-lg-8">
                    <div className="card_title admin_heading">
                      <h4>Working Time</h4>
                      <div>
                        <div className="leaves_remain">
                          Leaves Pending:{" "}
                          <span
                            className={
                              focus ? "edit_pending_leaves" : "pending_leaves"
                            }
                            ref={ref}
                            suppressContentEditableWarning={true}
                            contentEditable="false"
                            onBlur={handlePendingLeaves}
                            onFocus={handleOnFocus}
                          >
                            {/* {user?.pending_leaves >= 0
                              ? user?.pending_leaves
                              : 0} */}
                            {user?.pending_leaves}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="time_spend">
                      <h4>
                        {getWorkingHours(user?.in_time, user?.out_time)}hr|{" "}
                        <span className="timein">
                          {user?.in_time
                            ? formatTime(user?.in_time)
                            : "-- : --"}
                        </span>{" "}
                        -{" "}
                        <span className="timeout">
                          {" "}
                          {user?.out_time
                            ? formatTime(user?.out_time)
                            : "-- : --"}
                        </span>
                        {(userDetail.role.role === "Super Admin" ||
                          userDetail.role.role === "HR") && (
                          <span>
                            <button
                              title="Request for time change"
                              className="edit_emp_detail ms-2 pb-1 pt-1 table_btn"
                              // data-bs-toggle="modal"
                              // data-bs-target="#exampleModal3"
                              onClick={() => setOpenEditWorkTimeModal(true)}
                            >
                              <i
                                className="fa fa-pencil-square-o"
                                aria-hidden="true"
                              ></i>
                            </button>
                          </span>
                        )}
                      </h4>
                    </div>
                    <div className="card_title admin_heading">
                      <h4>
                        Current Session
                        {currentSession?.work_from
                          ? currentSession.work_from === "office"
                            ? "(WFO)"
                            : "(WFH)"
                          : ""}
                      </h4>                      
                        <div>
                          {/* <button
                            type="button"
                            className="btn btn-danger mx-2"
                            onClick={() => setMarkAbsent(true)}
                            disabled={checkOnLeave}
                          >
                            Mark Absent
                          </button> */}
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setUrgentLeaveModal(true)}
                            disabled={checkOnLeave}
                          >
                            Grant Urgent Leave
                          </button>
                        </div>
                      
                    </div>
                    <div className="time_cards">
                      <div className="time_card_base">
                        <h3 className="color_blue">TIME IN </h3>
                        <p>
                          {currentSession?.check_in
                            ? moment(currentSession?.check_in).format("hh:mm A")
                            : "-- : --"}
                        </p>
                        <div className="edit_btn"></div>
                      </div>
                      <div className="time_card_base">
                        <h3 className="text_green">BREAKS </h3>
                        {/* <p>
                          <span>01:30 PM </span> - <span>02:15 PM</span>
                        </p> */}
                        {currentSession?.breaks?.length > 0
                          ? currentSession.breaks.map((br, i) => (
                              <p key={i}>
                                <span>
                                  {br?.start
                                    ? moment(br.start).format("hh:mm A")
                                    : "-- : --"}{" "}
                                </span>{" "}
                                -{" "}
                                <span>
                                  {br?.end
                                    ? moment(br.end).format("hh:mm A")
                                    : "-- : --"}
                                </span>
                              </p>
                            ))
                          : "-- : --"}
                        <div className="edit_btn"></div>
                      </div>
                      <div className="time_card_base">
                        <h3 className="color_red">TIME OUT</h3>
                        <p>
                          {currentSession?.check_out
                            ? moment(currentSession?.check_out).format(
                                "hh:mm A"
                              )
                            : "-- : --"}
                        </p>
                        {(userDetail.role.role === "Super Admin" ||
                          userDetail.role.role === "HR") &&
                          (currentSession?.check_out ? (
                            <div className="edit_btn">
                              <button
                                // onClick={(e) =>
                                //   deleteTimeOut(e, currentSession?._id)
                                // }
                                title="Delete Time Out"
                                className="edit_emp_detail table_btn mx-1"
                                style={{ cursor: "pointer" }}
                              >
                                <i
                                  className="fa fa-trash"
                                  aria-hidden="true"
                                ></i>
                              </button>
                            </div>
                          ) : (
                            ""
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>         
            <div className="col-lg-12  mb-4">
              <LeavesApplied userId={userId} getUserDetail={getUserDetail} />
            </div>        
          <div className="col-lg-12">
            <div className="dashboard_card employee_lists">
              <div className="card_title calender_heading">
                <h4>Employee Details</h4>
                <div className="btn-groups">
                  <button
                    type="button"
                    className={
                      selectedOption === "currentMonth"
                        ? "btn btn-secondary calender_view me-4 active_btn"
                        : "btn btn-secondary calender_view me-4"
                    }
                    onClick={getCurrentMonthAttendence}
                  >
                    <i className="fa fa-calendar-o me-2" aria-hidden="true"></i>
                    Current Month
                  </button>                  
                </div>
              </div>

              <div className="employee_table">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th scope="col">Date</th>
                      <th scope="col">Time In</th>
                      <th scope="col">Break Time </th>
                      <th scope="col">Time Out</th>
                      <th scope="col">Total Time</th>
                      <th scope="col">Work Status</th>
                      {(userDetail.role.role === "Super Admin" ||
                        userDetail.role.role === "HR") && (
                        <th scope="col">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {attendenceDetail?.map((attendence, i) => (
                      <tr key={i}>
                        <td>{moment(attendence.entry_date).format("L")}</td>
                        <td>{moment(attendence.check_in).format("hh:mm A")}</td>
                        <td>{attendence.totalTime}</td>
                        <td>
                          {attendence.check_out
                            ? moment(attendence.check_out).format("hh:mm A") 
                            : !attendence.check_out && attendence.breaks && attendence.breaks.length > 0 && attendence.breaks[attendence.breaks.length-1].start &&
                             attendence.breaks[attendence.breaks.length-1]?.end && 
                             moment(attendence.breaks[attendence.breaks.length-1]?.end).isAfter(moment(
                             moment(attendence.check_in).format("YYYY-MM-DD") + "T" + user.out_time, "YYYY-MM-DDTHH:mm:ss")) &&
                             moment(attendence.entry_date).isBefore(moment().format("YYYY-MM-DD")) ? 
                             moment(attendence.breaks[attendence.breaks.length-1]?.end).format("hh:mm A") 
                            :(!attendence.breaks[attendence.breaks.length-1]?.end || !attendence.check_out) && moment(attendence.entry_date).isBefore(
                              moment().format("YYYY-MM-DD")
                            )
                              ? formatTime(user?.out_time)
                              : ""}
                        </td>
                        <td>
                          {attendence.working_hours
                            ? `${attendence.working_hours} (HH:MM)`
                            : attendence.totalWorkingTime}
                        </td>
                        <td>
                          {attendence.work_from
                            ? attendence.work_from === "office"
                              ? "WFO"
                              : "WFH"
                            : "-"}
                        </td>
                        {(userDetail.role.role === "Super Admin" ||
                          userDetail.role.role === "HR") && (
                          <td>
                            {/* <button className="view_emp_detail table_btn mx-1">
                            <i className="fa fa-eye" aria-hidden="true"></i>
                          </button> */}
                            <button
                              title="Update Time"
                              className="edit_emp_detail table_btn"
                              onClick={() =>
                                setEditAttendence({
                                  openModal: true,
                                  attendenceData: attendence,
                                })
                              }
                            >
                              <i
                                className="fa fa-pencil-square-o"
                                aria-hidden="true"
                              ></i>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {/* <tr>
                      <td>20/6/2021</td>
                      <td colSpan="5" className="text-danger">
                        Leave
                      </td>
                    </tr> */}
                  </tbody>
                </table>
              </div>
              {attendenceDetail.length <= 0 && (
                <div className="d-flex justify-content-center">
                  <h5>No Records to Display.</h5>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {openEditWorkTimeModal && (
        <EditWorkingTime
          show={openEditWorkTimeModal}
          close={closeModal}
          data={user}
          userId={userId}
        />
      )}
      {urgentLeaveModal && (
        <UrgentLeave
          show={urgentLeaveModal}
          close={closeModal}
          data={user}
          userId={userId}
          handleUserOnLeave={checkTodayOnLeave}
        />
      )}
      {editAttendence.openModal && (
        <EditAttendence
          open={editAttendence.openModal}
          close={closeModal}
          data={editAttendence.attendenceData}
          userId={userId}
        />
      )}
      {markAbsent && (
        <ConfirmDialog
          openDialog={markAbsent}
          title="Confirm Absent"
          body="Are you sure you want to mark absent this employee?"
          onConfirm={handleMarkAbsent}
          closeDialog={closeModal}
        />
      )}
    </>
  );
};
export default AttendenceDetails;
