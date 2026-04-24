import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { httpClient } from "../../../constants/Api";
import { PROJECT } from "../../../constants/AppConstants";
import { useParams } from "react-router-dom";
import moment from "moment";
import BlankImage from "../../../assets/images/dummy_profile.jpeg";
import EditMessageModal from "../Modals/EditMessage.Modal";
import DeleteMessageModal from "../Modals/DeleteMessage.Modal";
import CkEditor from "../../common/CkEditor";
import getAllUsers from "../../common/GetAllUser";



function SubjectDetails() {

    useEffect(() => {
        getSubjectMessages();
        queryParams();
    }, []);


    const user = JSON.parse(localStorage.getItem("user")).user.id;
    const [values, setValues] = useState({ message: "" });
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [showEditMessage, setShowEditMessage] = useState({ open: false, id: "" });
    const [showDelMessage, setShowDelMessage] = useState({ open: false, id: "" });
    const { subjectId } = useParams();
    const [statusType, setStatusType] = useState();
    const [recipients, setRecipients] = useState();
    const [inputFields, setInputFields] = useState([]);
    const [inputFields1, setInputFields1] = useState([]);
    const [userId, setUserId] = useState([]);

    useEffect(async () => {
        const { userId } = await getAllUsers();
        setUserId(userId);
    }, []);

    const queryParams = () => {
        const query = new URLSearchParams(window.location.search);
        const queryParameter = query.get('selectedUserId');
        setStatusType(queryParameter);
    }

    const history = useHistory();
    const validation = () => {
        let valid = true;
        if (!values.message.trim()) {
            toast.error("Please type Message")
            valid = false
        }
        return valid;
    }

    let params = null;
    const index = subjectId.indexOf('?');

    if (index === -1) {
        params = subjectId;
    } else {
        params = subjectId.substr(0, subjectId.indexOf('?'));
    }

    const getSubjectMessages = async () => {
        try {
            const res = await httpClient
                .get(PROJECT.GET_SUBJECT_DETAILS.replace("{subjectId}", !params ? subjectId : params.toString()))
            if (res.status === 200) {
                setRecipients([...new Set(res.data.result.recipientsArray)]);
                setData(res.data.result.subjectDetail);
                const recipients = res.data.result.subjectDetail;
                let channel = "";
                let clientLocation = "";
                let createdBy = "";
                recipients.forEach(recipient => {
                    // Access properties for each recipient object
                    channel = recipient.channel;
                    clientLocation = recipient.clientLocation;
                    createdBy = recipient.createdBy;
                })
                let recipientArray = [];
                const array = recipients.map((d) =>
                    d.recipients.map((id) => {
                        recipientArray.push(id);
                    })
                );
                const uniqueIds = [...new Set(recipientArray)];
                setInputFields(uniqueIds);
                setInputFields1(createdBy);
                if (!(res.data.result).length) {
                    if (statusType === 'daily_status')
                        history.push(`/project/get-project-detail/default-project/${statusType}`);
                    else if (statusType === 'sales_status')
                        history.push(`/project/get-sales-updates/${statusType}`);
                }
            }
        } catch (err) {
            if (err.response) {
                toast.error(err.response.data.message);
            } else {
                toast.error("Something went wrong");
            }
        }
    };

    let createdByValue = null;
    const submitData = async () => {
        if (statusType === "sales_status") {
            values.type = "sales_status";
            values.recipients = recipients;
        }
        else {
            values.type = "daily_status";
        }
        const selectedChannel = document.querySelector('.form-channel select')?.value;
        const selectedClientLocation = document.querySelector('.form-client-location select')?.value;
        values.channel = selectedChannel;
        values.clientLocation = selectedClientLocation;
        for (let i = 0; i < data.length; i++) {
            if (data[i].createdBy && data[i].createdBy.length) {
                createdByValue = data[i].createdBy;
                break; // Exit the loop once a non-empty createdBy value is found
            }
        }
        if (createdByValue !== null) {
            values.createdBy = createdByValue;
        }
        try {
            const valid = validation();
            if (valid) {
                await httpClient
                    .post(`${PROJECT.ADD_DAILY_STATUS}?subjectId=${params}`, values)
                    .then(async (res) => {
                        if (res.status === 200) {
                            toast.success("Message posted successfully");
                            getSubjectMessages();
                            setValues({ message: "" })
                            if (Object.keys(res.data).length > 0 && res.data.result.isuserTagged) {
                                await httpClient.post(PROJECT.SEND_MAIL_TO_TAGGED_USERS, res.data.result.emailData);
                            }
                        }
                    })
            }
        }
        catch (err) {
            if (err.response)
                toast.error(err.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClick = () => {
        if (statusType === 'daily_status') {
            history.push(`/project/get-project-detail/default-project/${statusType}`);
        }
        else if (statusType === 'sales_status') {
            history.push(`/project/get-sales-updates/${statusType}`);
        }
    }

    const parser = (data) => {
        return <div dangerouslySetInnerHTML={{
            __html: data
                .replaceAll("&lt;", "<")
                .replaceAll("&gt;", ">").replaceAll("<a ", "<a target='_blank'"),
        }} />
    }

    const handleClose = () => {
        setShowEditMessage(false);
        getSubjectMessages();
    };


    const handleCloseDeleteMessage = () => {
        setShowDelMessage({ open: false, id: "" });
        getSubjectMessages();
    };

    return (
        <>
            <div className="main_content_panel main_content_panel2 main_content_panel3 subject-maincontent">
                <div className="row justify-content-center">
                    <div className="col-md-12">
                        <div className="header-title-wrap pb-4">
                            <div className="thread-name">
                                <h4 className="head-title-info">{data[0]?.subject_id?.subject}</h4>
                                <button className="btn btn-secondary" title="Back" onClick={handleClick}><i className="fa fa-arrow-left" aria-hidden="true"></i></button>
                            </div>
                            {data.length ? <p className="description-info">
                                Posted by {data[0]?.user_id?.name} on {moment(data[0]?.createdAt).format("ll")}
                            </p> : ""}
                        </div>
                    </div>
                    <div className="col-lg-6 mb-4 mt-4">
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
                                    <CkEditor values={values} setValues={setValues} inputFields={inputFields} userId={userId} /> : ""
                                }
                                {/* <CkEditor values={values} setValues={setValues} inputFields={inputFields} userId={userId}/> : "" */}
                                <div className="row mt-3">
                                    <div className="mt-6 col">
                                        {statusType === 'sales_status' && (
                                            <div className="form-channel">
                                                <h5 className="head-title-info col-black fw-light m-0 pe-4 mt-2 mb-2">Channel</h5>
                                                <select className="form-select" value={data.length > 0 ? data[0]?.channel : ''} disabled>
                                                    {data.map((item, index) => (
                                                        <option key={index} value={item.channel}>{item.channel}</option>
                                                    ))}
                                                </select>
                                            </div>

                                        )}
                                    </div>
                                    <div className="mt-6 col">
                                        {statusType === 'sales_status' && (
                                            <div className="form-client-location">
                                                <h5 className="head-title-info col-black fw-light m-0 pe-4 mt-2 mb-2">Client Location</h5>
                                                <select className="form-select" value={data.length > 0 ? data[0]?.clientLocation : ''} disabled>
                                                    {data.map((item, index) => (
                                                        <option key={index} value={item.clientLocation}>{item.clientLocation}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 text-end">
                                    <button
                                        type="button"
                                        className="btn btn-secondary text-center px-4 mx-2"
                                        onClick={handleClick}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary text-center px-4 mx-2 me-0"
                                        onClick={submitData}
                                    >
                                        Post this message
                                    </button>

                                    {data.length <= 0 && (
                                        <div className="d-flex justify-content-center">
                                            <h5>No Records to Display.</h5>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 mb-4 mt-4">
                        <h5 className="head-title-info col-black fw-light m-0 pe-4 mb-2 pt-2">Previous Messages</h5>
                        <div className="previous-chat subject-chat">
                            {data?.map((data, i) => (
                                <div key={i}>
                                    <div className="discussions-list-content-info  project_discussions_list pb-2">
                                        <hr />
                                        <div className="img-wrap  me-2 w-100">
                                            <div className="main_follow_info d-flex align-items-center">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="follow-up-info_name">{<img src={data?.user_id?.profile_image ? data?.user_id?.profile_image : BlankImage} alt="profile_image" />}  </div>
                                                    {data?.user_id?.name}
                                                </div>

                                                {data.user_id.id === user ? <div className="ms-auto chat-btn">
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
                                                                style={{ borderRadius: "5px" }}
                                                            >
                                                                <i
                                                                    className="fa fa-pencil-square-o"
                                                                    aria-hidden="true"
                                                                ></i>
                                                            </button>
                                                            <button
                                                                title="Delete Message"
                                                                type="button"
                                                                className="border-0 close danger ms-1 me-0 hover-zoom"
                                                                data-close="notification"
                                                                onClick={() =>
                                                                    setShowDelMessage({ open: true, messageId: data._id })
                                                                }
                                                                // onClick={(e) => deleteMessage(data?._id)}
                                                                style={{ borderRadius: "5px", backgroundColor: "red" }}
                                                            >
                                                                <i
                                                                    className="fa fa-trash-o"
                                                                    data-id={data.id}
                                                                    aria-hidden="true"
                                                                    style={{ color: "white" }}
                                                                ></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div> :
                                                    <div className="ms-auto">
                                                        <h6 className="m-0">{moment(data.createdAt).format('lll')}</h6>
                                                    </div>}
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
                {showEditMessage.open && (
                    <EditMessageModal
                        show={showEditMessage}
                        onHide={handleClose}
                        selectedRecipients={inputFields}
                        createdBy={inputFields1}
                    />
                )}
                {showDelMessage.open && (
                    <DeleteMessageModal
                        show={showDelMessage}
                        onHide={handleCloseDeleteMessage}
                    />
                )}
            </div>
        </>
    );
}

export default SubjectDetails;
