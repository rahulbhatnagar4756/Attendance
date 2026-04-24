import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { httpClient } from '../../../constants/Api';
import { PROJECT, ORGANISATION } from '../../../constants/AppConstants';
import { Modal } from 'react-bootstrap';
import Select from 'react-select';
import CkEditor from '../../common/CkEditor';

function MessageModal(props) {
  const { show, onHide, permittedUsers } = props;

  const [values, setValues] = useState({ subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const { projectId } = useParams();
  const [tempUsername, setTempUsername] = useState();
  const [options, setOptions] = useState();
  const [inputFields, setInputFields] = useState([]);
  const [userId, setUserId] = useState();
  const [selectedUser, setSelectedUser] = useState([]);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    try {
      const getAllUsers = await httpClient.get(ORGANISATION.GET_ALL_EMPLOYEES);
      const filteredUsers = getAllUsers.data.result.filter((user) => permittedUsers.includes(user.id));
      const usersList = filteredUsers;
      const Labels = usersList.map((data) => {
        return { label: `${data.name} (${data.emp_id})`, value: '' };
      });
      const LabelswithId = usersList.map((data) => {
        return { label: `${data.name} (${data.emp_id})`, value: data.id };
      });
      setUserId(LabelswithId);
      setOptions(Labels);
    } catch (err) {
      console.log({ err });
      if (err.response) toast.error(err.response.data.message);
      else toast.error('Error in fetching user detail');
    } finally {
    }
  };

  const validation = () => {
    let valid = true;
    if (!values.subject.trim()) {
      toast.error('Please type Subject');
      valid = false;
    } else if (!values.message.trim()) {
      toast.error('Please type Message');
      valid = false;
    }
    return valid;
  };

  const submitData = async (e) => {
    try {
      values.project_id = projectId;
      if (selectedUser.length) {
        let userIds = selectedUser.map((d) => d);
        userIds = userIds.filter((id) => id != '');
        values.recipients = userIds;
      }
      const valid = validation();
      if (valid) {
        await httpClient.post(PROJECT.ADD_NEW_PROJECT_SUBJECT, values).then(async (res) => {
          if (res.status === 200) {
            toast.success('Message posted successfully');
            props.getProjectUpdateDetail(1, true);
            onHide();
          }
        });
      }
    } catch (err) {
      if (err.response) toast.error(err.response.data.message);
      else toast.error('Error in fetching user detail');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event, index) => {
    const id = userId.find(({ label }) => label === event.label);
    const selectedUserIndex = options.findIndex((x) => x.label === id.label);
    if (selectedUserIndex >= 0) {
      options.splice(selectedUserIndex, 1);
    }
    setSelectedUser((selectedUser) => [...selectedUser, id.value]);
  };

  const handleRemove = (index, id) => {
    const removedUserData = userId.find((x) => x.value === id);
    const removedUser = { label: removedUserData.label, value: '' };
    options.push(removedUser);
    const values = [...selectedUser];
    values.splice(index, 1);
    setSelectedUser(values);
  };

  const Styles = {
    container: (provided) => ({
      ...provided,
      minWidth: '45%',
      marginTop: '8px',
    }),
  };

  return (
    <>
      <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Body>
          <div className="row justify-content-center  modal-lg">
            <div className="col-12">
              <div className="header_title pb-2 pt-2">
                <input
                  className="form-control text_box_outline border-0"
                  type="text"
                  placeholder="Type the subject of this message..."
                  value={values.subject}
                  onChange={(e) => setValues({ ...values, subject: e.target.value })}
                  required
                ></input>
              </div>
              <div className="ck-body-wrapper">
                <CkEditor values={values} setValues={setValues} />
              </div>
              <div className="head-title-wrap">
                <h5 className="head-title-info col-black fw-light m-0 pe-4 mt-2">Add Recipients</h5>
              </div>
              <div className="mt-2">
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                  }}
                >
                  {inputFields.length > 0 &&
                    userId &&
                    inputFields.map((item, index) => (
                      <div
                        className="boxed"
                        style={{
                          borderRadius: '4px',
                          marginBottom: '10px',
                          marginRight: '10px',
                          padding: '4px 8px',
                          backgroundColor: 'lightgray',
                        }}
                      >
                        {userId.find((opt) => opt.value === item).label}
                      </div>
                    ))}
                </div>
              </div>
              <div className="mt-2">
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                  }}
                >
                  {selectedUser &&
                    userId &&
                    selectedUser?.map((item, index) => (
                      <div
                        className="boxed"
                        style={{
                          borderRadius: '4px',
                          marginBottom: '10px',
                          marginRight: '10px',
                          padding: '4px 8px',
                          backgroundColor: 'lightgray',
                        }}
                      >
                        {userId.find((opt) => opt.value === item).label}
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
                {options && (
                  <div>
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
                        // menuPosition={'fixed'}
                        placeholder="search user"
                        value={tempUsername}
                        options={options}
                        onChange={(e) => {
                          handleChange(e);
                          setTempUsername(e.target ? e.target.value : '');
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 text-end">
                <button type="button" className="btn btn-outline-secondary text-center px-4 mx-2" onClick={onHide}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary text-center px-4 mx-2" onClick={submitData}>
                  Post this message
                </button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default MessageModal;
