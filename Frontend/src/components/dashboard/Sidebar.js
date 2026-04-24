import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link, Redirect, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { userSignOut } from '../../redux/actions/AuthActions';
import CompanyLogo from '../../assets/images/logo.png';
import cakeIcon from '../../assets/images/cake_icon.png';
import ProfileImage from '../../assets/images/profile.png';
import DashboardActive from '../../assets/images/dashboard.png';
import Dashboard from '../../assets/images/dashboard_n.png';
import TeamListActive from '../../assets/images/team_list_active.png';
import TeamList from '../../assets/images/team_list.png';
import TeamWorkReportActive from '../../assets/images/team_report_active.png';
import WorkFromHome from '../../assets/images/work-from-home.png';
import WorkFromHomeActive from '../../assets/images/work-from-home-active.png';
import TeamWorkReport from '../../assets/images/team_report.png';
import Leave from '../../assets/images/leave_n.png';
import LeaveActive from '../../assets/images/leave.png';
import ProfileIcon from '../../assets/images/profile_icon.png';
import Profile from '../../assets/images/profile_icon_n.png';
import LeaveHistory from '../../assets/images/history_n.png';
import LeaveHistoryActive from '../../assets/images/history.png';
import ChangePassword from '../../assets/images/padlock_n.png';
import ChangePasswordActive from '../../assets/images/padlock.png';
import DocumentVault from '../../assets/images/doc-file-icon.png';
import DocumentVaultActive from '../../assets/images/doc-file-activeicon.png';
import StatusIcon from '../../assets/images/status.png';
import StatusIconActive from '../../assets/images/status_active.png';
import { Modal } from 'react-bootstrap';
import { AUTH } from '../../constants/AppConstants.js';
import { httpClient } from '../../constants/Api';
import { USER, DOCS } from '../../constants/AppConstants';
// import { ATTENDENCE } from "../../constants/AppConstants.js";
import moment from 'moment';
import { tsParticles } from 'tsparticles';

function Sidebar() {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const userDetail = useSelector((state) => state.user.user.user);
  const userId = useSelector((state) => state.user.user.user.id);
  // const levelData = useSelector((state) => state.user.user.userLevelData?.children);
  const route = useSelector((state) => state.route.route);
  const [show, setShow] = useState(false);
  const [errorEmail, setErrorEmail] = useState('');
  const [value, setReValues] = useState('');
  const [values, setValues] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState('');
  const [levelData, setLevelData] = useState('');
  const [userLevel, setUserLevelData] = useState('');
  const [folderTreeView, setFolderTreeView] = useState();
  const handleShowWorkFrom = () => {
    setShow(true);
  };

  useEffect(() => {
    getAllDocuments();
    userLevelData();
    getEmployee();
    if (userDetail.dob) {
      if (moment(moment(userDetail.dob).format('MM-DD')).isSame(moment().format('MM-DD')) === true) {
        if (document.getElementById('tsparticles')) {
          tsParticles.load('tsparticles', {
            fullScreen: {
              enable: true,
            },
            detectRetina: true,
            background: {
              color: '#f2f8ff',
            },
            fpsLimit: 60,
            emitters: {
              direction: ['top', 'left', 'bottom'],
              life: {
                count: 0,
                duration: 0.1,
                delay: 0.1,
              },
              rate: {
                delay: 0.15,
                quantity: 1,
              },
              size: {
                width: 200,
                height: 0,
              },
              position: {
                y: 100,
                x: 50,
              },
            },
            particles: {
              number: {
                value: 0,
              },
              destroy: {
                mode: 'split',
                split: {
                  count: 1,
                  factor: { value: 1 / 3 },
                  rate: {
                    value: 100,
                  },
                  particles: {
                    stroke: {
                      color: {
                        value: ['#ffffff', '#b22234', '#b22234', '#3c3bfe', '#3c3bfe', '#3c3bfe'],
                      },
                      width: 1,
                    },
                    number: {
                      value: 0,
                    },
                    collisions: {
                      enable: false,
                    },
                    opacity: {
                      value: 1,
                      animation: {
                        enable: true,
                        speed: 0.7,
                        minimumValue: 0.1,
                        sync: false,
                        startValue: 'max',
                        destroy: 'min',
                      },
                    },
                    shape: {
                      type: 'circle',
                    },
                    size: {
                      value: 1,
                      animation: {
                        enable: false,
                      },
                    },
                    life: {
                      count: 1,
                      duration: {
                        value: {
                          min: 1,
                          max: 2,
                        },
                      },
                    },
                    move: {
                      enable: true,
                      gravity: {
                        enable: false,
                      },
                      speed: 2,
                      direction: 'none',
                      random: true,
                      straight: false,
                      outMode: 'destroy',
                    },
                  },
                },
              },
              life: {
                count: 1,
              },
              shape: {
                type: 'line',
              },
              size: {
                value: 50,
                animation: {
                  enable: true,
                  sync: true,
                  speed: 150,
                  startValue: 'max',
                  destroy: 'min',
                },
              },
              stroke: {
                color: {
                  value: '#ffffff',
                },
                width: 1,
              },
              rotate: {
                path: true,
              },
              move: {
                enable: true,
                gravity: {
                  acceleration: 15,
                  enable: true,
                  inverse: true,
                  maxSpeed: 100,
                },
                speed: { min: 10, max: 20 },
                outModes: {
                  default: 'destroy',
                  top: 'none',
                },
                trail: {
                  fillColor: '#f2f8ff',
                  enable: true,
                  length: 10,
                },
              },
            },
          });
        }
      }
    }
  }, []);

  const userData = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : '';
  const userObject = userData && userData.user;
  const userRoleName = userObject && userObject.role.role;
  const isOutSource = userRoleName === 'Out Source' ? true : false;

  const getAllDocuments = async () => {
    try {
      const users = await httpClient.get(DOCS.GET_USERS_ALL_FOLDER.replace('{userId}', userId));
      console.log({ users });
      setFolderTreeView(users.data.result.getFomattedData);
      return users.data.result.getFomattedData;
    } catch (err) {
      if (err.response) toast.error(err.response.data.message);
      else toast.error('Error in fetching docs');
    }
  };

  const userLevelData = async () => {
    try {
      const users = await httpClient.get(USER.GET_CURRENT_USER_LEVELS_DATA);
      const parentId = users.data.userLevelData.organisationData;
      const userLevelData = users.data.userLevelData.userLevel.level.level;
      setLevelData(parentId);
      setUserLevelData(userLevelData);
    } catch (err) {
      if (err.response) toast.error(err.response.data.message);
      // else toast.error("Error in fetching user detail");
    }
  };

  const getEmployee = async () => {
    await httpClient
      .get(USER.GET_BY_ID.replace('{id}', userDetail.id))
      .then((res) => {
        if (res.status === 200) {
          res.data.user.doj = moment(res.data.user.doj).format('YYYY-MM-DD');
          res.data.user.dob = moment(res.data.user.dob).format('YYYY-MM-DD');
          setUploadedImage(res.data.user.profile_image);
        }
      })
      .catch((err) => {
        if (err.response) {
          toast.error(err.response.data.message);
        } else {
          toast.error('Something went wrong');
        }
      });
  };

  const handleCloseWorkFrom = () => {
    setShow(false);
  };

  const password = (e) => {
    setValues({ ...values, password: e.target.value });
    if (value.repassword) {
      if (e.target.value !== value.repassword) {
        setErrorEmail('Password not matched');
      } else {
        setErrorEmail('');
      }
    }
  };

  const rePassword = (e) => {
    setReValues({ ...value, repassword: e.target.value });
    if (values.password) {
      if (values.password !== e.target.value) {
        setErrorEmail('Password not matched');
      } else {
        setErrorEmail('');
      }
    }
  };

  const signOut = () => {
    const tokens = JSON.parse(localStorage.getItem('tokens'));
    dispatch(userSignOut({ refreshToken: tokens.refresh.token }));
  };
  const resetPassword = async (e) => {
    e.preventDefault();
    if (values.password !== value.repassword) {
      setErrorEmail('Password not matched');
    } else {
      setLoading(true);
      try {
        values.email = userDetail.email;
        await httpClient.post(AUTH.CHANGE_PASSWORD, values).then((res) => {
          if (res.status === 200) {
            toast.success('Password changed successfully');
            handleCloseWorkFrom();
            values.password = '';
            value.repassword = '';
            setErrorEmail('');
            setLoading(false);
          }
        });
      } catch (err) {
        toast.error(err.response.data.message);
      }
    }
  };

  return (
    <>
      {route === '/login' && <Redirect to="/login" />}
      <div className="left_pannel">
        <div className="nav_pannel">
          <div className="logo hide_mob">
            <Link to={isOutSource ? '/docs/main-page' : '/dashboard'}>
              <img src={CompanyLogo} alt="" />
            </Link>
          </div>
          <div className="profile_info hide_mob" id="tsparticles" style={{ position: 'relative' }}>
            <div className="profile_img">
              <div className="profile_img_div">
                <img src={userDetail ? (uploadedImage ? uploadedImage : ProfileImage) : ProfileImage} alt="" />
              </div>
              {moment(moment(userDetail.dob).format('MM-DD')).isSame(moment().format('MM-DD')) === true ? (
                <div className="cake_icon">
                  <img src={cakeIcon} />
                </div>
              ) : (
                ''
              )}
            </div>
            <h2>{userDetail.name}</h2>
            <p className="designation">{userDetail.designation}</p>
            <p className="emp_id">{userDetail.emp_id}</p>
          </div>
          <nav className="navbar navbar-expand-lg navbar-light custom_nav ">
            <div className="logo show_mob">
              <img src={CompanyLogo} alt="" />
            </div>
            <button
              className="navbar-toggler p-0"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarTogglerDemo01"
              aria-controls="navbarTogglerDemo01"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse mt-4" id="navbarTogglerDemo01">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <div className="profile_info show_mob">
                    <div className="profile_img">
                      <img src={userDetail ? (uploadedImage ? uploadedImage : ProfileImage) : ProfileImage} className="img-fluid w-100" alt="" />
                    </div>
                    <h2>{userDetail.name}</h2>
                    <p className="designation">{userDetail.designation}</p>
                    <p className="emp_id">{userDetail.emp_id}</p>
                  </div>
                </li>
                {!isOutSource && (
                  <li className="nav-item">
                    <Link className={pathname === '/dashboard' ? 'nav-link active' : 'nav-link'} aria-current="page" to="/dashboard">
                      <img src={DashboardActive} className="active_img" alt="" />
                      <img src={Dashboard} className="normal_img" alt="" />
                      Dashboard
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link className={show ? 'nav-link active' : 'nav-link'} to="#" onClick={handleShowWorkFrom}>
                    <img src={ChangePassword} className="normal_img" alt="" />
                    <img src={ChangePasswordActive} className="active_img" alt="" />
                    Change Password
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={pathname === '/profile/my-profile' ? 'nav-link active' : 'nav-link'} to="/profile/my-profile">
                    <img src={Profile} className="normal_img" alt="" />
                    <img src={ProfileIcon} className="active_img" alt="" /> My Profile
                  </Link>
                </li>
                  <li className="nav-item">
                    <Link className={pathname === '/project/project-list' ? 'nav-link active' : 'nav-link'} to="/project/project-list">
                      <img src={StatusIcon} className="normal_img" alt="" />
                      {/* <img src={StatusIconActive} className="active_img" alt="" /> {userLevel === '1' || userLevel === '2' ? 'Status Reports' : 'Status'}  */}
                      <img src={StatusIconActive} className="active_img" alt="" />  Basecamp
                    </Link>
                  </li>
                {levelData?.parent && levelData.children?.length > 0 && (
                  <>
                    {!isOutSource && (
                      <li className="nav-item">
                        <Link className={pathname === '/teams/my-team' ? 'nav-link active' : 'nav-link'} to="/teams/my-team">
                          <img src={TeamWorkReport} className="normal_img" alt="" />
                          <img src={TeamWorkReportActive} className="active_img" alt="" /> Teams Work Report
                        </Link>
                      </li>
                    )}
                    {!isOutSource && (
                      <li className="nav-item">
                        <Link className={pathname === '/teamlist/my-team-list' ? 'nav-link active' : 'nav-link'} to="/teamlist/my-team-list">
                          <img src={TeamList} className="normal_img" alt="" />
                          <img src={TeamListActive} className="active_img" alt="" /> Teams List
                        </Link>
                      </li>
                    )}
                  </>
                )}
                {!isOutSource && (
                  <li className="nav-item">
                    <Link className={pathname === '/leaves/apply' ? 'nav-link active' : 'nav-link'} to="/leaves/apply">
                      <img src={Leave} className="normal_img" alt="" />
                      <img src={LeaveActive} className="active_img" alt="" /> Leave Request
                    </Link>
                  </li>
                )}
                {!isOutSource && (
                  <li className="nav-item">
                    <Link className={pathname === '/work-from-home/apply' ? 'nav-link active' : 'nav-link'} to="/work-from-home/apply">
                      <img src={WorkFromHome} className="normal_img" alt="" />
                      <img src={WorkFromHomeActive} className="active_img" alt="" /> WFH Request
                    </Link>
                  </li>
                )}
                {!isOutSource && (
                  <li className="nav-item">
                    <Link className={pathname === '/leaves/list' ? 'nav-link  active' : 'nav-link'} to="/leaves/list">
                      <img src={LeaveHistory} className="normal_img" alt="" />
                      <img src={LeaveHistoryActive} className="active_img" alt="" /> Leave & WFH History
                    </Link>
                  </li>
                )}
                {isOutSource ? (
                  <li className="nav-item">
                    <Link className={pathname === '/docs/main-page' ? 'nav-link active' : 'nav-link'} to="/docs/main-page">
                      <img src={DocumentVault} className="normal_img" alt="" />
                      <img src={DocumentVaultActive} className="active_img" alt="" /> Document Vault
                    </Link>
                  </li>
                ) : folderTreeView && folderTreeView.length > 0 && folderTreeView[0].children.length > 0 ? (
                  <li className="nav-item">
                    <Link className={pathname === '/docs/main-page' ? 'nav-link active' : 'nav-link'} to="/docs/main-page">
                      <img src={DocumentVault} className="normal_img" alt="" />
                      <img src={DocumentVaultActive} className="active_img" alt="" /> Document Vault
                    </Link>
                  </li>
                ) : (
                  ''
                )}
                {/* {!isOutSource && (
                  <li className="nav-item">
                    <Link className={pathname === '/salary/slip' ? 'nav-link  active' : 'nav-link'} to="/salary/slip">
                      <img src={LeaveHistory} className="normal_img" alt="" />
                      <img src={LeaveHistoryActive} className="active_img" alt="" /> Salary Slip
                    </Link>
                  </li>
                )} */}
                <li className="nav-item show_mob">
                  <div className="logout">
                    <Link to="#" onClick={() => signOut()}>
                      <span className="m-1">
                        <FontAwesomeIcon icon={faPowerOff} />
                      </span>
                      Logout{' '}
                    </Link>
                  </div>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="logout hide_mob">
          <Link to="#" onClick={() => signOut()}>
            <span className="m-1">
              <FontAwesomeIcon icon={faPowerOff} />
            </span>
            Logout{' '}
          </Link>
        </div>
      </div>
      <Modal show={show} onHide={handleCloseWorkFrom}>
        <form className="" onSubmit={resetPassword}>
          <Modal.Header>
            <Modal.Title>Change Password</Modal.Title>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleCloseWorkFrom} />
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="mb-4 col-lg-12">
                <label htmlFor="exampleInputEmail1" className="form-label">
                  Enter New Password
                </label>
                <input
                  type="password"
                  value={values.password}
                  onChange={password}
                  required
                  pattern="(?=.*\d)(?=.*[a-zA-Z]).{8,}"
                  title="Must contain at least one number and one letter, and at least 8 or more characters."
                  className="form-control"
                  placeholder="Enter Password"
                  aria-describedby="emailHelp"
                />
              </div>
              <div className="mb-4 col-lg-12">
                <label htmlFor="exampleInputEmail1" className="form-label">
                  Re-Enter New Password
                </label>
                <input
                  type="password"
                  value={value.repassword}
                  onChange={rePassword}
                  required
                  pattern="(?=.*\d)(?=.*[a-zA-Z]).{8,}"
                  title="Must contain at least one number and one letter, and at least 8 or more characters."
                  className="form-control"
                  placeholder="Re-Enter Password"
                  aria-describedby="emailHelp"
                />
              </div>
            </div>
            <small style={{ color: 'red' }} role="alert">
              {errorEmail}
            </small>
            <div>
              <span style={{ fontSize: '11px' }}>Note : </span>
              <label style={{ opacity: '0.6', fontSize: '11px' }}>Password must contain at least 1 letter and 1 number</label>
            </div>
          </Modal.Body>
          <Modal.Footer>
            {loading ? (
              <div className="border-0 modal-footer pt-0">
                <button type="button" className="btn btn-primary " disabled style={{ width: '121px' }}>
                  {' '}
                  <div className="spinner-border text-light" style={{ width: '1.3em', height: '1.3em' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="border-0 modal-footer pt-0">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={handleCloseWorkFrom}>
                  Close
                </button>
                <button type="submit" className="btn btn-primary ">
                  Submit
                </button>
              </div>
            )}
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}

export default Sidebar;
