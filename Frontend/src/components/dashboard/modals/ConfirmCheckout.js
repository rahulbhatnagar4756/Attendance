import React from "react";
import { Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
// import { checkout } from "../../../redux/actions/TimingActions";
import { ATTENDENCE } from "../../../constants/AppConstants";
import { httpClient } from "../../../constants/Api";

function ConfirmCheckout(props) {
	// const dispatch = useDispatch();
	const { socket, userId } = props;

	const handleCheckOut = async () => {
		try {
			// dispatch(checkout());
			const res = await httpClient.put(
				ATTENDENCE.CHECK_OUT,
				props.locationData
			);

			if (res.data.statusUpdated) {
				socket.emit("checkIn", userId);
				props.close(true);
			} else {
				props.close(false);
			}
		} catch (error) {
			console.log(error);
		}
	};
	return (
		<>
			<Modal
				show={true}
				onHide={props.close}
				keyboard={false}
				centered
				//   size="lg"
				backdrop="static"
			>
				<Modal.Header className="border-0">
					<div>
						<h5 className="modal-title" id="exampleModalLabel">
							Confirm Time Out
						</h5>
					</div>
					<button
						type="button"
						className="btn-close"
						data-bs-dismiss="modal"
						aria-label="Close"
						onClick={props.close}
					/>
				</Modal.Header>
				<div className="modal-body">Are you sure, you want to Time-Out? </div>
				<div className="border-0 modal-footer pt-0">
					<button
						type="button"
						className="btn btn-secondary"
						data-bs-dismiss="modal"
						onClick={props.close}
					>
						No
					</button>
					<button
						type="button"
						className="btn btn-submit"
						onClick={() => handleCheckOut()}
					>
						Yes
					</button>
				</div>
			</Modal>
		</>
	);
}

export default ConfirmCheckout;
