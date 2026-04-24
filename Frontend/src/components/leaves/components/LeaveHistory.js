import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSelector } from "react-redux";
import { Popover, OverlayTrigger} from "react-bootstrap";
import { httpClient } from "../../../constants/Api";
import { LEAVES, WORK_FROM_HOME } from "../../../constants/AppConstants";
import { USER } from "../../../constants/AppConstants";
import Approved from "../../../assets/images/approved.png";
import Pending from "../../../assets/images/pending.png";
import Cancel from "../../../assets/images/cancel.png";
import Absent from "../../../assets/images/absent.png";
import Time from "../../../assets/images/time.png";
import Reject from "../../../assets/images/reject.png";
import LeaveReason from "../../../assets/images/comment1.png";
import RejectReason from "../../../assets/images/comment2.png";
// import Loader from "../../Layout/Loader";
import "font-awesome/css/font-awesome.min.css";
import "../../../assets/css/dashboard.css";
import { saveAs } from "file-saver";

function LeaveHistory() {
  const userDetail = useSelector((state) => state.user.user.user)
  const [leaves, setLeaves] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [detail, setDetail] =useState("")
  useEffect(() => {
    getLeaves();
    getEmployee();
  }, []);
  const getLeaves = async (count) => {
    try {
      setPage(page + count);
      setLoading(true);
      await httpClient
        .get(`${LEAVES.GET_LEAVES}?page=${page + count}`)
        .then((res) => {
          if (res.status === 200) {
            if (!leaves) {
              setLeaves(res.data.leaves);
              setLoading(false);
            } else {
              const records = [...leaves.data];
              const updatedData = records.map((rec) => {
                const fLeave = res.data.leaves.data.find(
                  (r) => r._id === rec._id
                );
                if (fLeave) {
                  return { ...fLeave };
                } else {
                  return { ...rec };
                }
              });
              setLeaves({ ...leaves.data, data: updatedData });
              setLoading(false);
            }
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
  };
  const fetchMoreData = () => {
    // setPage(page + 1);
    getLeaves(1);
  };

  const cancelLeave = async (id) => {
    try {
      setLoading(true);
      await httpClient
        .post(LEAVES.CANCEL_LEAVES.replace("{id}", id))
        .then((res) => {
          if (res.status === 200) {
            toast.success("Leave Cancelled Successfully");
            setLeaves("");
            getLeaves();
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
  };

  const cancelWorkFromHome = async (id) => {
    try {
      setLoading(true);
      await httpClient
        .put(WORK_FROM_HOME.CANCEL_WFH.replace("{id}", id))
        .then((res) => {
          if (res.status === 200) {
            toast.success("WFH Cancelled Successfully");
            setLeaves("");
            getLeaves();
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
  };
  const formatTime = (time) => {
    return moment(time, "h:m").format("hh:mm A");
  };

  const getEmployee = async () => {
    await httpClient
      .get(USER.GET_BY_ID.replace("{id}", userDetail.id))
      .then((res) => {
        if (res.status === 200) {
        const result =res.data.user;
        setDetail(result)
        }

      })
      .catch((err) => {
        if (err.response) {
          toast.error(err.response.data.message);
        } else {
          toast.error("Something went wrong");
        }
      });
  };

	const handleFilPreViewClick = (data) => {
		{["jpg", "png", "gif", "txt", "pdf"].includes(
			data.path.substring(data.path.lastIndexOf(".") + 1)
		) ? handlePreviewClick(data._id) : handleDownloadClick(data)
	  }
  }

  const handlePreviewClick = (docID) => {
    const type = "sick_leave_attachment";
    window.open(`/preview/${docID}?type=${type}`, "_blank");
		// window.open("/preview/" + docID, "_blank"); //open preview in new Tab
	};

	const handleDownloadClick = (data) => {
		const url = data.path;
		fetch(url)
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				return response.blob();
			})
			.then((blob) => {
				const fileExtension = data.path.substring(
					data.path.lastIndexOf(".") + 1
				);
				const fileName = data.file_name + "." + fileExtension;
				saveAs(blob, fileName);
			})
			.catch((error) => {
				console.error("There was a problem with the fetch operation:", error);
			});
	};
  
  return (
    <>
      <div className="main_content_panel ">
        <div className="header_title">
          <h1>
            <span>Leave & WFH</span> Requests
          </h1>
          <div className="l-box">
            <ul className="Legend">
              <li className="Legend-item">
                <span className="Legend-label">Approved</span>
                <span className="Legend-colorBox l-green"></span>
              </li>
              <li className="Legend-item">
                <span className="Legend-label">Pending</span>
                <span className="Legend-colorBox l-org"></span>
              </li>
              <li className="Legend-item">
                <span className="Legend-label ">Cancel</span>
                <span className="Legend-colorBox l-black"></span>
              </li>
              <li className="Legend-item">
                <span className="Legend-label ">Rejected</span>
                <span className="Legend-colorBox l-brown"></span>
              </li>
              <li className="Legend-item">
                <span className="Legend-label ">Absent</span>
                <span className="Legend-colorBox l-red"></span>
              </li>
            </ul>
          </div>
          <div className="pending_leaves">
            <div className="leaves_remain">
              Leaves Pending:{" "}
              <span>
                {detail.pending_leaves >= 0 ? detail.pending_leaves : 0}
              </span>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <div className="dashboard_card employee_lists">
              <div className="employee_table table-responsive">
                <table className="table table-hover employee_table_leave_history">
                  <thead>
                    <tr className="sub-hd-td">
                      <th colSpan="8"></th>
                      <th colSpan="2" className="text-center bg-light ">
                        Reason
                      </th>
                    </tr>
                    <tr>
                      <th scope="col">Status</th>
                      <th scope="col">Start Date</th>
                      <th scope="col" className="text-nowrap">
                        End Date
                      </th>
                      <th scope="col">Type</th>
                      <th scope="col">Duration</th>
                      <th scope="col">Comp Off </th>
                      <th scope="col" className="text-nowrap">
                        Submission
                      </th>
                      <th scope="col">Requested To</th>
                      <th scope="col" className="text-center bg-light ">
                        Leave / WFH
                      </th>
                      <th scope="col" className="text-center bg-light ">
                        Rejection
                      </th>
                      <th scope="col">Action</th>
                      {/* <th scope="col">Team Lead</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.data?.length > 0 &&
                      leaves.data?.map((leave, i) => (
                        <tr key={i}>
                          <td className="text-nowrap">
                            {leave.status === "pending" && (
                              <span className="text-warning text-capitalize">
                                <img src={Pending} alt="" />
                              </span>
                            )}
                            {leave.status === "approved" && (
                              <span className="text-success text-capitalize">
                                <img src={Approved} alt="" />
                              </span>
                            )}
                            {leave.status === "rejected" && (
                              <span className="text-danger text-capitalize">
                                <img src={Reject} alt="" />
                              </span>
                            )}
                            {leave.status === "cancelled" && (
                              <span className="text-decoration-line-through text-capitalize">
                                <img src={Cancel} alt="" />
                              </span>
                            )}
                            {leave.status === "absent" && (
                              <span className="text-danger text-capitalize">
                                <img src={Absent} alt="" />
                              </span>
                            )}
                          </td>
                          <td className="text-nowrap">
                            {moment(leave.from).format("L")}
                          </td>
                          <td className="text-nowrap">
                            {leave.duration === "Half Day" ||
                            leave.duration === "Short Day" ||
                            moment(
                              moment(leave.from).format("YYYY/MM/DD")
                            ).isSame(
                              moment(moment(leave.to).format("YYYY/MM/DD"))
                            )
                              ? "-"
                              : moment(leave.to).format("L")}
                          </td>
                          <td className="text-nowrap">{leave.type ? leave.type : "WFH"}</td>
                          <td className="text-nowrap">
                            {!leave.duration && !leave.start_time && !leave.end_time ? (
                               <>-</>
                              ):leave.duration !== "Full Day" ? (
                              <div className="d-flex">
                                {leave.duration}

                                <OverlayTrigger
                                  placement="bottom"
                                  // trigger="hover"
                                  trigger={["hover", "focus"]}
                                  rootClose
                                  overlay={
                                    <Popover>
                                      <Popover.Title as="h6">
                                        Time
                                      </Popover.Title>
                                      <Popover.Content>
                                        {leave.start_time
                                          ? formatTime(leave.start_time)
                                          : "-- : --"}{" "}
                                        -{" "}
                                        {leave.end_time
                                          ? formatTime(leave.end_time)
                                          : "-- : --"}
                                      </Popover.Content>
                                    </Popover>
                                  }
                                >
                                  <img
                                    className="mx-1"
                                    src={Time}
                                    alt=""
                                    width={"18px"}
                                    height={"18px"}
                                  />
                                </OverlayTrigger>
                              </div>
                            ) : (
                              <> {leave.duration}</>
                            )}
                          </td>
                          <td className="text-nowrap">
                            {" "}
                            {leave.comp_off_date
                              ? moment(leave.comp_off_date).format("L")
                              : "-"}
                          </td>
                          <td className="text-nowrap">
                            {moment(leave.createdAt).format("L")}
                          </td>
                          { leave.approved_by ? 
                            <td className="text-nowrap">
                              {leave.approved_by.name}
                            </td> :
                            <td></td>
                          }
                          <td>
                            {" "}
                            <div className="d-flex justify-content-center">
                              <OverlayTrigger
                                placement="bottom"
                                // trigger="hover"
                                trigger={["hover", "focus"]}
                                rootClose
                                overlay={
                                  <Popover>
                                    <Popover.Title as="h6">
                                      {	!leave.type ? "WFH Reason" : "Leave Reason"}
                                      {/* Leave / WFH Reason */}
                                    </Popover.Title>
                                    <Popover.Content>
                                      {leave.leave_reason ? leave.leave_reason : leave.wfh_reason}
                                    </Popover.Content>
                                  </Popover>
                                }
                              >
                                <img
                                  className="mx-1"
                                  src={LeaveReason}
                                  alt=""
                                  width={"18px"}
                                  height={"18px"}
                                />
                              </OverlayTrigger>
                            </div>
                          </td>
                          <td>
                            {leave.reject_reason ? (
                              <div className="d-flex justify-content-center">
                                <OverlayTrigger
                                  placement="bottom"
                                  // trigger="hover"
                                  trigger={["hover", "focus"]}
                                  rootClose
                                  overlay={
                                    <Popover>
                                      <Popover.Title as="h6">
                                        Reject Reason
                                      </Popover.Title>
                                      <Popover.Content>
                                        {leave.reject_reason}
                                      </Popover.Content>
                                    </Popover>
                                  }
                                >
                                  <img
                                    className="mx-1"
                                    src={RejectReason}
                                    alt=""
                                    width={"18px"}
                                    height={"18px"}
                                  />
                                </OverlayTrigger>
                              </div>
                            ) : (
                              ""
                            )}
                          </td>
                          <td className="action_lh">
                            {leave.file_name && ( 
                                  <div className="d-inline-flex p-1" onClick={()=>handleFilPreViewClick(leave)}>
                                    <i className="fa fa-eye" title="Preview File" aria-hidden="true"></i>
                                  </div>
                            )}
                            {leave.status === "pending" ? (
                                <div className="d-inline-flex p-1 cancel" 
                                // onClick={() => cancelLeave(leave._id)}
                                onClick={() => !leave.type ? cancelWorkFromHome(leave._id) : cancelLeave(leave._id) }
                                >
                                  <i className="fa fa-times" title={!leave.type ? "Cancel WFH" : "Cancel Leave"} aria-hidden="true"></i>
                                  {/* <button
                                    onClick={() => cancelLeave(leave._id)}
                                    title="Cancel leave"
                                    className="edit_emp_detail btn btn-primary"
                                    style={{ cursor: "pointer", width: "125px" }}
                                  >
                                    Cancel Leave
                                  </button> */}
                                </div>
                            ) : (
                              ""
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {!loading && leaves.length <= 0 && (
                  <div className="d-flex justify-content-center">
                    <h5>No Records to Display.</h5>
                  </div>
                )}
                {leaves.data?.length < leaves.total && (
                  <div className="text-center">
                    <InfiniteScroll
                      dataLength={leaves.data?.length}
                      next={fetchMoreData}
                      hasMore={true}
                      loader={<h4>Loading...</h4>}
                    >
                      {leaves.data?.map((i, index) => (
                        <div key={index}></div>
                      ))}
                    </InfiniteScroll>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* {loading && <Loader />} */}
        </div>
      </div>
    </>
  );
}

export default LeaveHistory;
