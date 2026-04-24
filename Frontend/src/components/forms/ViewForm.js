import React, { useState, useEffect } from 'react';
import { httpClient } from '../../constants/Api';
import { USER_FORMS } from '../../constants/AppConstants';
import { toast } from 'react-toastify';
import { Link, useParams, useHistory } from 'react-router-dom';
import moment from 'moment';

function ViewForm() {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState('');
  const [formName, setFormName] = useState('');
  const { formId } = useParams();
  let history = useHistory();

  useEffect(() => {
    formData();
  }, []);

  const formData = async () => {
    try {
      setLoading(true);
      const result = await httpClient.get(USER_FORMS.GET_USER_FORM_DATA_BY_FORM_ID.replace('{formId}', formId));
      setDetails(result.data.response.userDetails.submitDetails);
      setFormName(result.data.response.userDetails.formName);
    } catch (err) {
      console.log(err);
      if (err.response) toast.error(err.response.data.message);
      else toast.error('Error');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRejectRequest = async(managerResponse) => {
    setLoading(true);
    try {
      setLoading(true);
      const response = await httpClient.patch(USER_FORMS.UPDATE_USER_RELIEVING_FORM_STATUS_BY_FORM_ID.replace('{formId}', formId), managerResponse);
      if(response.status===200){
        toast.success("Request Updated Successfully");
        history.push('/dashboard');
      }
    } catch (err) {
      console.log(err);
      if (err.response) toast.error(err.response.data.message);
      else toast.error('Error');
    } finally {
      setLoading(false);
    }  
  }

  return (
    <>
      <div className="feedback-main-wrapper">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="feedback-leftside2 position-realtive ps-0">
                <div className="d-flex justify-content-between align-items-center tableform-heading my-3">
                  <h2 className="m-0">{formName}</h2>
                  <div className="leave_btns">
                    <button
                      className="btn btn-success me-2"
                      onClick={()=>handleApproveRejectRequest({managerApproval:'Approved'})}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger me-4"
                      onClick={()=>handleApproveRejectRequest({managerApproval:'Rejected'})}
                    >
                      Reject
                    </button>
                    <Link to="/dashboard" className="back_btn">
                    <button className="btn btn-secondary">Back</button>
                  </Link>
                  </div>
                  
                </div>
              </div>
            </div>
            <div className="col-md-12">
              <table className="details-output-form">
                {details &&
                  details.length &&
                  details.map((item, index) => (
                    <tr key={index}>
                      <table className="w-100">
                        <tr>
                          <td>
                            <div className="quiz">{item.Question}</div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            {item.subQuestions && item.subQuestions.length > 0 ? (
                              item.subQuestions.map((subItem, index) => (
                                <div key={index} style={{ paddingLeft: '15px' }}>
                                  <div className="row">
                                    <div className="col-md-7">
                                      <ul className="sub-quiz-listing">
                                        <li>{subItem.Question}</li>
                                      </ul>
                                    </div>
                                    <div className="col-md-5 answer">{subItem.Answer}</div>
                                  </div>
                                </div>
                              ))
                            ) : item.key === 'dateOfJoining' || item.key === 'dateOfRelieving' ? (
                              <div className="answer">{moment(item.Answer).format('MM-DD-YYYY')}</div>
                            ) : (
                              <div className="answer">{item.Answer}</div>
                            )}
                          </td>
                        </tr>
                      </table>
                    </tr>
                  ))}
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="details-output-form-main w-100">
        <div className="container"></div>
      </div>
    </>
  );
}

export default ViewForm;
