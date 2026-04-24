import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { httpClient } from '../../../constants/Api';
import { PROJECT } from '../../../constants/AppConstants';
import BlankImage from '../../../assets/images/dummy_profile.jpeg';
import { useHistory } from 'react-router-dom';
function ProjectList() {
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [projects, setProjects] = useState([]);
  const [options, setOptions] = useState([]);
  const [teamsMembersImages, setTeamMembersImages] = useState([]);
  const [salesUpdates, setSalesUpdates] = useState([]);
  const [recipientsProfileImages, setRecipientsProfileImages] = useState();
  let history = useHistory();

  useEffect(() => {
    getProjects();
    getEmployees();
    handleClose();
    teamProfileImages();
    getSalesUpdatesByRecipients(1);
  }, []);

  const userData = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : '';
  const userObject = userData && userData.user;
  const userRoleName = userObject && userObject.role.role;
  const isOutSource = userRoleName === 'Out Source' ? true : false;

  const handleClose = () => {
    setShowDialog(false);
    getProjects();
  };

  const getProjects = async () => {
    try {
      setLoading(true);
      const projects = await httpClient.get(PROJECT.GET_PROJECT_BY_USER_ID);
      setProjects(projects.data.result);
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  const getSalesUpdatesByRecipients = async () => {
    try {
      setLoading(true);
      const updates = await httpClient.get(PROJECT.GET_SALES_UPDATES_BY_RECIPIENTS);
      // setSalesUpdates(updates.data.Updates);
      setSalesUpdates(updates.data.total);
      const images = [];
      for (let member of updates.data.RecipientsProfileImages) {
        images.push(member.profile_image || BlankImage);
      }
      setRecipientsProfileImages(images);
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  const getEmployees = async () => {
    try {
      setLoading(true);
      let result = [];
      const users = await httpClient.get(PROJECT.GET_ALL_EMPLOYEES);
      users.data.result.map((user) => {
        return (result = [...result, { label: `${user.name}`, value: user.id, profile_image: user.profile_image }]);
      });

      setOptions(result);
    } catch (err) {
      if (err.response) toast.error(err.response.data.message);
      else toast.error('Error in fetching user detail');
    } finally {
      setLoading(false);
    }
  };

  const teamProfileImages = async () => {
    try {
      const response = await httpClient.get(PROJECT.GET_TEAM_PROFILE_IMAGES);
      const imagesArray = [];
      for (let member of response.data.result.teamMembers) {
        imagesArray.push(member.profile_image || BlankImage);
      }
      setTeamMembersImages(imagesArray);
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Error in fetching user detail');
      }
    }
  };

  const handleStatusClick = (data) => {
    let type = data;
    if (type === 'daily_status') history.push(`/project/get-project-detail/default-project/${type}`);
    else history.push(`/project/get-sales-updates/${type}`);
  };

  return (
    <>
      <div className="main_content_panel cointainer">
        <div className="row cus-row-wrap">
          {!isOutSource && (
            <div className="border col-6 col-md-3 m-2 p-2 rounded-3">
              <div onClick={() => handleStatusClick('daily_status')} style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                <h6 className="project-heading-info text-left fw-bold">Daily Status</h6>
                <p className="project-description-info fw-light"></p>
                <div className="project-userimg-info">
                  {teamsMembersImages.slice(0, 8).map((data, i) => (
                    <img
                      src={data}
                      alt="profile_image"
                      style={{
                        verticalAlign: 'middle',
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        marginRight: '5px',
                        marginBottom: '5px',
                      }}
                      key={i}
                    />
                  ))}
                  {teamsMembersImages.length > 8 && <span style={{ fontSize: '12px' }}> + {teamsMembersImages.length - 8} more</span>}
                </div>
              </div>
            </div>
          )}
          {/* {salesUpdates?.length >= 1 && ( */}
          {salesUpdates >= 1 && (
            <div className="border col-6 col-md-3 m-2 p-2 rounded-3">
              <div onClick={() => handleStatusClick('sales_status')} style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                <h6 className="project-heading-info text-left fw-bold">Biz Dev</h6>
                <p className="project-description-info fw-light">
                  The BizDev project is used internally by the KIS BizDev team to organize inter-department communication and proposal creation
                </p>
                <div className="project-userimg-info">
                  {recipientsProfileImages?.slice(0, 8).map((data, i) => (
                    <img
                      src={data}
                      alt="profile_image"
                      style={{
                        verticalAlign: 'middle',
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        marginRight: '5px',
                        marginBottom: '5px',
                      }}
                      key={i}
                    />
                  ))}
                  {recipientsProfileImages?.length > 8 && <span style={{ fontSize: '12px' }}> + {teamsMembersImages.length - 8} more</span>}
                </div>
              </div>
            </div>
          )}
          {projects.map((data, i) => (
            <div className="col-md-2 border p-2 m-2 rounded-3" key={i}>
              <Link to={{ pathname: `/project/get-project-detail/${data._id}` }} style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                <h6 className="project-heading-info text-left fw-bold">{data.name}</h6>
                <p className="project-description-info fw-light">
                  {data.description.length > 75 ? data.description.substring(0, 75) + '...' : data.description}
                </p>
                <div className="project-userimg-info">
                  {data.users.slice(0, 8).map((data, i) => (
                    <img
                      src={data.profile_image ? data.profile_image : BlankImage}
                      alt="profile_image"
                      style={{
                        verticalAlign: 'middle',
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        marginRight: '5px',
                        marginBottom: '5px',
                      }}
                      key={i}
                    />
                  ))}
                  {data.users.length > 8 && <span style={{ fontSize: '12px' }}> + {data.users.length - 7} more</span>}
                </div>
              </Link>
            </div>
          ))}
        </div>
        {projects.length === 0 && salesUpdates.length === 0 && isOutSource && (
          <div className="d-flex justify-content-center">
            <h5>No thread assigned to you.</h5>
          </div>
        )}
      </div>
    </>
  );
}

export default ProjectList;
