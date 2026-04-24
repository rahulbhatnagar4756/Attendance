import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import moment from "moment";
import RejectLeave from "../Modals/RejectLeave";
import RejectWorkFromHome from "../Modals/RejectWfhModal";
import { httpClient } from "../../../../constants/Api";
import { LEAVES, WORK_FROM_HOME } from "../../../../constants/AppConstants";

const LeavesApplied = ({ userId, getUserDetail }) => {
	const [leaves, setLeaves] = useState("");
	const [show, setShow] = useState({ open: false, leaveId: "" });
	const [showWfhModal, setShowWfhModal] = useState({ open: false, wfhId: "" });
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getUserLeaves();
	}, []);

	const getUserLeaves = async () => {
		try {
			setLoading(true);
			await httpClient
				.get(LEAVES.GET_USER_PENDING_LEAVES.replace("{id}", userId))
				.then((res) => {
					if (res.status === 200) {
						setLeaves(res.data);
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

	const approveLeave = async (leaveId) => {
		try {
			await httpClient
				.put(LEAVES.APPROVE_LEAVE.replace("{id}", leaveId), {
					// userId: userId,
					status: "approved",
				})
				.then((res) => {
					if (res.status === 200) {
						setShow({ open: false });
						getUserLeaves();
						getUserDetail();
						toast.success(res.data.message);
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

	const handleApproveWfh = async (wfhId) => {
		try {
		  await httpClient
			.put(WORK_FROM_HOME.APPROVE_WFH.replace("{id}", wfhId), {
			  // userId: userId,
			  status: "approved",
			})
			.then((res) => {
			  if (res.status === 200) {
				setShowWfhModal({ open: false, wfhId: "" });
				getUserLeaves();
				getUserDetail();
				toast.success(res.data.message);
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
	
	const rejectLeave = async (reason) => {
		try {
			const formModal = {
				reject_reason: reason,
				// userId: userId,
				status: "rejected",
			};
			await httpClient
				.put(LEAVES.REJECT_LEAVE.replace("{id}", show.leaveId), formModal)
				.then((res) => {
					if (res.status === 200) {
						getUserLeaves();
						toast.success(res.data.message);
						handleClose();
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

	const rejectWfh = async (reason) => {
		try {
		  const formModal = {
			reject_reason: reason,
			// userId: userId,
			status: "rejected",
		  };
		  await httpClient
			.put(WORK_FROM_HOME.REJECT_WFH.replace("{id}", showWfhModal.wfhId), formModal)
			.then((res) => {
			  if (res.status === 200) {
				getUserLeaves();
				toast.success(res.data.message);
				handleClose();
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

	const handleClose = () => {
		setShow({ open: false, leaveId: "" });
		setShowWfhModal({ open: false, wfhId: ""})
	};

	return (
		<>
			<div className="dashboard_card">
				<div className="employee_profile ">
					<div className="card_title admin_heading pe-0">
						<h4>Leave & WFH Requests</h4>
						<Link to={`/teams/leave-history/${userId}`}>
							<button type="button" className="btn btn-secondary calender_view">
								View All
							</button>
						</Link>
					</div>
				</div>
				{leaves.length > 0 &&
					leaves.map((leave, i) => (
						<div className="leave_status mb-3 justify-content-between" key={i}>
							<h5 className="mb-0 me-3 w-50">
								{moment(leave.from).format("D MMMM YYYY")}
								{moment(leave.from).isSame(leave.to, "day")
									? ""
									: `  ${
											leave.type === "Half Day" ||
											leave.type === "Short Leave" ||
											moment(leave.from).isSame(
												moment(leave.to).format("YYYY-MM-DD")
											)
												? ""
												: " to " + moment(leave.to).format("D MMMM YYYY")
									  }`}
								<span className="m-2">
									{" "}
									{/* - {leave.duration ? leave.duration : leave.type} */}
									- {leave.duration ? leave.duration : (leave.type ? leave.type : 'WFH')}
								</span>
							</h5>
							<div className="leave_btns d-flex">
								<button
									className="btn btn-leave_status"
									// onClick={(e) => approveLeave(leave._id)}
									onClick={(e) => {
										leave.type ? approveLeave(leave._id) : handleApproveWfh(leave._id);
									}}
								>
                                    {leave.type ? "Approve Leave" : "Approve WFH"}
									{/* Approve Leave */}
								</button>
								<button
									className="btn btn-leave_status ms-2 bg-danger"
									// onClick={(e) => setShow({ open: true, leaveId: leave._id })}
									onClick={(e) => {
										leave.type
										  ? setShow({ open: true, leaveId: leave._id })
										  : setShowWfhModal({ open: true, wfhId: leave._id });
									}}
								>
									{leave.type ? "Reject Leave" : "Reject WFH"}
									{/* Reject Leave */}
								</button>
							</div>
						</div>
					))}

				{!loading && leaves.length <= 0 && (
					<div className="d-flex justify-content-center">
						<h5>No Records to Display.</h5>
					</div>
				)}
			</div>
			<RejectLeave
				open={show.open}
				close={handleClose}
				rejectLeave={rejectLeave}
			/>
		    <RejectWorkFromHome
				open={showWfhModal.open}
				close={handleClose}
				rejectWfh={rejectWfh}
           />
		</>
	);
};

export default LeavesApplied;
