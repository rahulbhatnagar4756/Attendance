import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { DOCS } from "../../../constants/AppConstants";
import { httpClient } from "../../../constants/Api";
import DirectoriesTree from "../components/DirectoriesTree";
import { useSelector } from 'react-redux';

function DeleteFileOrFolderModal(props) {
  const { show, onHide, type, allDirectoriesData, nodeData, callback, targetedData, updateBreadCrumArray } = props;
  const [loading, setLoading] = useState(false);
  const [folderTreeView, setFolderTreeView] = useState();
  const userId = useSelector((state) => state.user.user.user.id);

  let documentIds = [];
  const getTargettedNodeChildrensIds =  async (data) => {
    if(data.children && data.children.length > 0){
      if(!documentIds.includes(data._id)){
        documentIds.push(data._id);
      }
      for(let currenElement=0; currenElement<data.children.length; currenElement++){
        if(data.children[currenElement].children.length > 0){
          documentIds.push(data.children[currenElement]._id);
          getTargettedNodeChildrensIds(data.children[currenElement])
        }else{
          documentIds.push(data.children[currenElement]._id);
        }
      }
    }else{
      documentIds.push(data._id);
    }
  return documentIds
  }

  if(targetedData){
    getTargettedNodeChildrensIds(targetedData);
  }  

  const deleteFileOrFolderModal = async () => {
    try {
      const res = await httpClient.delete(DOCS.DELETE_DOC, {data:documentIds});
      if (res.status === 200) {
        updateBreadCrumArray(targetedData, "DELETE")
        toast.success(`${type} Deleted Sucessfully`);
        onHide();
        // getAllDocuments();
        callback(nodeData._id)
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
      <Modal show={show} onHide={onHide}>
        <Modal.Header>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ paddingBottom: "10px" }}>
            Are you sure you want to delete this {type}?
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            No
          </Button>
          <Button variant="primary" onClick={deleteFileOrFolderModal}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
      {folderTreeView && <DirectoriesTree allDirectoriesData={folderTreeView} />}

    </>
  );
}

export default DeleteFileOrFolderModal;
