import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { DOCS } from "../../../constants/AppConstants";
import { httpClient } from "../../../constants/Api";
import { useSelector } from 'react-redux';
import DirectoriesTree from "../components/DirectoriesTree";

function RenameModal(props) {
    const { show, onHide, folderId,name, parentFolder,type } = props;
    const [loading, setLoading] = useState(false);
    const [folderTreeView, setFolderTreeView] = useState();
    const [docName, setDocName] =useState({value:name});
    const userId = useSelector((state) => state.user.user.user.id);
    
  const validation = () => {
    if (!docName.value) return false;
    else return true;
  };
    const renameFileOrFolderModal = async () => {
        try {
            const valid = validation();
            if (valid) {
            const res = await httpClient
                .patch(DOCS.RENAME_DOC.replace("{folderId}", folderId), { docName: docName.value })
            if (res.status === 200) {
                toast.success(`${type} Renamed Sucessfully`);
                onHide(parentFolder);
                getAllDocuments();
            }
        }
        else{
            toast.warn("Please Add Name");
        }
        } catch (err) {
            if (err.response) {
                toast.error(err.response.data.message);
            } else {
                toast.error("Something went wrong");
            }
        }
    };

    const getAllDocuments = async () => {
        try {
          setLoading(true);
          const users = await httpClient.get(DOCS.GET_USERS_ALL_FOLDER.replace("{userId}", userId));
          setFolderTreeView(users.data.result.getFomattedData);
          return users.data.result.getFomattedData;
        } catch (err) {
          if (err.response) toast.error(err.response.data.message);
          else toast.error('Error in fetching docs');
        } finally {
          setLoading(false);
        }
      };

      
    return (
        <>
            <Modal
                size="sm"
                show={show}
                onHide={onHide}
                aria-labelledby="example-modal-sizes-title-sm"
            >
                <Modal.Header>
                    <Modal.Title id="example-modal-sizes-title-sm">
                        Rename
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input
                        className="form-control"
                        style={{ width: '100%' }}
                        type="text"
                        value={docName.value}
                        onChange={(e) => {
                            setDocName({...name,value:e.target.value});
                        }}
                    >
                    </input></Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={renameFileOrFolderModal}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>
            {folderTreeView && <DirectoriesTree allDirectoriesData={folderTreeView} />}

        </>
    );
}

export default RenameModal;
