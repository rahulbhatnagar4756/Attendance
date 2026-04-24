import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { DOCS, LEAVES } from "../../../constants/AppConstants";
import { toast } from "react-toastify";
import { httpClient } from "../../../constants/Api";
import FilePreviewer from "react-file-previewer";
import FileViewer from "react-file-viewer";

export const PreviewFile = () => {
	// Extracting the type parameter from the URL query string
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const type = urlParams.get('type');
	const { docId } = useParams();
	const [loading, setLoading] = useState(false);
	const [docuementData, setDocumentData] = useState();
	const [fileType, setFileType] = useState();

	useEffect(() => {
		let API_URL = '';
		const getDocumentData = async (docId) => {
				try {
						setLoading(true);
						if(type === 'doc_vault'){
								API_URL = DOCS.GET_DOCUMENT_BY_DOC_ID.replace("{docId}", docId);
						} else if(type === 'sick_leave_attachment'){
								API_URL = LEAVES.GET_LEAVE_BY_ID.replace("{leaveId}", docId)
						} else {
								toast.error("No matching URL found.");
								return;
						}

						const data = await httpClient.get(API_URL);
						const docData = data.data.result;
						const fileType = docData.path.substring(docData.path.lastIndexOf(".") + 1);
						setDocumentData(docData);
						setFileType(fileType);
				} catch (err) {
						if (err.response) toast.error(err.response.data.message);
						else toast.error("Something went wrong.");
				} finally {
						setLoading(false);
				}
		};

		if (docId && type) {
				getDocumentData(docId);
		}else{
			toast.error("No matching URL found.");
		}
  }, []);

	// useEffect(() => {
	// 	if (docId && type) {
	// 		getDocumentData(docId);
	// 	}
	// }, []);
	// console.log({docId}, {type});
	// let API_URL = '';
	// if(type === 'doc_vault'){
	// 	API_URL = DOCS.GET_DOCUMENT_BY_DOC_ID.replace("{docId}", docId);
	// }else if(type === 'sick_leave_attachment'){
	// 	API_URL = LEAVES.GET_LEAVES_BY_ID.replace("{leaveId}", docId)
	// }else{
	// 	toast.err("No matching url type found");
	// 	return
	// }
	// const getDocumentData = async (docId) => {
	// 	try {
	// 		setLoading(true);
	// 		const data = await httpClient.get(
	// 			// DOCS.GET_DOCUMENT_BY_DOC_ID.replace("{docId}", docId)
	// 			API_URL
	// 		);
	// 		const docData = data.data.result;
	// 		const type = docData.path.substring(docData.path.lastIndexOf(".") + 1);
	// 		setDocumentData(docData);
	// 		setFileType(type);
	// 	} catch (err) {
	// 		console.log(err);
	// 		if (err.response) toast.error(err.response.data.message);
	// 		else toast.error("Error in fetching doc");
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	const populatePre = (url) => {
		var xhr = new XMLHttpRequest();
		xhr.onload = function () {
			document.getElementById("contents").textContent = this.responseText;
		};
		xhr.open("GET", url);
		xhr.send();
	};

	useEffect(() => {
		if (docuementData && fileType === "txt") {
			populatePre(docuementData.path);
		}
	}, [docuementData, fileType]);

	return (
		<>
			<div className="container-fluid" style={{padding: "2% 10%"}}>
				{docuementData && (
					<>
						{fileType === "pdf" && (
							<FilePreviewer
								file={{
									url: docuementData.path,
									hideControls: true,
								}}
							/>
						)}
						{fileType === "txt" && <pre id="contents"></pre>}
						{fileType !== "pdf" && fileType !== "txt" && (
							<FileViewer
								filePath={docuementData.path}
								fileType={fileType}
								// errorComponent={CustomErrorComponent}
								// onError={this.onError}/>
							/>
						)}
					</>
				)}
			</div>
		</>
	);
};
