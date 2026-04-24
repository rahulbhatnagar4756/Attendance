import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { httpClient } from '../../../constants/Api';
import { PROJECT } from '../../../constants/AppConstants';
import { useParams } from 'react-router-dom';
import MessageModal from '../Modals/Message.Modal';
import BlankImage from '../../../assets/images/dummy_profile.jpeg';
import moment from 'moment';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import ReactPaginate from 'react-paginate';
import { Link } from 'react-router-dom';

function ProjectDetails() {
  const { projectId } = useParams();
  const [projectDetail, setProjectDetails] = useState([]);
  const [showDialog, setShowDialog] = useState({ open: false, permittedUsers: [] });
  const [projectUpdateDetail, setProjectUpdateDetails] = useState([]);
  const [projectUpdateDetailConstant, setProjectUpdateDetailsConstant] = useState([]);
  const [selectedOption, setSelectedOption] = useState('currentMonth');
  const [pageNumber, setPageNumber] = useState(1);
  const [count, setCount] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [displayText, setDisplayText] = useState('Latest 15 Updates');
  const [dates, setDates] = useState({
    from: '',
    to: '',
    active: 'recent-updates',
  });

  useEffect(() => {
    getProjectDetail();
    handleClose();
    getProjectUpdateDetail(1);
    getProjectUpdateDetail(1, true);
  }, [dates]);

  const handleClose = () => {
    setPageNumber(1);
    setShowDialog({ open: false, permittedUsers: [] });
    getProjectUpdateDetail(1);
  };

  const getProjectDetail = async () => {
    try {
      const res = await httpClient.get(PROJECT.GET_PROJECT_BY_ID.replace('{projectId}', projectId));
      if (res.status === 200) {
        setProjectDetails(res.data.result);
      }
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Something went wrong');
      }
    }
  };
  const getProjectUpdateDetail = async (pageNumber, isConstant = false) => {
    try {
      const res = await httpClient.get(
        `${PROJECT.GET_PROJECT_SUBJECTS_BY_ID}?projectId=${projectId}&type=${'user'}&from=${dates.from}&to=${dates.to}&page=${pageNumber}`
      );
      if (res.status === 200) {
        if (isConstant) {
          setProjectUpdateDetailsConstant(res.data.result.subjects);
        } else {
          setProjectUpdateDetails(res.data.result.subjects);
          setCount(res.data.result.totalDocuments);
        }
      }
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  // const getProjectUpdateDetail = async (pageNumber) => {
  //   try {
  //     const res = await httpClient.get(
  //       `${PROJECT.GET_PROJECT_SUBJECTS_BY_ID}?projectId=${projectId}&type=${'user'}&from=${dates.from}&to=${dates.to}&page=${pageNumber}`
  //     );
  //     if (res.status === 200) {
  //       setProjectUpdateDetails(res.data.result.subjects);
  //       setCount(res.data.result.totalDocuments)
  //     }
  //   } catch (err) {
  //     if (err.response) {
  //       toast.error(err.response.data.message);
  //     } else {
  //       toast.error('Something went wrong');
  //     }
  //   }
  // };

  // const getProjectUpdateDetailConstant = async (pageNumber) => {
  //   try {
  //     const res = await httpClient.get(
  //       `${PROJECT.GET_PROJECT_SUBJECTS_BY_ID}?projectId=${projectId}&type=${'user'}&from=${dates.from}&to=${dates.to}&page=${pageNumber}`
  //     );
  //     if (res.status === 200) {
  //       setProjectUpdateDetailsConstant(res.data.result.subjects);
  //     }
  //   } catch (err) {
  //     if (err.response) {
  //       toast.error(err.response.data.message);
  //     } else {
  //       toast.error('Something went wrong');
  //     }
  //   }
  // };
  const parser = (data) => {
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: data.replaceAll('&lt;', '<').replaceAll('&gt;', '>'),
        }}
      />
    );
  };

  const handleDateRange = async (event, picker) => {
    setSelectedOption('dateRange');
    setDates({
      from: moment(picker.startDate).format('YYYY-MM-DD'),
      to: moment(picker.endDate).format('YYYY-MM-DD'),
      active: 'picker',
    });
    setCurrentPage(1);
    setDisplayText('Latest Project Updates');
  };

  const handleRecentProjectUpdatesClick = () => {
    setCurrentPage(1);
    getProjectUpdateDetail(1);
    setDisplayText('Lastest 15 Updates');
  };

  const handlePageClick = async (data) => {
    let selectedPage = data.selected + 1;
    await getProjectUpdateDetail(selectedPage);
    setPageNumber(selectedPage);
  };

  return (
    <>
      <div className="main_content_panel">
        <div className="header_title d-block d-lg-flex">
          <h1>
            <span>Project Updates</span>
          </h1>
        </div>
        <div className="row justify-content-center">
          <div className="col-lg-10 mb-4">
            <div className="dashboard_card">
              <div className="projects-update-wrapper">
                <div className="row">
                  <div className="col-md-8">
                    <div className="header-title-wrap">
                      <h4 className="head-title-info">{projectDetail?.name}</h4>
                      <p className="description-info">{projectDetail?.description}</p>
                    </div>
                  </div>
                  <div className="col-md-4"></div>
                </div>
                <hr></hr>
                <div className="repots_tab project_updates_info">
                  <div className="row">
                    <ul className="nav nav-pills mb-3 d flex justify-content-end align-items-center;" id="pills-tab" role="tablist">
                      <li>
                        <div className="repots_tab">
                          <button
                            type="buton"
                            className={dates.active === 'recent-updates' ? 'btn btn-default border rounded-3 active me-4' : 'tab_btn nav-link'}
                            onClick={() => {
                              setDates({
                                from: '',
                                to: '',
                                active: 'recent-updates',
                              });

                              handleRecentProjectUpdatesClick();
                            }}
                          >
                            Recent Updates
                          </button>
                        </div>
                      </li>
                      <li>
                        <DateRangePicker
                          onApply={handleDateRange}
                          initialSettings={{
                            startDate: moment(),
                            endDate: moment(),
                          }}
                        >
                          <input
                            type="text"
                            className={dates.active === 'picker' ? 'btn btn-secondary calender_view me-4 active_btn ' : 'btn btn-secondary calender_view me-4'}
                            data-bs-toggle="pill"
                            data-bs-target="#pills-contact"
                            role="tab"
                            aria-controls="pills-contact"
                            aria-selected="true"
                          />
                        </DateRangePicker>
                      </li>
                      {/* <li className="nav-item" role="presentation">
                        <button
                          className={dates.active === 'weekly' ? 'tab_btn nav-link active' : 'btn btn-default border rounded-3 me-4'}
                          id="pills-profile-tab"
                          data-bs-toggle="pill"
                          data-bs-target="#pills-profile"
                          type="button"
                          role="tab"
                          aria-controls="pills-profile"
                          aria-selected="false"
                          onClick={() => {
                            setDates({
                              from: moment().startOf('week').add(1, 'day'),
                              to: moment().endOf('week').add(1, 'day'),
                              active: 'weekly',
                            });
                            changeWeeklyStartDate();
                          }}
                        >
                          Weekly Updates
                        </button>
                      </li> */}
                    </ul>
                  </div>
                </div>
                <div className="last-project-updates-wrap pt-4">
                  <div className="head-title-wrap mb-4">
                    <h5 className="head-title-info col-red fw-light">Latest Project Updates</h5>
                  </div>
                  <div className='last-project-updates-main'>
                  {projectUpdateDetailConstant.map((data, i) => (
                    <div className="last-project-updates-info" key={i}>
                      <div className="project-updates-content-info pb-2">
                        <div className="date-wrap pe-4">
                          <h6 className="date-info m-0">
                            <strong>{moment(data.createdAt).format('ll')}</strong>
                          </h6>
                        </div>
                        <div className="user-name-wrap pe-1">
                          <span>{data?.user_id?.name} Commented on </span>
                        </div>
                        <div className="follow-up-wrap">
                          <Link
                            to={{ pathname: `/project/project-update/all-messages/${data.project_id}/${data._id}` }}
                            style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                          >
                            <div className="follow-up-info text-primary text-decoration-underline">{data.subject} </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                </div>               
                <div className="discussions-data-wrap">
                  <div className="discussions-data-info pt-4 mt-4 pb-3">
                    <div className="row">
                      <div className="col-md-8">
                        <div className="content-wrap">
                          <div className="head-title-wrap">
                            <h5 className="head-title-info col-red fw-light m-0 pe-4">Discussions</h5>
                          </div>
                          <div className="post-new-message-wrap">
                            <button
                              type="button"
                              className="btn btn-default border rounded-3"
                              onClick={() => {
                                setShowDialog({ open: true, permittedUsers: projectDetail.users });
                              }}
                            >
                              Post a new message
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='discussions-list-main-project'>
                {projectUpdateDetail?.map((data, i) => (
                  <div className="discussions-list-wrap" key={i}>
                    <Link
                      to={{ pathname: `/project/project-update/all-messages/${data.project_id}/${data._id}` }}
                      style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                    >
                      <div className="discussions-list-content-info pb-2" style={{ cursor: 'pointer' }}>
                        <hr />
                        <div className="user-name-wrap">
                          <div className="d-flex align-items-center">
                            <div className="img-wrap me-2">
                              {<img src={data.user_id.profile_image ? data.user_id.profile_image : BlankImage} alt="profile_image" />}
                            </div>
                            <span>{data.user_id.name} </span>
                          </div>
                        </div>
                        <div className="follow-up-wrap">
                          <div className="follow-up-info me-2 text-primary text-decoration-underline">{data.subject}</div>
                          <div className="pu-message-wrap">{data.message ? parser(data.message) : ''}</div>
                        </div>
                        <div className="date-wrap">
                          <h6 className="date-info m-0 d-flex justify-content-evenly">
                            <span>{moment(data.createdAt).format('ll')}</span>
                            <span className="total-count-info">
                              <div className="btn-group dropend"></div>
                            </span>
                          </h6>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
                </div>
                {count > 10 ? (
                  <ReactPaginate
                    onPageChange={handlePageClick}
                    pageRangeDisplayed={5}
                    marginPagesDisplayed={3}
                    pageCount={Math.ceil(count / 10)}
                    previousLabelClassName={'page-link'}
                    renderOnZeroPageCount={null}
                    containerClassName={'pagination justify-content-center'}
                    pageClassName={'page-item'}
                    pageLinkClassName={'page-link'}
                    previousLinkClassName={'page-link'}
                    nextLinkClassName={'page-link'}
                    activeClassName={'active'}
                  />
                ) : (
                  ''
                )}
              </div>
              {projectUpdateDetail.length === 0 && (
                <div className="d-flex justify-content-center">
                  <h5>No Records to Display.</h5>
                </div>
              )}
            </div>
          </div>
        </div>
        {showDialog.open && <MessageModal show={showDialog.open} onHide={handleClose} permittedUsers={showDialog.permittedUsers}  getProjectUpdateDetail={getProjectUpdateDetail} />}
      </div>
    </>
  );
}

export default ProjectDetails;
