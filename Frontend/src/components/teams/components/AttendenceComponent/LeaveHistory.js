import React, { useEffect, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import InfiniteScroll from "react-infinite-scroll-component";
import { useParams } from "react-router-dom";
import { httpClient } from "../../../../constants/Api";
import { LEAVES, USER } from "../../../../constants/AppConstants";
import { saveAs } from "file-saver";

function LeaveHistory() {
  const { userId } = useParams();
  const [userLeaves, setUserLeaves] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState("");
  const [page, setPage] = useState(0);
  
  useEffect(() => {
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
    getUserLeaves();
    getUserDetail();
  }, [userId]);

  const getUserLeaves = async () => {
   
    setPage(page + 1);
    try {
      setLoading(true);
      await httpClient
        .get(
          `${LEAVES.GET_USER_LEAVES}?page=${page + 1}`.replace("{id}", userId)
        )
        .then((res) => {
          if (res.status === 200) {
            if (!userLeaves) {
              setUserLeaves(res.data.leaves);
              setLoading(false);
            } else {
              const updatedData = [...userLeaves.data, ...res.data.leaves.data];
              setUserLeaves({ ...userLeaves.data, data: updatedData });
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

  const formatTime = (time) => {
    return moment(time, "h:m").format("hh:mm A");
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

  const fetchMoreData = () => {
    // setPage(page + 1);
    getUserLeaves();
  };

  return (
    <>
   
      <div className="main_content_panel">
      <div className="dashboard_card">
        <div className="header_title">
          <h1>
            <span>Leave & WFH Requests of </span> {user.name}
          </h1>
          <div className="d-flex">
            {/* {user.allotted_leaves && ( */}
              <>
                {user.allotted_leaves >= 12 ? (
                  <div className=" mx-2 text-center">
                    <span className="allotted_leaves">Leaves Allotted </span>
                    <br />
                    <span className="display-6">{user?.allotted_leaves}</span>
                    <br />
                    <span className="allotted_leaves">
                      Since {`(${moment().startOf("year").format("L")})`}
                    </span>
                  </div>
                ) : moment(user.doj).isSame(moment(), 'year')  ? (
                  <div className=" mx-2 text-center">
                    <span className="allotted_leaves">Leaves Allotted</span>
                    <br />
                    <span className="display-6">{user?.allotted_leaves}</span>
                    <br />
                    <span className="allotted_leaves">
                      Since {`(${moment(user?.doj).format("L")})`}
                    </span>
                  </div>
                ) : (
                  <div className=" mx-2 text-center">
                    <span className="allotted_leaves">Leaves Allotted</span>
                    <br />
                    <span className="display-6">12</span>
                    <br />
                    <span className="allotted_leaves">
                      Since {`(${moment(moment().startOf('year')).format("L")})`}
                    </span>
                  </div>
                )
              }
              </>
            {/* )} */}
            {(user.pending_leaves || user.pending_leaves === 0) && (
              <div className="history_leaves_pending text-center">
                <span className="history_allotted_leaves">Leaves Pending</span>
                <br />
                <span className="display-6 ">
                  {/* {user?.pending_leaves >= 0 ? user?.pending_leaves : 0} */}
                  {user?.pending_leaves}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <div className="dashboard_card employee_lists">
              <div className="employee_table">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th scope="col">Status</th>
                      <th scope="col">Start Date</th>
                      <th scope="col">End Date</th>
                      <th scope="col">Time</th>
                      <th scope="col">Type</th>
                      <th scope="col">Duration</th>
                      <th scope="col" className="text-nowrap">
                        Comp Off Date
                      </th>
                      <th scope="col" className="text-nowrap">
                        Submission Date
                      </th>
                      <th scope="col" className="text-nowrap">
                        Requested To
                      </th>
                      <th scope="col" className="text-nowrap">
                        Reason of Leave / WFH
                      </th>
                      <th scope="col" className="text-nowrap">
                        Reason of Rejection
                      </th>
                      {/* <th scope="col">Action</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {userLeaves.data?.length > 0 &&
                      userLeaves.data.map((leave, i) => (
                        <tr key={i}>
                          <td className="text-nowrap">
                            {leave.status === "pending" && (
                              <span className="text-warning text-capitalize">
                                {leave.status}
                              </span>
                            )}
                            {leave.status === "approved" && (
                              <span className="text-success text-capitalize">
                                {leave.status}
                              </span>
                            )}
                            {leave.status === "rejected" && (
                              <span className="text-danger text-capitalize">
                                {leave.status}
                              </span>
                            )}
                            {leave.status === "cancelled" && (
                              <span className="text-decoration-line-through text-capitalize">
                                {leave.status}
                              </span>
                            )}
                            {leave.status === "absent" && (
                              <span className="text-danger text-capitalize">
                                {leave.status}
                              </span>
                            )}
                          </td>
                          <td className="text-nowrap">
                            {moment(leave.from).format("L")}
                          </td>
                          <td className="text-nowrap">
                            {leave.type === "Half Day" ||
                            leave.type === "Short Leave" ||
                            moment(
                              moment(leave.from).format("YYYY/MM/DD")
                            ).isSame(
                              moment(moment(leave.to).format("YYYY/MM/DD"))
                            )
                              ? "-"
                              : moment(leave.to).format("L")}
                          </td>

                          <td className="text-nowrap">
                            {" "}
                            {leave.start_time
                              ? formatTime(leave.start_time)
                              : "-- : --"}{" "}
                            -{" "}
                            {leave.end_time
                              ? formatTime(leave.end_time)
                              : "-- : --"}
                          </td>
                          <td className="text-nowrap">{leave.type ? leave.type : "WFH"}</td>
                          <td className="text-nowrap">{leave.duration ? leave.duration : "-"}</td>
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
                          {/* <td>{leave.leave_reason ? leave.leave_reason : leave.wfh_reason}</td> */}
                          <td>
                            <table>
                              <tr>
                                <td>
                                  {leave.leave_reason ? leave.leave_reason : leave.wfh_reason}
                                </td>
                                <td>
                                  {leave.file_name ? (
                                    <td className="action_lh">
                                      <div onClick={() => handleFilPreViewClick(leave)}>
                                        <i className="d-inline-flex fa fa-eye" aria-hidden="true"></i>
                                      </div>
                                    </td>
                                  ) : <td></td>}
                                </td>
                              </tr>
                            </table>

                          </td>
                          <td>{leave.reject_reason}</td>
                           {/* {leave.file_name ? ( 
                             <td className="action_lh">
                                  <div className="d-inline-flex p-1 " onClick={()=>handleFilPreViewClick(leave)}>
                                    <i className="fa fa-eye" title="Preview File" aria-hidden="true"></i>
                                  </div>
                              </td>      
                            ) : <td></td>} */}
                      
                        </tr>
                      ))}
                  </tbody>
                </table>
                {!loading && userLeaves.data?.length <= 0 && (
                  <div className="d-flex justify-content-center">
                    <h5>No Records to Display.</h5>
                  </div>
                )}

                {userLeaves.length <= 0 ||
                  (userLeaves.data?.length < userLeaves.total && (
                    <div className="text-center">
                      <InfiniteScroll
                        dataLength={userLeaves.data?.length}
                        next={fetchMoreData}
                        hasMore={true}
                        loader={<h4>Loading...</h4>}
                      >
                        {userLeaves.data?.map((i, index) => (
                          <div key={index}></div>
                        ))}
                      </InfiniteScroll>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

export default LeaveHistory;
