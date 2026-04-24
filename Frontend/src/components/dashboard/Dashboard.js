import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import Sidebar from './Sidebar';
import Timing from './Timing';
import AttendenceDetail from './AttendenceDetail';
import ImportantDates from './ImportantDates';
import Thought from './Thought';
import Loader from '../Layout/Loader';
import { httpClient } from '../../constants/Api';
import { USER, LEAVES, WORK_FROM_HOME, NOTIFICATION } from '../../constants/AppConstants';
import { toast } from 'react-toastify';
import { fetchCurrentDate } from '../../redux/actions/DateAction';
import { Link, NavLink } from 'react-router-dom';
import NotificationBell from '../../assets/images/notification_bell.gif';
import { USER_FORMS } from '../../constants/AppConstants';
import UserFromImage from '../../assets/images/user-form-image.png';
function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user.user);
  const loading = useSelector((state) => state.time.loading);
  const today = useSelector((state) => state.today);
  const [bdayList, setBdayList] = useState('');
  const [bdayCount, setBdayCount] = useState('');
  const [loadings, setLoading] = useState(true);
  const [absentEmployees, setAbsentEmployees] = useState([]);
  const [wfhTeamListEmployees, setWfhTeamListEmployees] = useState([]);
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('')
  const [submitted, setSubmitted] = useState(true);
  const [pendingRelievingForm, setPendingRelievingForm] = useState([]);
  const userId = useSelector((state) => state.user.user.user.id);
  const levelData = useSelector((state) => state.user.user.userLevelData);
  const [getTaggedUsers, setgetTaggedUsers] = useState([]);

  useEffect(() => {
    dispatch(fetchCurrentDate());
    if (user.dob) {
      if (moment(moment(user.dob).format('MM-DD')).isSame(moment().format('MM-DD')) === true) {
        createBalloons(300);
        setTimeout(() => {
          document.getElementById('balloon-container').style.display = 'none';
          document.getElementById('balloon-container').style.opacity = 0;
          document.getElementById('balloon-container').style.transition = '5s';
        }, 7000);
      }
    }
    allBirthdayList();
    getTeamListEmployeeOnLeave();
    getTeamListEmployeeOnWfh();
    getUsersFormTemplate();
    getllPendingRelievingForm();
    getNotifiedUsers();
  }, []);

  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [loading]);

  window.addEventListener("storage",function(e){
    if((e.key==="submitForm")){
      window.location.reload();
      
    }
  })

  function random(num) {
    return Math.floor(Math.random() * num);
  }

  function getRandomStyles() {
    var r = random(255);
    var g = random(255);
    var b = random(255);
    var mt = random(200);
    var ml = random(50);
    var dur = random(5) + 5;
    return `
    background-color: rgba(${r},${g},${b},0.7);
    color: rgba(${r},${g},${b},0.7); 
    box-shadow: inset -7px -3px 10px rgba(${r - 10},${g - 10},${b - 10},0.7);
    margin: ${mt}px 0 0 ${ml}px;
    animation: float ${dur}s ease-in infinite
    `;
  }

  const createBalloons = (num) => {
    var balloonContainer = document.getElementById('balloon-container');
    for (var i = num; i > 0; i--) {
      var balloon = document.createElement('div');
      balloon.className = 'balloon';
      balloon.style.cssText = getRandomStyles();
      balloonContainer.append(balloon);
    }
  };

  const allBirthdayList = () => {
    try {
      httpClient
        .get(USER.GET_ALL_BDAY)
        .then((res) => {
          let count = 0;
          res.data.bday.map((list, i) => (moment(moment(list.dob).format('MM-DD')).isSame(moment().format('MM-DD')) === true ? count++ : ''));
          setBdayCount(count);
          if (res.status === 200) {
            setBdayList(res.data.bday);
          }
        })
        .catch((err) => {
          if (err.response) {
            toast.error(err.response.data.message);
          } else {
            toast.error('Something went wrong');
          }
        });
    } catch (err) {
      console.log(err);
    }
  };

  const getTeamListEmployeeOnLeave = async () => {
    try {
      setLoading(true);
      await httpClient
        .get(`${LEAVES.GET_TEAM_LIST_ON_LEAVE}`)
        .then((res) => {
          if (res.status === 200) {
            setAbsentEmployees(res.data.leaves.absentEmployees);
          }
        })
        .catch((err) => {
          if (err.response) {
            toast.error(err.response.data.message);
          }
        });
    } catch (err) {
      console.log(err);
    }
  };

  const getTeamListEmployeeOnWfh = async () => {
    try {
      setLoading(true);
      await httpClient
        .get(`${WORK_FROM_HOME.GET_TEAM_LIST_ON_WFH}`)
        .then((res) => {
          if (res.status === 200) {
            setWfhTeamListEmployees(res.data.wfhTeamDetails.wfhEmployees);
          }
        })
        .catch((err) => {
          if (err.response) {
            toast.error(err.response.data.message);
          }
        });
    } catch (err) {
      console.log(err);
    }
  };

  const getNotifiedUsers = async () => {
    try {
      setLoading(true);
      await httpClient
        .get(`${NOTIFICATION.GET_TAGGED_NOTIFIED_USERS}`)
        .then((res) => {
          if (res.status === 200) {
            setgetTaggedUsers(res.data.leaves);
          }
        })
        .catch((err) => {
          if (err.response) {
            toast.error(err.response.data.message);
          }
        });
    } catch (err) {
      console.log(err);
    }
  };

  const getllPendingRelievingForm = async () => {
    try {
      setLoading(true);
      await httpClient
        .get(`${USER_FORMS.GET_PENDING_RELIEVING_FORM}`)
        .then((res) => {
          if (res.status === 200) {
            setPendingRelievingForm(res.data.leaves.getPendingRelievingFormList);
          }
        })
        .catch((err) => {
          if (err.response) {
            toast.error(err.response.data.message);
          }
        });
    } catch (err) {
      console.log(err);
    }
  };

  const getUsersFormTemplate = async () => {
    try {
      setLoading(true);
      const result = await httpClient.get(USER_FORMS.GET_USER_FORM.replace('{userId}', userId));
      if (result.data.response.formByUserId.length > 0) {
            setFormId(result.data.response.formByUserId[0].formId);
            // setFormId(result.data.response.formByUserId[0]._id);
            setFormName(result.data.response.formByUserId[0].formName)
            setSubmitted(result.data.response.formByUserId[0].is_submitted);
          return;     
      } else {
        return;
      }
    } catch (err) {
      console.log(err);
      if (err.response) toast.error(err.response.data.message);
      else toast.error('Error');
    } finally {
      setLoading(false);
    }
  };
  
  const markAsSeen = async (notificationId) => {
    try {
      setLoading(true);
      await httpClient
        .get(NOTIFICATION.GET_NOTIFIED_DATA.replace("{notificationId}", notificationId))
        .then((res) => {
          if (res.status === 200) {
          }
        })
        .catch((err) => {
          if (err.response) {
            toast.error(err.response.data.message);
          }
        });
    } catch (err) {
      console.log(err);
    }
  };

  const allNotifications = [
    ...absentEmployees.map(item => ({ ...item, type: 'absent' })),
    ...wfhTeamListEmployees.map(item => ({ ...item, type: 'wfh' })),
    ...getTaggedUsers.map(item => ({ ...item, type: 'tagged' })),
    ...pendingRelievingForm.map(item => ({ ...item, type: 'relieving' }))
  ];
  
  // Sort by `createdAt` or appropriate date field (fallback to `updatedAt` if needed)
  allNotifications.sort((a, b) => {
    const dateA = new Date(a.createdAt || a.updatedAt || a.user?.createdAt);
    const dateB = new Date(b.createdAt || b.updatedAt || b.user?.createdAt);
    return dateB - dateA; // latest first
  });
  


  return (
    <div>
      <div className="main_wrapper">
        {loading && <Loader />}
        <Sidebar />
        <div className="main_content_panel">
          <div id="balloon-container"></div>
          <div className="header_title">
            <h1 className="user-name-wrap">
              <div className="user-name-info">
                <span>Welcome</span> {user.name}
              </div>
              <div className="dropdown notifications user-notify-data">
                <NavLink className="app-nav__item" to="#" data-bs-toggle="dropdown" aria-label="Show notifications" aria-expanded="false">
                  {/* {absentEmployees.length > 0 ||  pendingRelievingForm.length > 0 || getTaggedUsers.length > 0 ? <img src={NotificationBell} alt="notification-icon" style={{ width: '37px' }} /> : ''} */}
                  {absentEmployees.length > 0 || wfhTeamListEmployees.length > 0 || pendingRelievingForm.length > 0 || getTaggedUsers.length > 0 ? <img src={NotificationBell} alt="notification-icon" style={{ width: '37px' }} /> : ''}
                </NavLink>
                <ul className="app-notification dropdown-menu dropdown-menu-end dropdown-menu-right" x-placement="bottom-end" style={{ width: '245px' }}>
                  <li className="app-notification__title">You have {absentEmployees.length + wfhTeamListEmployees.length + pendingRelievingForm.length +  getTaggedUsers.length} new notifications.</li>
                  <div className="app-notification__content">
                    {allNotifications.map((data, i) => (
                      <li key={i}>
                        <NavLink className="app-notification__item" to="#" onClick={() => data.type === 'tagged' ? markAsSeen(data.changeRequest._id) : null}>
                          <span className="app-notification__icon">
                            <span className="fa-stack fa-lg">
                              <i className="fa fa-circle fa-stack-2x text-primary"></i>
                              <i className="fa fa-envelope fa-stack-1x fa-inverse"></i>
                            </span>
                          </span>
                          <div>
                            {data.type === 'absent' && (
                              <NavLink to={`/teams/attendence-detail/${data.user_id.id}`}>
                                <p className="app-notification__message">{data.user_id.name} sent you a leave request</p>
                                <p className="app-notification__meta">{moment(data.createdAt).fromNow()}</p>
                              </NavLink>
                            )}
                            {data.type === 'wfh' && (
                              <NavLink to={`/teams/attendence-detail/${data.user_id.id}`}>
                                <p className="app-notification__message">{data.user_id.name} sent you a WFH request</p>
                                <p className="app-notification__meta">{moment(data.createdAt).fromNow()}</p>
                              </NavLink>
                            )}
                            {data.type === 'tagged' && (
                              <NavLink to={
                                data.changeRequest.type === "Status Added" ?
                                `/project/project-messages/${data.dailyStatus.subject_id}?selectedUserId=${data.dailyStatus.type}` :
                                `/project/project-update/all-messages/${data.changeRequest.project_id}/${data.changeRequest.statusSubject_id}`
                              }>
                                <p className="app-notification__message">{data.changeRequest.request_message}</p>
                                <p className="app-notification__meta">{moment(data.user.createdAt).fromNow()}</p>
                              </NavLink>
                            )}
                            {data.type === 'relieving' && (
                              <NavLink to={`/user-form/view-form/${data.userId.id}/${data._id}`}>
                                <p className="app-notification__message">{data.userId.name} sent you a request for approve relieving form</p>
                                <p className="app-notification__meta">{moment(data.updatedAt).fromNow()}</p>
                              </NavLink>
                            )}
                          </div>
                        </NavLink>
                      </li>
                    ))}
                  </div>
                </ul>
              </div>
            </h1>
            <p className="today_date">
              <b>{moment(today?.currentDate).format('D MMMM Y')}</b>
              {bdayCount > 0 && (
                <>
                  <span className="divider">|</span>
                  <span className="celebration_link">
                    <a href="#" type="button" data-bs-toggle="modal" data-bs-target="#exampleModalbday">
                      Celebration
                    </a>
                    <span className="red_dot"></span>
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="row">
            <Timing data={user} />
            <Thought />
            {!submitted ? (
              <div className="col-md-12">
                <div className="card forms_card" style={{ marginBottom: '20px', alignItems: 'center' }}>
                  <div className="card-body w-100 text-center">
                    <h4>Please Fill {formName}</h4>
                    <Link
                      to={{ pathname: `/user-form/${formId}` }}
                      style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'center' }}
                      target="_blank"
                      onClick={()=> localStorage.setItem("submitForm", false)}
                    >
                      <img src={UserFromImage} className="me-2" width={24} />
                      View Form
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              ''
            )}

            <AttendenceDetail data={user} />
            <ImportantDates />
            <footer>
              <p>
                <strong>NOTE :</strong> edit request accepted only for current month
              </p>
            </footer>
          </div>
        </div>
      </div>
      <div className="modal fade" id="exampleModalbday" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0 pb-0">
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-12">
                  <h3 className="list_title">Today’s BIRTHDAY</h3>
                  <ul className="employe_celebrations">
                    {bdayList.length > 0 &&
                      bdayList.map((list, i) =>
                        moment(moment(list.dob).format('MM-DD')).isSame(moment().format('MM-DD')) === true ? (
                          <li key={i}>
                            <p>{list.name}</p>
                          </li>
                        ) : (
                          ''
                        )
                      )}
                  </ul>
                </div>
                {/* <div className="col-md-6">
                  <h3 className="list_title">
                    work anniversary
                  </h3>
                  <ul className="employe_celebrations">
                    <li>
                      <p>Gurjot Singh</p>
                    </li>
                    <li>
                      <p>Sandeep Dogra</p>
                    </li>
                  </ul>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
