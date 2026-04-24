import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify"
import moment from "moment";
import { httpClient } from "../../../constants/Api";
import { USER, ROLES } from "../../../constants/AppConstants";

const EmployeeDetails = () => {
  const { userId } = useParams();
  const [user, setUser] = useState("");
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const getRoles = async () => {
      await httpClient
        .get(ROLES.GET_USER_ROLE)
        .then((res) => {
          if (res.status === 200) {
            setRoles(res.data);
          }
        })
        .catch((err) => {
          if (err.response) {
            toast.error(err.response.data.message);
          } else {
            toast.error("Something went wrong");
          }
        });
    };

    const getUserDetail = async () => {
      try {
        await httpClient
          .get(USER.GET_BY_ID.replace("{id}", userId))
          .then((res) => {
            if (res.status === 200) {
              setUser(res.data.user);
            }
          })
          .catch((err) => {
            if (err.response) {
                toast.error(err.response.data.message);
            } else {
                toast.error("Something went wrong");
            }
          });
      } catch (err) {
        console.log(err);
      }
    };
    getUserDetail();
    getRoles();
  }, [userId]);

  const formatTime = (time) => {
    return moment(time, "h:m").format("hh:mm A");
  };

  const filterRole = (roleId) => {
    const res = roles.filter((role) => role._id === roleId);
    return res[0]?.role;
  };

  return (
    <>
      <div className="main_content_panel">
        <div className="row ">
          <div className="offset-lg-1 col-lg-10 ">
            <div className="header_title">
              <h1>
                {" "}
                <span>Employee</span> Details
              </h1>
            </div>
          </div>
          <div className="offset-lg-1 col-lg-10 mb-4">
            <div className="dashboard_card ">
              <div className="d-flex align-items-start row employee_details_data">
                <div
                  className="nav flex-column nav-pills col-lg-4"
                  id="v-pills-tab"
                  role="tablist"
                  aria-orientation="vertical"
                >
                  <button
                    className="nav-link active"
                    id="v-pills-home-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#v-pills-home"
                    type="button"
                    role="tab"
                    aria-controls="v-pills-home"
                    aria-selected="true"
                  >
                    Employee Details
                  </button>
                  <button
                    className="nav-link"
                    id="v-pills-profile-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#v-pills-profile"
                    type="button"
                    role="tab"
                    aria-controls="v-pills-profile"
                    aria-selected="false"
                  >
                    Personal Details
                  </button>
                </div>
                <div className="tab-content  col-lg-8" id="v-pills-tabContent">
                  <div
                    className="tab-pane fade show active"
                    id="v-pills-home"
                    role="tabpanel"
                    aria-labelledby="v-pills-home-tab"
                  >
                    <div className="row">
                      <div className="col-md-4">
                        <label style={{ fontWeight: 500 }}>Full Name</label>
                      </div>
                      <div className="col-md-8">{user?.name}</div>
                    </div>
                    <hr />

                    <div className="row">
                      <div className="col-md-4">
                        <label style={{ fontWeight: 500 }}>Email</label>
                      </div>
                      <div className="col-md-8">{user?.email}</div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-md-4">
                        <label style={{ fontWeight: 500 }}>Employee ID</label>
                      </div>
                      <div className="col-md-8">{user?.emp_id}</div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-md-4">
                        <label style={{ fontWeight: 500 }}>Phone Number</label>
                      </div>
                      <div className="col-md-8">{user?.phone}</div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-md-4">
                        <label style={{ fontWeight: 500 }}>Date of Birth</label>
                      </div>
                      <div className="col-md-8">
                        {moment(user?.dob).format("L")}
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-md-4">
                        <label style={{ fontWeight: 500 }}>In Time</label>
                      </div>
                      <div className="col-md-8">
                        {formatTime(user?.in_time)}
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-md-4">
                        <label style={{ fontWeight: 500 }}>Out Time</label>
                      </div>
                      <div className="col-md-8">
                        {formatTime(user?.out_time)}
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-md-4">
                        <label style={{ fontWeight: 500 }}>Designation</label>
                      </div>
                      <div className="col-md-8">{user?.designation}</div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-md-4">
                        <label style={{ fontWeight: 500 }}>Role</label>
                      </div>
                      <div className="col-md-8">{filterRole(user?.role)}</div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-md-4">
                        <label style={{ fontWeight: 500 }}>
                          Date of joining
                        </label>
                      </div>
                      <div className="col-md-8">
                        {moment(user?.doj).format("L")}
                      </div>
                    </div>
                  </div>
                  <div
                    className="tab-pane fade"
                    id="v-pills-profile"
                    role="tabpanel"
                    aria-labelledby="v-pills-profile-tab"
                  >
                    <div className="row">
                      <div className="col-md-12">
                        <div className="profile_info hide_mob">
                          <div className="profile_img ms-0 mb-4">
                            <img
                              src={user?.profile_image}
                              className="img-fluid w-100"
                              alt=""
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-4">
                        <label style={{ fontWeight: 500 }}>Guardian Name</label>
                      </div>
                      <div className="col-md-8">{user?.guardian_name}</div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-md-4">
                        <label style={{ fontWeight: 500 }}>
                          Guardian Number
                        </label>
                      </div>
                      <div className="col-md-8">{user?.guardian_phone}</div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-md-4">
                        <label style={{ fontWeight: 500 }}>Blood Group</label>
                      </div>
                      <div className="col-md-8">{user?.blood_group}</div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-md-4">
                        <label style={{ fontWeight: 500 }}>
                          Marital Status
                        </label>
                      </div>
                      <div className="col-md-8">{user?.marital_status}</div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-md-4">
                        <label style={{ fontWeight: 500 }}>
                          Correspondence Address
                        </label>
                      </div>
                      <div className="col-md-8">
                        {user?.correspondence_address}
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col-md-4">
                        <label style={{ fontWeight: 500 }}>
                          Permanent Address
                        </label>
                      </div>
                      <div className="col-md-8">{user?.permanent_address}</div>
                    </div>
                    <hr />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EmployeeDetails;
