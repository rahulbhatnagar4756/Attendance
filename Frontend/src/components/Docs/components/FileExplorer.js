import React, { useState, useEffect } from 'react';
import { FileIcon, defaultStyles } from 'react-file-icon';
import moment from 'moment';
import { filesize } from "filesize";
import { saveAs } from 'file-saver';
import { ContextMenuTrigger, ContextMenu, ContextMenuItem } from 'rctx-contextmenu';
import DeleteFileOrFolderModal from '../Modals/DeleteFileOrFolder.Modal';
import RenameModal from '../Modals/Rename.Modal';
import PreviewFileModal from '../Modals/PreviewFile.Modal';
import ShareDocumentModal from '../Modals/ShareDocument.Modals';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import AddNewFolder from '../Modals/AddNewFolder.Modal';
import AddNewFile from '../Modals/AddNewFile.Modal';
import { DOCS } from '../../../constants/AppConstants';
import { toast } from 'react-toastify';
import { httpClient } from '../../../constants/Api';
import { useSelector } from 'react-redux';
import { FileUploader } from 'react-drag-drop-files';
import FileLoader from '../../Layout/FileLoader';
import { Link } from 'react-router-dom';

const FileExplorer = ({ nodeData, onSelectNode, callback, breadCrumbData, callBackForAddDoc}) => {
  // console.log({nodeData} ,{breadCrumbData});
  const userId = useSelector((state) => state.user.user.user.id);
  const [loading, setLoading] = useState(false);
  const [fileDetails, setFileDetails] = useState({});
  const [showFolderModal, setShowFolderModal] = useState({ open: false, data: "" });
  const [showFileModal, setShowFileModal] = useState({ open: false, data: "" });
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false, folderId: "", type: "", data:"" });
  const [showRenameModal, setShowRenameModal] = useState({ open: false, folderId: "", type: "", value: "" });
  const [showPreviewModal, setShowPreviewModal] = useState({ open: false, folderId: "", type: "", value: "" });
  const [shareModal, setShowShareModal] = useState({ open: false, id: "", type: "", name: "", permittedUsers: "", data:"" });
  const [data, setData] = useState();
  const [selectedUser, setSelectedUser] = useState([{"user_id":userId, "permission":"Editor"}]);
  const [labelText, setLabelText] = useState("Drag & Drop/Upload File here");
	const [fileUploaderKey, setFileUploaderKey] = useState(0); // Control re-render of FileUploader
  const fileTypes = [
		"JPG",
		"PNG",
		"GIF",
		"TXT",
		"PDF",
		"XLSX",
		"DOCX",
		"DOC",
		"XLS",
		"PPT",
		"PPTX",
	];

  useEffect(() => {
    getAllDocuments();
  }, [])

  const handleCloseDeleteModal = () => {
    setShowDeleteModal({ open: false });
    callback(nodeData._id)
  };

  const handleCloseFolder = () => {
    setShowFolderModal({ open: false });
    // callback(folderId)
    callback(nodeData._id)
  };

  const handleCloseFile = () => {
    setShowFileModal({ open: false });
    // callback(folderId)
    callback(nodeData._id)
  };



  const handleCloseRenameModal = () => {
    setShowRenameModal({ open: false });
    callback(nodeData._id)
  };

  const handleClosePreviewModal = () => {
    setShowPreviewModal({ open: false });
  };

  const handleCloseShareModal = () => {
    setShowShareModal({ open: false });
    callback(nodeData._id)
  };

  const handleClick = (data) => {
    const url = data.path;
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        const fileExtension = data.path.substring(data.path.lastIndexOf('.') + 1);
        const fileName = (data.name + "." + fileExtension)
        saveAs(blob, fileName);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }

  const handlePreviewClick = (docID) => {
    const type = "doc_vault";
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
				const fileName = data.name + "." + fileExtension;
				saveAs(blob, fileName);
			})
			.catch((error) => {
				console.error("There was a problem with the fetch operation:", error);
			});
	};

  const getAllDocuments = async () => {
    try {
      const users = await httpClient.get(DOCS.GET_USERS_ALL_FOLDER.replace("{userId}", userId));
      setData(users.data.result.getFomattedData[0].children);
      return users.data.result.getFomattedData;
    } catch (err) {
      if (err.response) toast.error(err.response.data.message);
      else toast.error('Error in fetching docs');
    }
  };

  const addFile = async (file) => {
    if (file) {
      // Check if file size is more than 25 MB
			const maxSizeInBytes = 25 * 1048576; // 25 MB in bytes
			if (file.size > maxSizeInBytes) {
				toast.error("Please upload a file less than 25MB");
				setLabelText("File size exceeds 25 MB, please try again.");
				setFileUploaderKey(prevKey => prevKey + 1); // Reset FileUploader component
				return;
			}
      fileDetails.name = file.name;
      fileDetails['parentFolder'] = nodeData._id;
      fileDetails['isPublic'] = "false";
      fileDetails['type'] = "File";
      fileDetails['path'] = file;
      fileDetails['permittedUsers'] = selectedUser;
      const formData = new FormData();
      for (let key of Object.keys(fileDetails)) {
        if (key == 'permittedUsers') {
          formData.append('permittedUsers', JSON.stringify(fileDetails[key]));
        } else {
          formData.append([key], fileDetails[key]);
        }
      }
      try {
        setLoading(true);
        setLabelText("File Uploading...");
				setFileUploaderKey(prevKey => prevKey + 1); // Reset FileUploader component
        const resp = await httpClient.post(DOCS.CREATE_FOLDER, formData);
        callBackForAddDoc(resp.data.result, "ADD");
        toast.success('File Added Successfully');
        setLabelText("File uploaded successfully, upload another");
        callback(nodeData._id);
      } catch (err) {
        console.log(err);
        if (err.response) toast.error(err.response.data.message);
        else {
           toast.error('Error');
        }
        setLabelText("File upload failed. Please try again.");   
      } finally {
        setLoading(false);
      };
    }
    else {
      toast.warn("Please Upload File")
    };
  }

  const handleFilPreViewClick = (data) => {
		{["jpg", "png", "gif", "txt", "pdf"].includes(
			data.path.substring(data.path.lastIndexOf(".") + 1)
		) ? handlePreviewClick(data._id) : handleDownloadClick(data)
	  }
  }

  const Styles = {
    container: (provided) => ({
      ...provided,
      width: '77%',
      marginTop: '8px',
    }),
  };


  return (
    <>
      <div className="align-items-center justify-content-between d-flex main_breadcrumb">
        {nodeData && data && (
					<nav aria-label="breadcrumb">
						{breadCrumbData.length == 0 && (
							<ol className="breadcrumb mb-0">
								<li className="breadcrumb-item">
									<a href="/docs/main-page">{"Documents"}</a>
								</li>
							</ol>
						)}
						<ol className="breadcrumb mb-0">
							{breadCrumbData.length > 0 &&
								breadCrumbData.map((item, i) => (
                  // console.log({item}, "in brdcrum"),
									<li className="breadcrumb-item">
										<a
											href="javascript:void(0)"
											onClick={() =>
												i === breadCrumbData.length - 1
													? console.log(i)
													: onSelectNode(item)
											}
										>
											{item.name}
										</a>
									</li>
								))}
						</ol>
					</nav>
				)}
        { breadCrumbData && breadCrumbData.length > 1 && (nodeData.isPublic ||
          nodeData.permittedUsers && nodeData.permittedUsers.length > 0 && nodeData.permittedUsers.find((docPermissionType)=>(docPermissionType.user_id.id===userId && docPermissionType.permission==="Editor"))) &&
            <DropdownButton id="dropdown-basic-button" title={<span><i className="fa fa-sharp fa-solid fa-plus"></i> Add</span>}>
              <Dropdown.Item onClick={() => setShowFolderModal({ open: true, data: nodeData })}>Add Folder</Dropdown.Item>
              <Dropdown.Item onClick={() => setShowFileModal({ open: true, data: nodeData })}>Add File</Dropdown.Item>
            </DropdownButton>
          
        }
      </div>
      {nodeData && nodeData.children && nodeData.children.length > 0 && <div className='col-md-12 border-bottom grid-table-heading'>
        <div className='row m-0'>
          <div className='col-md-3 fw-bold'>Name</div>
          <div className='col-md-4 fw-bold'>Last modified</div>
          <div className='col-md-3 fw-bold'>Added By</div>
          <div className='col-md-2 fw-bold'>Size</div>
        </div>
      </div>}
      <div className='col-md-12 grid-table-body'>
        {nodeData && nodeData.children &&
          nodeData.children.map((data, i) => (data.type === "Folder" && (
            // console.log({data}, {userId} ,  "in front folder"),
            <> <ContextMenuTrigger
              id={i + 1}>
              <div className='row row-highlight' onDoubleClick={() => onSelectNode(data)}>
                <div className='col-md-3 border-bottom py-1' ><span className='me-2 file-type-icons' ><i className="fa fa-folder" aria-hidden="true"></i></span>{data.name}</div>
                <div className='col-md-4 border-bottom py-1'>{moment(data.updatedAt).format('lll')}</div>
                <div className='col-md-3 border-bottom py-1'>{data.createdBy && data.createdBy.name ? data.createdBy.name : "-"}</div>
                <div className='col-md-2 border-bottom py-1'>{"-"}</div>
              </div>
            </ContextMenuTrigger><ContextMenu id={i + 1}>
              {/* <ContextMenuItem disabled={(data.permittedUsers && data.permittedUsers.length > 0 && data.permittedUsers.find(d=>(d.user_id.id===userId || d.user_id===userId) && d.permission === "Editor"))?false:true} onClick={() => setShowFolderModal({ open: true, data: data })}>Add Folder</ContextMenuItem> */}
              {/* <ContextMenuItem disabled={(data.permittedUsers && data.permittedUsers.length > 0 && data.permittedUsers.find(d=>(d.user_id.id===userId || d.user_id===userId) && d.permission === "Editor"))?false:true} onClick={() => setShowFileModal({ open: true, data: data })}>Add File</ContextMenuItem> */}
              <ContextMenuItem disabled={data.isPublic || (data.permittedUsers && data.permittedUsers.length > 0 && data.permittedUsers.find(d=>(d.user_id.id===userId || d.user_id===userId) && d.permission === "Editor"))?false:true} onClick={() => setShowRenameModal({ open: true, folderId: data._id, type: data.type, value: data.name })}>Rename</ContextMenuItem>
              <ContextMenuItem disabled={data.isPublic?true:false || (data.permittedUsers && data.permittedUsers.length > 0 && data.permittedUsers.find(d=>(d.user_id.id===userId || d.user_id===userId) && d.permission === "Editor"))?false:true} onClick={() => setShowShareModal({ open: true, id: data._id, type: data.type, name: data.name, permittedUsers: data.permittedUsers, data:data })}>Share</ContextMenuItem>
              <ContextMenuItem disabled={data.isPublic || (data.permittedUsers && data.permittedUsers.length > 0 && data.permittedUsers.find(d=>(d.user_id.id===userId || d.user_id===userId) && d.permission === "Editor"))?false:true} onClick={() => setShowDeleteModal({ open: true, folderId: data._id, type: data.type, data:data})}>Delete</ContextMenuItem>
            </ContextMenu></>)))}
        {nodeData && nodeData.children &&
          nodeData.children.map((data, i) => (data.type === "File" && (
            // console.log({data}, {userId} ,  "in front file"),
            <><ContextMenuTrigger
            id={i + 1}>  
              <div className='row row-highlight' onClick={()=>handleFilPreViewClick(data)}  > 
                <div className='col-md-3 border-bottom py-1'>
                  <Link style = {{ wordBreak: 'break-all' }} className="d-flex row-highlight">
                    <span className='pdf-file-icon'><FileIcon extension={(data.path).substring(data.path.lastIndexOf('.') + 1)} {...defaultStyles[(data.path).substring(data.path.lastIndexOf('.') + 1)]} /></span>{data.name}
                  </Link> 
                </div>
                <div className='col-md-4 border-bottom py-1'>{moment(data.updatedAt).format('lll')}</div>
                <div className='col-md-3 border-bottom py-1'>{data.createdBy && data.createdBy.name ? data.createdBy.name : "-"}</div>
                <div className='col-md-2 border-bottom py-1'>{filesize(data.fileSize, { base: 2, standard: "jedec" })}</div>
              </div>
            </ContextMenuTrigger><ContextMenu id={i + 1}>
                {["jpg", "png", "gif", "txt", "pdf"].includes(
											data.path.substring(data.path.lastIndexOf(".") + 1)
										) ? (
											<ContextMenuItem
												onClick={
													() => handlePreviewClick(data._id)
													// setShowPreviewModal({
													// 	open: true,
													// 	folderId: data._id,
													// 	type: data.path.substring(
													// 		data.path.lastIndexOf(".") + 1
													// 	),
													// 	value: data.path,
													// })
												}
											>
												Preview
											</ContextMenuItem>
										) : (
											<ContextMenuItem
												onClick={() => handleDownloadClick(data)}
											>
												Preview
											</ContextMenuItem>
								)}
                <ContextMenuItem disabled={data.isPublic || (data.permittedUsers && data.permittedUsers.length > 0 && data.permittedUsers.map(d => d.permission)[0] === "Editor")?false:true} onClick={() => setShowRenameModal({ open: true, folderId: data._id, type: data.type, value: data.name, permittedUsers: data.permittedUsers })}>Rename</ContextMenuItem>
                <ContextMenuItem onClick={() => handleClick(data)}>Download</ContextMenuItem>
                <ContextMenuItem disabled={data.isPublic?true:false || (data.permittedUsers && data.permittedUsers.length > 0 && data.permittedUsers.find(d=>(d.user_id.id===userId || d.user_id===userId) && d.permission === "Editor"))?false:true} onClick={() => setShowShareModal({ open: true, id: data._id, type: data.type, name: data.name, permittedUsers: data.permittedUsers, data:data })}>Share</ContextMenuItem>
                <ContextMenuItem disabled={data.isPublic || (data.permittedUsers && data.permittedUsers.length > 0 && data.permittedUsers.find(d=>(d.user_id.id===userId || d.user_id===userId) && d.permission === "Editor"))?false:true} onClick={() => setShowDeleteModal({ open: true, folderId: data._id, type: data.type, data:data })}>Delete</ContextMenuItem>
              </ContextMenu>
              </>)))}
        {nodeData && nodeData.type === "Folder" && breadCrumbData && breadCrumbData.length > 1 && 
          (nodeData.isPublic ||
            nodeData.permittedUsers && nodeData.permittedUsers.length > 0 && nodeData.permittedUsers.find((docPermissionType)=>(docPermissionType.user_id.id===userId && docPermissionType.permission==="Editor"))) &&
          //  nodeData.children.length <= 0 && 
          (<>
            <div className="m-4 drag_drop_section">
              {loading && <FileLoader />}
              {/* <FileUploader classes="drop_area" label="Drag & Drop/Upload File here" onDrop={addFile} onSelect={addFile} name="file" types={fileTypes} /> */}
              <FileUploader key={fileUploaderKey} classes="drop_area" label={labelText} onDrop={addFile} onSelect={addFile} name="file" types={fileTypes} />
            </div>
          </>
        )}
      </div>
      {showFolderModal.open && <AddNewFolder show={showFolderModal.open} onHide={handleCloseFolder} data={showFolderModal.data} updateBreadCrumArray={callBackForAddDoc} callback={callback} />}
      {showFileModal.open && <AddNewFile show={showFileModal.open} onHide={handleCloseFile} data={showFileModal.data} updateBreadCrumArray={callBackForAddDoc} callback={callback} />}
      {showDeleteModal.open && <DeleteFileOrFolderModal show={showDeleteModal.open} onHide={handleCloseDeleteModal} folderId={showDeleteModal.folderId} type={showDeleteModal.type} nodeData={nodeData} callback={callback} targetedData={showDeleteModal.data} updateBreadCrumArray={callBackForAddDoc} />}
      {showRenameModal.open && <RenameModal show={showRenameModal.open} onHide={handleCloseRenameModal} folderId={showRenameModal.folderId} type={showRenameModal.type} name={showRenameModal.value} />}
      {showPreviewModal.open && <PreviewFileModal show={showPreviewModal.open} onHide={handleClosePreviewModal} folderId={showPreviewModal.folderId} type={showPreviewModal.type} name={showPreviewModal.value} />}
      {shareModal.open && <ShareDocumentModal show={shareModal.open} onHide={handleCloseShareModal} id={shareModal.id} type={shareModal.type} name={shareModal.name} permittedUsers={shareModal.permittedUsers} targetedData={shareModal.data} />}
      {data && data.length === 0 && <div className="d-flex justify-content-center"><h5>No documents found.</h5></div>}
    </>


  )
};

export default FileExplorer;
