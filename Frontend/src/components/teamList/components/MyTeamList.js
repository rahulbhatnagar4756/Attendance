import React, { useEffect, useState } from "react";
import { toast } from "react-toastify"
import { httpClient } from "../../../constants/Api";
import { USER } from "../../../constants/AppConstants";
import InfiniteScroll from "react-infinite-scroll-component";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

function MyTeamList() {
  const { userId } = useParams();
  const [attendenceData, setAttendenceData] = useState([]);
  const [updatedList, setUpdatedList] = useState([]);
  const [show, setShow] = useState({ open: false, id: "" });
  const [initialValue, setInitialValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDelEmp, setshowDelEmp] = useState({ open: false, id: "" });
  const [dataBind, setDataBind] = useState("");
  const userDetail = useSelector((state) => state.user.user.user);
  const handleClose = () => {
    setShow({ open: false, id: "" });
    getAllUsers(initialValue, searchValue);
  };

  const alpha = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];

  const handleInitialValue = (e) => {
    const initValue = e.target.text;
    setInitialValue(initValue);
    getAllUsers(initValue, searchValue);
  };

  const handleSearchValue = (e) => {
    const searchInitValue = e.target.value;
    setSearchValue(searchInitValue);
    getAllUsers(initialValue, searchInitValue);
  };

  const resetSearch = () => {
    setInitialValue("");
    setSearchValue("");
    getAllUsers();
  };

  const handleCloseDeleteEmployee = () => {
    setshowDelEmp({ open: false, id: "" });
    getAllUsers(initialValue, searchValue);
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  const getAllUsers = async (
    initValue = "",
    searchInitValue = "",
    page_no = 0,
    update_list = []
  ) => {
    try {
      setLoading(true);
      setPage(page_no + 1);
      await httpClient
        .get(
          `${USER.GET_TEAM_LIST}?page=${
            page_no + 1
          }&alphaTerm=${initValue}&searchText=${searchInitValue}`
        )
        .then((res) => {
          if (res.status === 200) {
            if (!update_list) {
              setDataToBind(res.data.user.data);
              setDataBind(res.data.user.total);
              setLoading(false);
            } else {
              const updatedData = [...update_list, ...res.data.user.data];
              setDataToBind(updatedData);
              setDataBind(res.data.user.total);
              setLoading(false);
            }
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

  const fetchMoreData = () => {
    getAllUsers(initialValue, searchValue, page, updatedList);
  };

  const setDataToBind = (response) => {
    setAttendenceData(response);
    setUpdatedList(response);
  };

  return (
    <div className="main_content_panel ">
      <div className="header_title">
        <h1>Team List</h1>
      </div>
      <div className="row">
        <div className="col-lg-12">
          <div className="dashboard_card employee_lists">
            <div className="card_title calender_heading">
              <h4>Employee List</h4>
              <div className="d-flex">
                <div className="form-group has-search">
                  <span className="fa fa-search form-control-feedback"></span>
                  <input
                    required
                    type="text"
                    className="form-control"
                    placeholder="Search by name"
                    value={searchValue}
                    onChange={handleSearchValue}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  style={{ marginLeft: "1rem", borderRadius: "50px" }}
                  onClick={resetSearch}
                >
                  Reset Filter
                </button>
              </div>
            </div>
            <div className="filter_letters">
              <ul>
                <li className=""></li>
              </ul>
            </div>
            <div className="filter_letters">
              <ul>
                {alpha.map((data, i) => (
                  <li className={initialValue === data ? "active" : " "} key={i}>
                    <Link to="#" data-target={data} onClick={handleInitialValue}>
                      {data}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="employee_table emp-team-list table-responsive">
              <table className="table table-hover employee-list-table">
                <thead>
                  <tr>
                    <th scope="col" className="text-nowrap">
                      Employee Name
                    </th>
                    <th scope="col" className="textCenter text-nowrap">
                      Employee ID
                    </th>
                    <th scope="col" className="textCenter">
                      Email
                    </th>
                    <th scope="col" className="textCenter text-nowrap">
                      Phone Number{" "}
                    </th>
                    <th scope="col" className="textCenter">
                      Designation
                    </th>
                    <th scope="col" className="textCenter">
                      Role
                    </th>
                    <th scope="col" className="textCenter">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {updatedList &&
                    updatedList.map((data, i) => (
                      <tr key={i}>
                        <td className="textCenter text-nowrap">{data.name}</td>
                        <td className="textCenter text-nowrap">{data.emp_id}</td>
                        <td className="textCenter text-nowrap">{data.email}</td>
                        <td className="textCenter text-nowrap">{data.phone}</td>
                        <td className="textCenter text-nowrap">
                          {data.designation}
                        </td>
                        <td className="textCenter text-nowrap">
                          {data.role
                            ? data.role.role
                              ? data.role.role
                              : "-"
                            : "-"}
                        </td>
                        <td className="textCenter">
                          <div className="d-flex">
                            <Link  to={`/teams/attendence-detail/${data.id}`}>
                              <button
                                title="Attendence Detail"
                                className="view_emp_detail table_btn mx-1"
                              >
                                <i
                                  className="fa fa-hand-paper-o"
                                  aria-hidden="true"
                                ></i>
                              </button>
                            </Link>
                            <Link to={`/teamlist/employeedetails/${data.id}`}>
                              <button
                                title="Employee Detail"
                                className="view_emp_detail table_btn mx-1"
                              >
                                <i className="fa fa-user-o" aria-hidden="true"></i>
                              </button>
                            </Link>
                            {(userDetail.role.role == "Super Admin" ||
                              userDetail.role.role == "HR") && (
                                <>
                                  <Link
                                    to={{ pathname: `/employee/edit/${data.id}` }}
                                  >
                                    <button
                                      title="Edit Employee"
                                      className="edit_emp_detail table_btn mx-1"
                                      disabled
                                      style={{ cursor: "pointer" }}
                                    >
                                      <i
                                        className="fa fa-pencil-square-o"
                                        aria-hidden="true"
                                      ></i>
                                    </button>
                                  </Link>
                                  <button
                                    onClick={() =>
                                      setshowDelEmp({ open: true, id: data.id })
                                    }
                                    title="Delete Employee"
                                    className="edit_emp_detail table_btn mx-1"
                                    style={{ cursor: "pointer" }}
                                  >
                                    <i
                                      className="fa fa-trash"
                                      data-id={data.id}
                                      aria-hidden="true"
                                    ></i>
                                  </button>

                                  <button
                                    onClick={() =>
                                      setShow({ open: true, id: data.id })
                                    }
                                    data-target={data.id}
                                    title="Remove Employee"
                                    className="edit_emp_detail table_btn mx-1"
                                    style={{ cursor: "pointer" }}
                                  >
                                    <i
                                      className="fa fa-ban"
                                      data-id={data.id}
                                      aria-hidden="true"
                                    ></i>
                                  </button>
                                </>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {!loading && updatedList.length <= 0 && (
                <div className="d-flex justify-content-center">
                  <h5>No Records to Display.</h5>
                </div>
              )}
              {updatedList.length <= 0 ||
                (updatedList?.length < dataBind && (
                  <div className="text-center">
                    <InfiniteScroll
                      dataLength={updatedList?.length}
                      next={fetchMoreData}
                      hasMore={true}
                      loader={
                        initialValue || searchValue ? "" : <h4>Loading...</h4>
                      }
                    >
                      {updatedList?.map((i, index) => (
                        <div key={index}></div>
                      ))}
                    </InfiniteScroll>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyTeamList;
