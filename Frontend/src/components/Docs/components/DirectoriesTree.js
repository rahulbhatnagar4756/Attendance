import React, { useState } from 'react';
import Tree from 'react-animated-tree-v2';
import { ContextMenuTrigger, ContextMenu, ContextMenuItem } from 'rctx-contextmenu';
import DeleteFileOrFolderModal from '../Modals/DeleteFileOrFolder.Modal';
import RenameModal from '../Modals/Rename.Modal';
import AddNewFolder from '../Modals/AddNewFolder.Modal';
import AddNewFile from '../Modals/AddNewFile.Modal';

const DirectoriesTree = ({ allDirectoriesData, onSelectNode, callback, nodeData }) => {
  const [showFolderModal, setShowFolderModal] = useState({ open: false, data: "" });
  const [showFileModal, setShowFileModal] = useState({ open: false, data: "" });
  const [showDeleteModal, setDeleteModal] = useState({ open: false, folderId: "", type: "", allDirectoriesData: "", onSelectNode: "", parentFolder:"" });
  const [showRenameModal, setShowRenameModal] = useState({ open: false, folderId: "", type:"",value:"", parentFolder:"" });
  const handleClick = (node) => {
    onSelectNode(node)
  };

  const handleCloseFolder = (folderId) => {
    callbackFn(folderId)
    setShowFolderModal({ open: false });
  };

  const handleCloseFile = (folderId) => {
    setShowFileModal({ open: false });
    callbackFn(folderId)
  };

  const handleCloseDeleteModal = (folderId) => {
    setDeleteModal({ open: false });
    callbackFn(folderId)
  };

  const handleCloseRenameModal = (folderId) => {
    setShowRenameModal({ open: false });
    callback(folderId)
  };

  const dynamicSort = (property) => {
    let sortOrder = 1;
    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a, b) {
      let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      return result * sortOrder;
    }
  }

  const contextMenu = (node) => {
    if (node.type == 'Folder') {
      return <>
       {!(node.name == "Documents") ? <ContextMenu id={node._id}>
      <ContextMenuItem onClick={() => setShowFolderModal({ open: true, data: node })}>Add Folder</ContextMenuItem>
          <ContextMenuItem onClick={() => setShowFileModal({ open: true, data: node })}>Add File</ContextMenuItem>
          <ContextMenuItem  onClick={() => setShowRenameModal({ open: true, folderId: node._id, type: node.type, value:node.name, parentFolder:node.parentFolder})}>Rename</ContextMenuItem>
          <ContextMenuItem onClick={() => setDeleteModal({ open: true, folderId: node._id, type: "Folder", allDirectoriesData: allDirectoriesData, onSelectNode: onSelectNode, parentFolder: node.parentFolder })}>Delete</ContextMenuItem>
        </ContextMenu> : <ContextMenu id={node._id}>
          <ContextMenuItem onClick={() => setShowFolderModal({ open: true, data: node })}>Add Folder</ContextMenuItem>
          <ContextMenuItem onClick={() => setShowFileModal({ open: true, data: node })}>Add File</ContextMenuItem>
        </ContextMenu>}
        {node.children &&
          node.children.sort(dynamicSort("type")).reverse().map(child => contextMenu(child))}
          </>
    }
  }

  const plus = (props) => (
    <i {...props} className="fa fa-caret-right" style={{ marginRight: "8px" }} aria-hidden="true"></i>
  );
  const minus = (props) => (
    <i {...props} className="fa fa-caret-down" style={{ marginRight: "8px" }} aria-hidden="true"></i>
  );

  const getDirectoryStructure = (node) => {
    if (node && node.type == 'Folder') {
      return <Tree style={{cursor :"pointer"}} icons={{ plusIcon: plus, minusIcon: minus }}  content={<ContextMenuTrigger
        id={node._id}
      >
        <div className={nodeData && node._id===nodeData._id? 'selected-tree-node':  ''}>
        <i className="fa fa-folder fa-sm" aria-hidden="true"></i> {node.name}
        </div>
      </ContextMenuTrigger>}
        onItemClick={() => handleClick(node)}>
        {node.children &&
          node.children.sort(dynamicSort("type")).reverse().map(child => getDirectoryStructure(child))}
      </Tree>
    }
  }
  const callbackFn = (data) => {
    callback(data);
  }
  return (
    <>
      {
        allDirectoriesData.length && allDirectoriesData.sort(dynamicSort("type")).reverse().map((item, index) => (
          getDirectoryStructure(item)
        ))
      }
      {showFolderModal.open && <AddNewFolder  callbackFn={callbackFn} show={showFolderModal.open} onHide={handleCloseFolder} data={showFolderModal.data} />}
      {showFileModal.open && <AddNewFile show={showFileModal.open} onHide={handleCloseFile} data={showFileModal.data} />}
      {showRenameModal.open && <RenameModal  show={showRenameModal.open} onHide={handleCloseRenameModal} folderId={showRenameModal.folderId} type={showRenameModal.type} name={showRenameModal.value}  parentFolder={showDeleteModal.parentFolder}/>}
      {showDeleteModal.open && <DeleteFileOrFolderModal  callbackFn={callbackFn}  show={showDeleteModal.open} onHide={handleCloseDeleteModal} folderId={showDeleteModal.folderId} type={showDeleteModal.type} allDirectoriesData={allDirectoriesData} onSelectNode={onSelectNode}  parentFolder={showDeleteModal.parentFolder}/>}
      {
      /* For dynamic context menus */}
      {
        allDirectoriesData.length && allDirectoriesData.sort(dynamicSort("type")).reverse().map((item, index) => (
          contextMenu(item)
        ))
      }
    </>
  );
};

export default DirectoriesTree;
