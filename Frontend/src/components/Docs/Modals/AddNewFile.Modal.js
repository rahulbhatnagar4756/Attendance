import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { httpClient } from '../../../constants/Api';
import { DOCS, ORGANISATION } from '../../../constants/AppConstants';
import { toast } from 'react-toastify';
import { FileUploader } from 'react-drag-drop-files';
import Select from 'react-select';
import FileLoader from '../../Layout/FileLoader';
import { useSelector } from 'react-redux';

function AddNewFile({ show, onHide, data, updateBreadCrumArray, callback}) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileExtention, setFileExtention] = useState();
  const [fileDetails, setFileDetails] = useState({});
  const [file, setFile] = useState(null);
  const [options, setOptions] = useState();
  const [tempUsername, setTempUsername] = useState();
  const [userId, setUserId] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [checked, setChecked] = useState(false);
  const [permission, setPermission] = useState("Viewer");
  const [labelText, setLabelText] = useState("Upload File here");
  const [fileUploaderKey, setFileUploaderKey] = useState(0); // Control re-render of FileUploader
  const usersId = useSelector((state) => state.user.user.user.id);

  useEffect(() => {
    setFileName('');
    getUsers();
  }, []);

  const fileTypes = ['JPG', 'PNG', 'GIF', 'TXT', 'PDF', 'XLSX', 'DOCX', 'DOC'];

  const permissionType = [
    { label: 'viewer', value: 'Viewer' },
    { label: 'editor', value: 'Editor' },
  ];

  const handleChange = (file) => {
    const maxSizeInBytes = 25 * 1048576; // 25 MB in bytes
    // Check if file size exceeds 25 MB
    if (file.size > maxSizeInBytes) {
      toast.error("Please upload a file less than 25MB");
      setLabelText("File size exceeds 25MB, please try again.");
      setFileUploaderKey(prevKey => prevKey + 1); // Reset FileUploader component
      return;
    }
    setFile(file);
    setFileDetails({ ...fileDetails, name: file.name, path: file, type: 'File' });
    setFileName(file.name.split('.')[0]);
    setFileExtention(file.name.split('.')[1]);
    setLabelText("File Selected, if you want to change, upload another"); // Set label to "File Selected" upon file selection
    setFileUploaderKey(prevKey => prevKey + 1); // Reset FileUploader component
  };

  const handleUsers = (event, index) => {
    const id = userId.find(({ label }) => label === event.label);
    const selectedUserIndex = options.findIndex((x) => x.label === id.label);
    if (selectedUserIndex >= 0) {
      options.splice(selectedUserIndex, 1);
    }
    setSelectedUser((selectedUser) => [...selectedUser, {user_id:id.value}]);
  };

  const handleRemove = (index, id) => {
    const removedUserData = userId.find((x) => x.value === id.user_id);
    const removedUser = { label: removedUserData.label, value: '' };
    options.push(removedUser);
    const values = [...selectedUser];
    values.splice(index, 1);
    setSelectedUser(values);
  };

  const validation = () => {
    let valid = true;
    if (!fileDetails.path) {
      toast.error('Please Upload File');
      valid = false;
    } else if (fileName.trim() == '') {
      toast.error('Please type Name');
      valid = false;
    } 
    return valid;
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

  const addFile = async () => {
    fileDetails.name = fileName + '.' + fileExtention;
    fileDetails['parentFolder'] = data._id;
    if(data.isPublic){
      fileDetails['isPublic'] = true;
    }else{
      fileDetails['isPublic'] = checked;
    }
    if(selectedUser){
      selectedUser.map(d=> d.permission = permission)
    }
    const valid = validation();
    if(valid){
      let usersPermission = { "user_id": usersId, "permission": "Editor" };
      selectedUser.push(usersPermission);
      fileDetails['permittedUsers'] = selectedUser;
    }else{
      return;
    }
      const formData = new FormData();
      for (let key of Object.keys(fileDetails)) {
        if (key == 'permittedUsers') {
          formData.append('permittedUsers', JSON.stringify(fileDetails[key]));
        } else {
          formData.append([key], fileDetails[key]);
        }
      }
      try {
        setLabelText("File Uploading...");
        setLoading(true);
        const resp = await httpClient.post(DOCS.CREATE_FOLDER, formData);
        updateBreadCrumArray(resp.data.result, "ADD");
        toast.success('File Added Successfully');
        // onHide(data._id);
        onHide();
        callback(data._id);
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
      {loading&&<FileLoader/>}
        <Modal.Header>
          <Modal.Title>Create New File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ marginBottom: '10px' }}>
            <label className="head-title-info fw-light mb-1 pe-4">Add File</label>
            <br />
            {/* <FileUploader classes="drop_area" label="Upload File here" handleChange={handleChange} name="file" types={fileTypes} /> */}
            <FileUploader key={fileUploaderKey} classes="drop_area" label={labelText} handleChange={handleChange} name="file" types={fileTypes} />
          </div>
          <div>
            <label className="head-title-info fw-light mb-1 pe-4">File Name</label>
            <br />
            <input
              className="form-control"
              style={{ width: '77%' }}
              type="text"
              value={fileName}
              placeholder="Enter File Name"
              onChange={(e) => setFileName(e.target.value.trim())}
            />
          </div>
          <div className="mt-2">
            <label className="head-title-info fw-light mb-1 pe-4">
              {
                data.isPublic ? <input style={{ marginRight: '5px' }} type="checkbox" checked={true} /> 
                              : <input style={{ marginRight: '5px' }} type="checkbox" onChange={(e) => setChecked(e.target.checked)} />
              }
              Is Public
              {/* <input style={{ marginRight: '5px' }} type="checkbox" onChange={(e) => setChecked(e.target.checked)} />
              Is Public */}
            </label>
          </div>
          {!(checked || data.isPublic) && <div>
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
          <Button variant="primary" onClick={addFile}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AddNewFile;
