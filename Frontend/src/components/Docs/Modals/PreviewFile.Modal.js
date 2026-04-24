import React, { useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import FilePreviewer from "react-file-previewer";
import FileViewer from "react-file-viewer";

const PreviewFileModal = ({ show, onHide, name, type }) => {
	const customStyles = {
		content: {
			top: "50%",
			left: "50%",
			right: "auto",
			bottom: "auto",
			marginRight: "-50%",
			transform: "translate(-50%, -50%)",
		},
	};

	const populatePre = (url) => {
		var xhr = new XMLHttpRequest();
		xhr.onload = function () {
			document.getElementById("contents").textContent = this.responseText;
		};
		xhr.open("GET", url);
		xhr.send();
	};

	useEffect(() => {
		if (type === "txt") {
			populatePre(name);
		}
	}, [type, name]);

	return (
		<>
			<Modal
				size="lg"
				show={show}
				onHide={onHide}
				aria-labelledby="example-modal-sizes-title-sm"
				style={customStyles}
			>
				<Modal.Header>
					<Modal.Title id="example-modal-sizes-title-sm">Preview</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{type === "pdf" && (
						<FilePreviewer
							file={{
								url: name,
								hideControls: true,
							}}
						/>
					)}
					{type === "txt" && <pre id="contents"></pre>}
					{type !== "pdf" && type !== "txt" && (
						<FileViewer
							filePath={name}
							fileType={type}
							// errorComponent={CustomErrorComponent}
							// onError={this.onError}/>
						/>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={onHide}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default PreviewFileModal;
