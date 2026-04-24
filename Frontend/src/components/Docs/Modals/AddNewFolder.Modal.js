import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { httpClient } from '../../../constants/Api';
import { DOCS, ORGANISATION } from '../../../constants/AppConstants';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { useSelector } from 'react-redux';

function AddNewFolder({ show, onHide, data, updateBreadCrumArray, callback }) {
  const [loading, setLoading] = useState(false);
  const [inputFields, setInputFields] = useState([]);
  const [userId, setUserId] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [options, setOptions] = useState();
  const [tempUsername, setTempUsername] = useState();
  const [folderDetails, setFolderDetails] = useState({ name: '' });
  const [permission, setPermission] = useState("Viewer");
  const usersId = useSelector((state) => state.user.user.user.id);

  useEffect(() => {
    getUsers();
  }, []);

  const permissionType = [
    { label: 'viewer', value: 'Viewer' },
    { label: 'editor', value: 'Editor' },
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

  const validation = () => {
    let valid = true;
    if (folderDetails.name.trim() == '') {
      toast.error('Please Enter Folder Name');
      valid = false;
    }
    return valid;
  };

  const addFolder = async () => {
    // let usersPermission = { "user_id": usersId, "permission": "Editor" };
    // selectedUser.push(usersPermission)
    folderDetails['parentFolder'] = data._id;
    folderDetails['permittedUsers'] = selectedUser;
    const valid = validation();
    if(valid){
      // if(folderDetails.isPublic){
      //   selectedUser = [];
      // }
      let usersPermission = { "user_id": usersId, "permission": "Editor" };
      selectedUser.push(usersPermission)
      folderDetails['permittedUsers'] = selectedUser;
    }else{
      return;
    }
    // const valid = validation();
    // if (valid) {
      try {
        setLoading(true);
        if(data.isPublic){
          folderDetails['isPublic'] = true;
        }
        const resp = await httpClient.post(DOCS.CREATE_FOLDER, folderDetails);
        updateBreadCrumArray(resp.data.result, "ADD");
        toast.success("Folder Added Successfully");
        // onHide(data._id);
        onHide();
        callback(data._id);
      } catch (err) {
        console.log(err);
        if (err.response) toast.error(err.response.data.message);
        else toast.error('Error');
      } finally {
        setLoading(false);
      }
    // }
  };

  const Styles = {
    container: (provided) => ({
      ...provided,
      width: '77%',
      marginTop: '8px',
    }),
  };

  return (
    <>
      <Modal show={show} onHide={onHide} contentClassName="modal-width">
        <Modal.Header>
          <Modal.Title>Create New Folder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label className="head-title-info fw-light mb-1 pe-4">Add Folder</label>
            <br />
            <input
              className="form-control"
              style={{ width: '77%' }}
              type="text"
              placeholder="Enter Folder Name"
              onChange={(e) => {
                setFolderDetails({ ...folderDetails, name: e.target.value, type: 'Folder' });
              }}
            />
          </div>
          <div className="mt-2">
            <label className="head-title-info fw-light mb-1 pe-4">
              {
                data.isPublic ? <input style={{ marginRight: '5px' }} type="checkbox" checked={true} /> 
                              : <input style={{ marginRight: '5px' }} type="checkbox" onChange={(e) => setFolderDetails({ ...folderDetails, isPublic: e.target.checked })} />
              }
              Is Public
              {/* <input style={{ marginRight: '5px' }} type="checkbox" onChange={(e) => setFolderDetails({ ...folderDetails, isPublic: e.target.checked })} />
              Is Public */}
            </label>
          </div>
          {!(folderDetails.isPublic || data.isPublic) && <div>
            <div className="head-title-wrap">
              <h6 className="head-title-info col-black fw-light m-0 pe-4 mt-2"> Permitted User</h6>
            </div>
            <div className="mt-2">
              <div  className="row" style={{paddingLeft: '13px'}}>
              {
                selectedUser.length > 0 &&
                <div id='style-3' className='col-md-9 scroll-css'
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    border: '1px solid rgb(128 134 139)',
                    borderRadius: '0.375rem',
                    paddingTop: '8px',
                    overflowY: 'scroll',
                    maxHeight: '135px'
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
                </div>}
                  {selectedUser.length > 0 && (
                    <div className="col-md-3">
                      <select 
                        className="form-select"
                        onChange={(e) => 
                        setPermission(e.target.value)}
                      >
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
                        setTempUsername(e.target ? e.target.value:"");
                      }}
                    />
                  </div>
              )}
            </div>
          </div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" onClick={addFolder}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AddNewFolder;
