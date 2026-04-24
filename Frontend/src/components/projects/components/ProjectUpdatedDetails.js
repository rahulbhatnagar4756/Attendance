import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import { httpClient } from '../../../constants/Api';
import { PROJECT, ORGANISATION } from '../../../constants/AppConstants';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import BlankImage from '../../../assets/images/dummy_profile.jpeg';
import Select from 'react-select';
import EditProjectMessageModal from '../Modals/EditProjectMessageModal';
import DeleteProjectMessageModal from '../Modals/DeleteProjectMessageModal';
import CkEditor from '../../common/CkEditor';
import getAllUsers from "../../common/GetAllUser";

function ProjectUpdatedDetails() {
  useEffect(async () => {
    const res = await getProjectDetail();
    if (res.status === 200) {
      getUsers(res.data.result.users);
      getProjectUpdatedAllMessages();
      queryParams();
    }
    // getProjectUpdatedAllMessages();
    // queryParams();
  }, []);

  const user = JSON.parse(localStorage.getItem('user')).user.id;
  const [values, setValues] = useState({ message: '' });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [showEditMessage, setShowEditMessage] = useState({
    open: false,
  });
  const [showDelMessage, setShowDelMessage] = useState({ open: false, messageId: '' });
  const { projectId, subjectId } = useParams();
  const [projectDetail, setProjectDetails] = useState([]);
  const [statusType, setStatusType] = useState();
  const [inputFields, setInputFields] = useState([]);
  const [tempUsername, setTempUsername] = useState();
  const [options, setOptions] = useState();
  const [userId, setUserId] = useState();
  const [allUserId, setAllUserId] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);

  useEffect(async () => {
    const { userId } = await getAllUsers();
    setAllUserId(userId);
  }, []);

  const queryParams = () => {
    const query = new URLSearchParams(window.location.search);
    const queryParameter = query.get('selectedUserId');
    setStatusType(queryParameter);
  };

  const history = useHistory();

  const validation = () => {
    let valid = true;
    if (!values.message.trim()) {
      toast.error('Please type Message');
      valid = false;
    }
    return valid;
  };

  const params = projectId.substr(0, projectId.indexOf('?'));
  const getProjectUpdatedAllMessages = async () => {
    try {
      const res = await httpClient.get(
        `${PROJECT.GET_PROJECT_UPDATED_DETAILS.replace('{projectId}', !params ? projectId : params.toString())}?subjectId=${subjectId}&type=${'user'}`
      );
      if (res.status === 200) {
        setData(res.data.result);
        const recipients = res.data.result;
        let recipientArray = [];
        recipients.map((d) =>
          d.recipients.map((id) => {
            recipientArray.push(id);
          })
        );

        if (res.data.result.length > 0 && res.data.result[0].user_id.name !== 'Super Admin') {
          recipientArray.push(res.data.result[0].user_id.id);
        }

        const uniqueIds = [...new Set(recipientArray)];
        setInputFields(uniqueIds);
        // getUsers(uniqueIds);
      }
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  const getProjectDetail = async () => {
    try {
      const res = await httpClient.get(PROJECT.GET_PROJECT_BY_ID.replace('{projectId}', projectId));
      if (res.status === 200) {
        setProjectDetails(res.data.result);
      }
      return res;
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  // show selected User
  const usersId = [...inputFields, ...selectedUser];

  const submitData = async () => {
    // values.recipients = usersId;
    values.recipients = selectedUser;
    values.subject_id = subjectId;
    try {
      const valid = validation();
      if (valid) {
        await httpClient.post(`${PROJECT.ADD_DAILY_STATUS_IN_PROJECT_UPDATE}?projectId=${!params ? projectId : params}`, values).then(async (res) => {
          if (res.status === 200) {
            getProjectUpdatedAllMessages();
            history.push(`/project/get-project-detail/${projectId}`);
            setValues({ message: '' });
            setSelectedUser([]);
            if (Object.keys(res.data).length > 0 && res.data.result.isuserTagged) {
              await httpClient.post(PROJECT.SEND_MAIL_TO_TAGGED_USERS, res.data.result.emailData);
            }
          }
        });
      }
    } catch (err) {
      if (err.response.data.message === 'Error: No thread found for this') toast.error('No thread found for this action.');
      else if (err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    history.push(`/project/get-project-detail/${projectId}`);
  };

  const parser = (data) => {
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: data.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll("<a ", "<a target='_blank'"),
        }}
      />
    );
  };

  const handleClose = () => {
    setShowEditMessage({ open: false });
    getProjectUpdatedAllMessages();
  };

  const handleCloseDeleteMessage = () => {
    setShowDelMessage({ open: false, messageId: '' });
    getProjectUpdatedAllMessages();
  };

  const getUsers = async (permittedUsers) => {
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

  // const getUsers = async (uniqueIds) => {
  // 	console.log({uniqueIds});
  // 	try {
  // 		const users = await httpClient.get(ORGANISATION.GET_ALL_EMPLOYEES);
  // 		let usersList = users.data.result;
  // 		usersList = usersList.filter((usr) => !uniqueIds.includes(usr.id));
  // 		const Labels = usersList.map((data) => {
  // 			return { label: `${data.name} (${data.emp_id})`, value: "" };
  // 		});
  // 		const LabelswithId = users.data.result.map((data) => {
  // 			return { label: `${data.name} (${data.emp_id})`, value: data.id };
  // 		});
  // 		setUserId(LabelswithId);
  // 		setOptions(Labels);
  // 	} catch (err) {
  // 		console.log({err})
  // 		if (err.response) toast.error(err.response.data.message);
  // 		else toast.error("Error in fetching user detail");
  // 	} finally {
  // 	}
  // };

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
      <div className="main_content_panel main_content_panel2 main_content_panel3 project-updated-cont">
        <div className="row justify-content-center">
          <div className="col-md-12">
            <div className="header-title-wrap pb-4">
              <div className="thread-name">
                <h4 className="head-title-info">{data && data[0]?.subject_id?.subject}</h4>
                <button className="btn btn-secondary" title="Back" onClick={handleClick}><i className="fa fa-arrow-left" aria-hidden="true"></i></button>
              </div>
              {data &&
                (data.length ? (
                  <p className="description-info">
                    Posted by {data[0]?.user_id?.name} on {moment(data[0]?.createdAt).format('ll')}
                  </p>
                ) : (
                  ''
                ))}
            </div>
          </div>
          <div className="col-lg-6 mb-4">
            <div className="dashboard_card">
              <div className="projects-update-wrapper">
                <div className="discussions-data-wrap">
                  <div className="discussions-data-info  mt-2 pb-2 ">
                    <div className="row">
                      <div className="col-md-8">
                        <div className="content-wrap">
                          <div className="head-title-wrap">
                            <h5 className="head-title-info col-black fw-light m-0 pe-4">Discuss this message</h5>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {!showEditMessage.open ?
                  <CkEditor values={values} setValues={setValues} inputFields={inputFields} userId={allUserId} /> : ""
                }
                <div>
                  <hr></hr>
                  <div className="head-title-wrap">
                    <h5 className="head-title-info col-black fw-light m-0 pe-4 mt-2">Selected Recipients</h5>
                  </div>
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
                            fontSize: "14px",
                            borderRadius: "4px",
                            marginBottom: "10px",
                            marginRight: "10px",
                            padding: "4px 8px",
                            backgroundColor: "#d4ecff",
                          }}
                        >
                          {userId.find((opt) => opt.value === item)?.label}
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
                            fontSize: "14px",
                            borderRadius: "4px",
                            marginBottom: "10px",
                            marginRight: "10px",
                            padding: "4px 8px",
                            backgroundColor: "#d4ecff",
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
                    <div className='full-selectbox'>
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
                  <button type="button" className="btn btn-secondary text-center px-4 mx-2" onClick={handleClick}>
                    Cancel
                  </button>

                  <button type="button" className="btn btn-primary text-center px-4 mx-2 me-0" onClick={submitData}>
                    Post this message
                  </button>

                  {data && data.length <= 0 && (
                    <div className="d-flex justify-content-center">
                      <h5>No Records to Display.</h5>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
          <div className="col-lg-6 mb-4">
            <h5 className="head-title-info col-black fw-light m-0 pe-4 mb-2 pt-2">Previous Messages</h5>
            <div className="previous-chat">
              {data &&
                data.length > 0 &&
                data.map((data, i) => (
                  <div key={i}>
                    <div className="discussions-list-content-info  project_discussions_list pb-2">
                      <hr />
                      <div className="img-wrap  me-2 w-100">
                        <div className="main_follow_info d-flex">
                          {' '}
                          <div className="follow-up-info_name">
                            <div className="d-flex align-items-center gap-2">
                              {<img src={data?.user_id?.profile_image ? data?.user_id?.profile_image : BlankImage} alt="profile_image" />}
                              {data?.user_id?.name}
                            </div>
                          </div>
                          {data.user_id.id === user ? (
                            <div className="ms-auto mt-2">
                              <div>
                                <h6 className="m-0">{moment(data.createdAt).format('lll')}</h6>
                                <div className="text-end mt-2">
                                  <button
                                    title="Edit Message"
                                    type="button"
                                    className="border-0  close btn-success mx-1"
                                    onClick={(e) =>
                                      setShowEditMessage({
                                        open: true,
                                        data: data,
                                      })
                                    }
                                    style={{ borderRadius: '5px' }}
                                  >
                                    <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
                                  </button>
                                  <button
                                    title="Delete Message"
                                    type="button"
                                    className="border-0 close danger ms-1 me-0 hover-zoom"
                                    data-close="notification"
                                    onClick={() =>
                                      setShowDelMessage({
                                        open: true,
                                        messageId: data._id,
                                        project_id: data.project_id._id,
                                      })
                                    }
                                    style={{
                                      borderRadius: '5px',
                                      backgroundColor: 'red',
                                    }}
                                  >
                                    <i className="fa fa-trash-o" data-id={data.id} aria-hidden="true" style={{ color: 'white' }}></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="ms-auto mt-2">
                              <h6 className="m-0">{moment(data.createdAt).format('lll')}</h6>
                            </div>
                          )}
                        </div>
                        <div className="mt-2">{parser(data.message)}</div>
                      </div>
                    </div>
                    <hr />
                  </div>
                ))}
            </div>
          </div>
        </div>
        {showEditMessage.open && <EditProjectMessageModal show={showEditMessage} onHide={handleClose} selectedRecipients={inputFields} />}
        {showDelMessage.open && <DeleteProjectMessageModal show={showDelMessage} onHide={handleCloseDeleteMessage} />}
      </div>
    </>
  );
}

export default ProjectUpdatedDetails;
