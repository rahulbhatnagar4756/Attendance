import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { httpClient } from '../../../constants/Api';
import { DOCS, ORGANISATION } from '../../../constants/AppConstants';
import { toast } from 'react-toastify';
import Select from 'react-select';

function ShareDocumentModal({ show, onHide, name, permittedUsers, id , targetedData}) {
  const usersPermitted = permittedUsers.map((d) => {
    return (
      { user_id: d.user_id.id, permission: d.permission , name:d.user_id.name, emp_id:d.user_id.emp_id }
    )
  });

  const [options, setOptions] = useState();
  const [tempUsername, setTempUsername] = useState();
  const [userId, setUserId] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [checked, setChecked] = useState(false);
  const [permission, setPermission] = useState("Viewer");
  const [docPermission, setDocPermission] = useState(usersPermitted);

  useEffect(() => {
    getUsers();
  }, []);

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

  const permissionType = [
    { label: 'Viewer', value: 'Viewer' },
    { label: 'Editor', value: 'Editor' },
  ];

  const handleUsers = (event, index) => {
    const id = userId.find(({ label }) => label === event.label);
    const selectedUserIndex = options.findIndex((x) => x.label === id.label);
    if (selectedUserIndex >= 0) {
      options.splice(selectedUserIndex, 1);
    }
    setSelectedUser((selectedUser) => [...selectedUser, { user_id: id.value }]);
  };

  const handleRemove = (index, id) => {
    const removedUserData = userId.find((x) => x.value === id.user_id);
    const removedUser = { label: removedUserData.label, value: '' };
    options.push(removedUser);
    const values = [...selectedUser];
    values.splice(index, 1);
    setSelectedUser(values);
  };

  const editDocPermissions = async () => {
    const selectedUsersPermission = selectedUser.map((d) => {
      return (
        { user_id: d.user_id, permission: permission }
      )
    });
    docPermission.push(...selectedUsersPermission);
    try {
      const res = await httpClient
        // .patch(DOCS.EDIT_DOC_PERMISSIONS.replace("{docId}", id), { permittedUsers: docPermission })
        .post(DOCS.EDIT_DOC_PERMISSIONS, { permittedUsers: docPermission, documentIds: documentIds })
      if (res.status === 200) {
        toast.success("Updated Sucessfully");
        onHide();
      }
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const getUsers = async () => {
    try {
      const users = await httpClient.get(ORGANISATION.GET_ALL_EMPLOYEES);
      const usersList = users.data.result;
      const Labels = usersList.map((data) => {
        return { label: `${data.name} (${data.emp_id})`, value: '' };
      });
      const LabelswithId = usersList.map((data) => {
        return { label: `${data.name} (${data.emp_id})`, value: data.id };
      });
      setUserId(LabelswithId);
      setOptions(Labels);
    } catch (err) {
      if (err.response) toast.error(err.response.data.message);
      else toast.error('Error in fetching user detail');
    } finally {
    }
  };

  const Styles = {
    container: (provided) => ({
      ...provided,
      width: '77%',
      marginTop: '8px',
    }),
  };

  const handleClick = (permissions, userId) => {
      for (const i of docPermission) {
        if (i.user_id === userId.user_id) {
            i.permission = permissions.value;
        }
       }
   setDocPermission(docPermission)
  }

  return (
    <>
      <Modal show={show} onHide={onHide} contentClassName="modal-width">
        <Modal.Header>
          <Modal.Title>Share {name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!checked && (
            <div>
              <div className="head-title-wrap">
                <h6 className="head-title-info col-black fw-light m-0 pe-4 mt-2">Add Users</h6>
              </div>
              <div className="mt-2">
                <div className="row" style={{ paddingLeft: '13px' }}>
                  {selectedUser.length > 0 && (
                    <div
                      id="style-3"
                      className="col-md-9 scroll-css"
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        border: '1px solid rgb(128 134 139)',
                        borderRadius: '0.375rem',
                        paddingTop: '8px',
                        overflowY: 'scroll',
                        maxHeight: '135px',
                      }}
                    >
                      {selectedUser &&
                        userId &&
                        selectedUser?.map((item, index) => (
                          <div
                            key={index}
                            className="boxed"
                            style={{
                              borderRadius: '4px',
                              marginBottom: '10px',
                              marginRight: '10px',
                              padding: '4px 8px',
                              backgroundColor: 'lightgray',
                            }}
                          >
                            {userId.find((opt) => opt.value === item.user_id).label}
                            {item ? (
                              <i
                                className="fa fa-close mx-2"
                                aria-hidden="true"
                                style={{
                                  fontSize: '20px',
                                  color: 'grey',
                                  cursor: 'pointer',
                                }}
                                onClick={() => handleRemove(index, item)}
                              ></i>
                            ) : null}
                          </div>
                        ))}
                    </div>
                  )}
                  {selectedUser.length > 0 && (
                    <div className="col-md-3">
                      <select className="form-select" value={permission} onChange={(e) => setPermission(e.target.value)}>
                        {permissionType &&
                          permissionType.map((item, i) => (
                            <option value={item.value} key={i}>
                              {item.value}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
                {options && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Select
                      isSearchable={true}
                      closeMenuOnSelect={true}
                      styles={Styles}
                      menuPosition={'fixed'}
                      placeholder="Search User"
                      value={tempUsername}
                      options={options}
                      onChange={(e) => {
                        handleUsers(e);
                        setTempUsername(e.target ? e.target.value : '');
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="head-title-wrap">
            <h6 className="head-title-info col-black fw-light m-0 pe-4 mt-3 mb-3">Users with access</h6>
            <div className="row align-items-center">
              {docPermission&&
                docPermission.map((item, i) => (
                  <>
                    <div className="col-md-9">{`${item.name} (${item.emp_id})`}</div>
                    <div className="col-md-3">
                      <Select
                       className='mb-2'
                        onChange={(e) => handleClick(e,item)}
                        defaultValue={{label:item.permission, value:item.permission}}
                        options={permissionType}
                      />
                    </div>
                  </>
                ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" onClick={editDocPermissions}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ShareDocumentModal;