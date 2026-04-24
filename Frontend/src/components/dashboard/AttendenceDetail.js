import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import ChangeRequestModal from "./ChangeRequestModal";
import { httpClient } from "../../constants/Api";
import { ATTENDENCE, LEAVES } from "../../constants/AppConstants";
import moment from "moment";
import * as $ from "jquery";

function AttendenceDetail(props) {
  const today = useSelector((state) => state.today);
  const [showModal, setShowModal] = useState(false);
  const [showCalender, setShowCalender] = useState(false);
  const [attendenceData, setAttendenceData] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    const getLeaves = async () => {
      try {
        await httpClient
          .get(LEAVES.GET_LEAVES_DASHBOARD)
          .then((res) => {
            if (res.status === 200) {
              bindLeaveData(res.data);
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

    getLeaves();
  }, []);

  const bindLeaveData = (data) => {
    let leaves = [];
    const approvedLeaves = data.filter((leave) => leave.status === "approved");
    approvedLeaves.map((leave) => {
      if (moment(leave.from).isSame(leave.to, "day")) {
        return leaves.push(moment(leave.from).format("YYYY-MM-DD"));
      } else {
        const leavesBetweenTwoDates = getLeavesBetweenTwoDates(
          leave.from,
          leave.to
        );

        if (leavesBetweenTwoDates.length > 0) {
          leaves = [...leaves, ...leavesBetweenTwoDates];
        }
        return leaves;
      }
    });
    setLeaves(leaves);
    setShowCalender(true);
  };

  const getLeavesBetweenTwoDates = (startDate, endDate) => {
    let date = [];
    while (moment(startDate) <= moment(endDate)) {
      date.push(moment(startDate).format("YYYY-MM-DD"));
      startDate = moment(startDate).add(1, "day").format("YYYY-MM-DD");
    }
    return date;
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const onDayCellDidMount = (info) => {
    if (
      leaves.findIndex((lv) => lv === moment(info.date).format("YYYY-MM-DD")) >
      -1
    )
      $(info.el).find(".fc-daygrid-day-top").css("background", "#faaf16");
    // .addClass("chutti");
  };

  const handleDateClick = async (arg) => {
    try {
      if (moment(arg.dateStr) > moment()) {
        return;
      } else {
        setSelectedDate(arg.dateStr);
        await httpClient
          .get(`${ATTENDENCE.GET_SPECIFIC_DATE_ATTENDENCE}?date=${arg.dateStr}`)
          .then((res) => {
            if (res.status === 200) {
              res.data.user_id = props.data.id;
              setAttendenceData(res.data);
              setShowModal(true);
            }
          })
          .catch((err) => {
            if (err.response) {
              toast.error(err.response.data.message);
            } else {
              toast.error("Something went wrong");
            }
          });
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="col-lg-9 mb-4 mb-lg-0">
      <div className="row">
         <div className="col-12">
         <div className="dashboard_card">
        <div className="card_title calender_heading">
          <h4>Attendance Details</h4>
        </div>
        {today?.currentDate && showCalender && (
          <div className="calendar-dates">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
              initialView="dayGridMonth"
              dateClick={handleDateClick}
              now={new Date(today?.currentDate)}
              fixedWeekCount={false}
              validRange={() => {
                let startDate = "2021-06-01";
                return { start: startDate };
              }}
              dayCellDidMount={onDayCellDidMount}
            />
          </div>
        )}
      </div>
         </div>
      </div>
      
      {showModal && (
        <ChangeRequestModal
          date={selectedDate}
          show={showModal}
          close={handleClose}
          data={attendenceData}
        />
      )}
    </div>
  );
}

export default AttendenceDetail;
