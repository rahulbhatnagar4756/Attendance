import React, { useEffect, useState, useContext, useRef } from "react";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
	fetchTiming,
	checkIn,
	breakStart,
	breakEnd,
} from "../../redux/actions/TimingActions";
import { Modal, Button } from "react-bootstrap";
import {
	REQUEST,
	ATTENDENCE,
	GOOGLE_API_KEY,
} from "../../constants/AppConstants";
import { toast } from "react-toastify";
import { httpClient } from "../../constants/Api";
import ConfirmCheckout from "./modals/ConfirmCheckout";
import AddStatusAlert from "./modals/AddStatus.Modal";
import { SocketContext } from "../../context/socket";

function Timing(props) {
	const dispatch = useDispatch();
	const socket = useContext(SocketContext);
	const attendence = useSelector((state) => state.time.timing.result);
	const userDetail = useSelector((state) => state.user.user.user);
	const lastBreak = attendence?.breaks[attendence?.breaks.length - 1];
	const [values, setValues] = useState("");
	const [errorEmail, setErrorEmail] = useState("");
	const [employeeRegex, setEmployeeRegex] = useState("");
	const [show, setShow] = useState(false);
	const [handleShow, setHandleShow] = useState(false);
	const [showCheckout, setShowCheckout] = useState(false);
	const [showAddStatusAlert, setShowAddStatusAlert] = useState(false);
	const [loading, setLoading] = useState(false);
	const [buttonDisable, setButtonDisable] = useState(
		attendence?.check_in ? true : false
	);
	const [breakStart, setBreakStart] = useState({
		disabled: false,
	});
	const [disabledButton, setDisableButton] = useState({ disabled: false });
	const [double, setDouble] = useState(false);
	const [locationData, setLocationData] = useState({
		formattedAddress: "",
		latitude: "",
		longitude: "",
	});

	const [locationEnabled, setLocationEnabled] = useState(false);

	const handleShowWorkFrom = () => {
		setButtonDisable(true);
		setShow(true);
	};

	const handleShowRequest = () => {
		setHandleShow(true);
	};
	const handleCloseWorkFrom = () => {
		setShow(false);
	};
	const handleClose = (response) => {
		setValues("");
		setEmployeeRegex("");
		setHandleShow(false);
		setShowCheckout(false);
	};

	const handleCloseTimeOutModal = (response) => {
		setHandleShow(false);
		setShowCheckout(false);
		if (!response) {
			setShowAddStatusAlert(true);
		}
	};

	const handleAlertClose = () => {
		setShowAddStatusAlert(false);
	};

	useEffect(() => {
		dispatch(fetchTiming());
	}, []);

	useEffect(() => {
		socket.on(userDetail.id, () => {
			dispatch(fetchTiming());
		});
	}, []);

	useEffect(() => {
		getGeoloaction();
	}, []);

	const getGeoloaction = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
		} else {
			alert("Geolocation not supported");
		}
	};

	const locationSuccess = (position) => {
		const latitude = position.coords.latitude;
		const longitude = position.coords.longitude;
		console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
		getAddress(latitude, longitude);
	};

	const locationError = () => {
		setLocationEnabled(false);
		console.log("Unable to retrieve your location");
	};

	const getAddress = async (latitude, longitude) => {
		if (latitude && longitude) {
			const response = await axios.get(
				"https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
					latitude +
					"," +
					longitude +
					"&sensor=true&key=" +
					GOOGLE_API_KEY
			);
			console.log({ response: response.data.results[0] });
			if (response && response.data && response.data.results[0]) {
				const formatted_address = response.data.results[0].formatted_address;
				setLocationData({ latitude, longitude, formatted_address });
				setLocationEnabled(true);
			}
		} else {
			return false;
		}
	};

	const handleCheckIn = async (e) => {
		e.preventDefault();
		try {
			if (values.work_from) {
				document.getElementById("submit").disabled = true;
				let formData = {
					on_leave: false,
					work_from: values.work_from,
					locationData:locationData
				};
				// dispatch(checkIn(formData));
				await httpClient.post(ATTENDENCE.CHECK_IN, formData);
				// document.getElementById('submit').disabled = false;
				socket.emit("checkIn", userDetail.id);
				handleCloseWorkFrom();
			} else {
				setErrorEmail("Please select one option");
			}
		} catch (err) {
			document.getElementById("submit").disabled = false;
			console.log(err);
		}
	};

	const sendRequest = async (e) => {
		e.preventDefault();
		values.request_message = values.request_message.trim();
		if (!values.request_message) {
			setEmployeeRegex("Please enter the message blank spaces is not allowed.");
			return false;
		}
		setLoading(true);
		const data = props.data;
		values.user_id = data.id ? data.id : "";
		values.type = "Change Request";
		await httpClient
			.post(REQUEST.POST_REQUEST_CHANGES, values)
			.then((res) => {
				if (res.status === 200) {
					toast.success("Request send successfully");
					setLoading(false);
					handleClose();
					values.request_message = "";
					setEmployeeRegex("");
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

	const handleBreakStart = async () => {
		const formData = {
			reason: "any",
		};

		// setDisableButton({disabled:true})
		// if(!breakStart.disabled){
		//   setBreakStart({disabled:true})
		//  if(attendence?.breaks?.map(d=>d.start)){
		setDouble(true);
		// setDisableButton({disabled:true})

		await httpClient.put(ATTENDENCE.BREAK_START, formData);
		// await dispatch(breakStart(formData));
		socket.emit("checkIn", userDetail.id);
		//  }
		// setBreakStart({disabled:false})
		// }
		// setBreakStart({disabled:false})
		// await httpClient.put(ATTENDENCE.BREAK_START, formData);
		// // await dispatch(breakStart(formData));
		// socket.emit('checkIn', userDetail.id);
		// setBreakStart({disabled:false})
	};

	const handleBreakEnd = async () => {
		// await dispatch(breakEnd());
		setDouble(false);
		await httpClient.put(ATTENDENCE.BREAK_END);
		socket.emit("checkIn", userDetail.id);
	};

	const formatTime = (time) => {
		return moment(time, "h:m").format("hh:mm A");
	};

	const showLocationPermissionError = () => {
		alert("Please enable location permission of you browser");
		getGeoloaction();
	};

	return (
		<>
			<div className="col-lg-9 mb-4">
				<div className="row">
					<div className="col-md-6 mb-4 mb-md-0">
						<div className="dashboard_card">
							<div className="intime">
								<div className="time_btn  ">
									{attendence?.check_in ? (
										<>
											{(lastBreak?.start && !lastBreak.end) ||
											attendence.check_out ? (
												<button className="disabled" disabled>
													Time out
												</button>
											) : (
												<button
													className="btn_red "
													onClick={() => {
														locationEnabled
															? setShowCheckout(true)
															: showLocationPermissionError();
													}}
												>
													Time out
												</button>
											)}
										</>
									) : (
										<>
											{buttonDisable ? (
												<button className="disabled" disabled>
													Time In
												</button>
											) : (
												<button
													className="btn_green"
													onClick={() => {
														locationEnabled
															? handleShowWorkFrom()
															: showLocationPermissionError();
													}}
													// onClick={handleShowWorkFrom}
												>
													Time In
												</button>
											)}
										</>
									)}
								</div>

								<div className="time_input">
									<div className="row">
										<div className="col-lg-6 col-6 p-lg-0">
											<label className="fw-bold">Work Status: </label>
										</div>
										<div className="col-lg-6 col-6">
											<p className="text-start" style={{ paddingLeft: "0px" }}>
												{attendence
													? attendence.work_from === "office"
														? " WFO"
														: " WFH"
													: "-- : --"}
											</p>
										</div>
									</div>
									<div className="row">
										<div className="col-lg-6 col-6 p-lg-0">
											<label className="fw-bold">In Time:</label>
										</div>
										<div className="col-lg-6 col-6">
											<p className="text-start">
												{attendence?.check_in
													? moment(attendence.check_in).format("LT")
													: "-- : --"}
											</p>
										</div>
									</div>
									<div className="row">
										<div className="col-lg-6 col-6 p-lg-0">
											<label className="fw-bold">Out Time:</label>
										</div>
										<div className="col-lg-6 col-6">
											<p className="text-start">
												{attendence?.check_out
													? moment(attendence.check_out).format("LT")
													: "-- : --"}
											</p>
										</div>
									</div>
									{attendence?.working_hours && (
										<div className="row">
											<div className="col-lg-6 col-6 p-lg-0">
												<label className="fw-bold">Total Time:</label>
											</div>
											<div className="col-lg-6 col-6 text-start">
												<span style={{ whiteSpace: "nowrap" }}>
													{attendence?.working_hours} (HH:MM)
												</span>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
					<div className="col-md-6">
						<div className="dashboard_card">
							<div className="intime">
								<div className="time_btn ">
									{!lastBreak || lastBreak?.end ? (
										<>
											{attendence?.check_in && !attendence?.check_out ? (
												<button
													className="btn_yellow"
													onClick={() => handleBreakStart()}
													disabled={double}
												>
													Break Start
												</button>
											) : (
												<button className="disabled" disabled>
													Break Start
												</button>
											)}
										</>
									) : (
										<button
											className="btn_red"
											onClick={() => handleBreakEnd()}
										>
											{" "}
											Break End
										</button>
									)}
								</div>
								<div className="break_input">
									{attendence?.breaks.length > 0 && (
										<div className="d-flex justify-content-around">
											<p className="fw-bold">Start</p>
											<p className="fw-bold">End</p>
										</div>
									)}
									{attendence?.breaks.length > 0 &&
										attendence.breaks.map((br, i) => (
											<p key={i}>
												{/* <strong>{i + 1}.</strong> */}
												<span>
													{" "}
													{br.start
														? moment(br.start).format("LT")
														: "-- : --"}{" "}
												</span>{" "}
												-{" "}
												<span>
													{br.end ? moment(br.end).format("LT") : "-- : --"}
												</span>
											</p>
										))}
									{/* <p>
                    <span>04: 30 PM</span> - <span>04: 45 PM</span>
                  </p> */}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="col-lg-3 mb-4">
				<div className="dashboard_card">
					<div className="working_hours">
						<p>
							Working Time:{" "}
							<strong>
								{userDetail ? userDetail.working_hour + " Hr" : "-"}{" "}
							</strong>
						</p>
						<p>
							{formatTime(userDetail.in_time)} -{" "}
							{formatTime(userDetail.out_time)}
						</p>
						<button className="req_btn" onClick={handleShowRequest}>
							Request to Change
						</button>
					</div>
				</div>
			</div>
			<Modal show={show} onHide={handleCloseWorkFrom} backdrop="static">
				<Modal.Header>
					<Modal.Title>Confirm Workplace</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div style={{ paddingBottom: "10px" }}>
						Please tell where are you working from
					</div>
					<div className="row">
						<div className="mb-4 col-lg-6">
							<label style={{ cursor: "pointer" }}>
								<input
									id="office"
									value="office"
									name="workFrom"
									type="radio"
									checked={values.work_from === "office"}
									style={{ marginRight: "10px" }}
									// value={values.work_from}
									onChange={(e) =>
										setValues({ ...values, work_from: e.target.value })
									}
								/>
								Work From Office
							</label>
						</div>
						<div className="mb-4 col-lg-6">
							<label style={{ cursor: "pointer" }}>
								<input
									id="home"
									value="home"
									name="workFrom"
									type="radio"
									checked={values.work_from === "home"}
									style={{ marginRight: "10px" }}
									// value={values.work_from}
									onChange={(e) =>
										setValues({ ...values, work_from: e.target.value })
									}
								/>
								Work From Home
							</label>
						</div>
						<small style={{ color: "red" }} role="alert">
							{errorEmail}
						</small>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant="secondary"
						onClick={() => {
							handleCloseWorkFrom();
							setButtonDisable(false);
						}}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						id="submit"
						onClick={(e) => handleCheckIn(e)}
					>
						Submit
					</Button>
				</Modal.Footer>
			</Modal>
			{handleShow && (
				<Modal show={handleShow} onHide={handleClose} backdrop="static">
					<Modal.Header>
						<Modal.Title>Request Change</Modal.Title>
						<button
							type="button"
							className="btn-close"
							data-bs-dismiss="modal"
							aria-label="Close"
							onClick={handleClose}
						></button>
					</Modal.Header>
					<Modal.Body>
						<form onSubmit={sendRequest}>
							<div className="">
								<div className="row">
									<div className="col-md-12">
										<div className="mb-3">
											<textarea
												className="form-control"
												rows="6"
												id="message-text"
												required
												placeholder="Send a change request"
												value={values.request_message}
												onChange={(e) => {
													setValues({
														...values,
														request_message: e.target.value,
													});
													setEmployeeRegex("");
												}}
											/>
											<small style={{ color: "red" }} role="alert">
												{employeeRegex}
											</small>
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
													onClick={handleClose}
												>
													Close
												</button>
												<button type="submit" className="btn btn-submit ">
													Save changes
												</button>
											</div>
										)}
									</div>
								</div>
							</div>
						</form>
					</Modal.Body>
				</Modal>
			)}

			{showCheckout && (
				<ConfirmCheckout
					open={showCheckout}
					close={handleCloseTimeOutModal}
					socket={socket}
					userId={userDetail?.id}
          locationData={locationData}
				/>
			)}
			{showAddStatusAlert && (
				<AddStatusAlert open={showAddStatusAlert} close={handleAlertClose} />
			)}
		</>
	);
}

export default Timing;
