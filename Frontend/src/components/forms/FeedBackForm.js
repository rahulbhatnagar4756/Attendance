import React, { useState, useEffect } from 'react';
import { httpClient } from '../../constants/Api';
import { USER_FORMS } from '../../constants/AppConstants';
import { toast } from 'react-toastify';
import { Formio } from 'react-formio';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import logo from '../../assets/images/logo-2.png';

function FeedBackForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState('');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDocId, setFormDocId] = useState('');
  const userId = useSelector((state) => state.user.user.user.id);
  let history = useHistory();

  useEffect(() => {
    printResult();
  }, [formData, formDocId]);

  useEffect(() => {
    getUsersFormTemplate();
  }, []);

  const getUsersFormTemplate = async () => {
    try {
      setLoading(true);
      const result = await httpClient.get(USER_FORMS.GET_USER_FORM.replace('{userId}', userId));
      if (result.data.response.formByUserId.length) {
        // if Admin or HR Re-Assign already submitted form to edit/update submitted form  
        if(result.data.response.formByUserId[0].submitDetails.length > 1){
          const firstArray = result.data.response.formByUserId[0].formJson;
          const secondArray = result.data.response.formByUserId[0].submitDetails;

        // 1st Method to update formJSON with already filled values to show already filled data to user  Using two seperate loop for both cases

        // // Case 1: Matching the labels and questions
        // for (let i = 0; i < firstArray.length; i++) {
        //   const currentLabel = firstArray[i].label;
        //   for (let j = 0; j < secondArray.length; j++) {
        //       const currentQuestion = secondArray[j].Question;
        //       if (currentLabel === currentQuestion) {
        //           firstArray[i].defaultValue = secondArray[j].Answer;
        //       }
        //   }
        // }

        // // Case 2: Matching subQuestions
        // for (let i = 0; i < firstArray.length; i++) {
        //   const currentQuestions = firstArray[i].questions;
        //   if (currentQuestions) {
        //       for (let j = 0; j < currentQuestions.length; j++) {
        //           const currentQuestionLabel = currentQuestions[j].label;
        //           for (let k = 0; k < secondArray.length; k++) {
        //               const subQuestions = secondArray[k].subQuestions;
        //               if (subQuestions) {
        //                   for (let l = 0; l < subQuestions.length; l++) {
        //                       if (currentQuestionLabel === subQuestions[l].Question) {
        //                           if (!firstArray[i].defaultValue) {
        //                               firstArray[i].defaultValue = {};
        //                           }
        //                           firstArray[i].defaultValue[subQuestions[l].key] = subQuestions[l].Answer;
        //                       }
        //                   }
        //               }
        //           }
        //       }
        //   }
        // }



        // 2nd Method to update formJSON with already filled values to show already filled data to user  Using Single loop for both cases

        for (let i = 0; i < firstArray.length; i++) {
          const currentLabel = firstArray[i].label;
          const currentQuestions = firstArray[i].questions;

          for (let j = 0; j < secondArray.length; j++) {
              const currentQuestion = secondArray[j].Question;

              // Case 1: Matching labels and questions
              if (currentLabel === currentQuestion) {
                  firstArray[i].defaultValue = secondArray[j].Answer;
              }

              // Case 2: Matching subQuestions
              if (currentQuestions) {
                  const subQuestions = secondArray[j].subQuestions;
                  if (subQuestions) {
                      for (let k = 0; k < subQuestions.length; k++) {
                          if (currentQuestions.find((q) => q.label === subQuestions[k].Question)) {
                              if (!firstArray[i].defaultValue) {
                                  firstArray[i].defaultValue = {};
                              }
                              const matchingQuestion = currentQuestions.find((q) => q.label === subQuestions[k].Question);
                              firstArray[i].defaultValue[subQuestions[k].key] = subQuestions[k].Answer;
                          }
                      }
                  }
              }
          }
        }
          //When HR or Admin already submiited form assigned again
          setFormData(firstArray);
        }else{
          // When HR or Admin Assigned a new form 
          setFormData(result.data.response.formByUserId[0].formJson);
        }
        setFormName(result.data.response.formByUserId[0].formName);
        setFormDescription(result.data.response.formByUserId[0].formDescription);
        setFormDocId(result.data.response.formByUserId[0]._id);
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

  const printResult = () => {
    Formio.createForm(document.getElementById('formio-result'), {
      components: formData,
    }).then((form) => {
      // console.log({ form });
      // console.log(form.component.components);
      // form.on("submit", (data) => console.log("submit", data));
      form.on('submit', async function (submission) {
        try {
          setLoading(true);
          await httpClient.patch(`${USER_FORMS.SUBMIT_USER_FORM}?formDocId=${formDocId}`, submission);
          toast.success('Form submitted successfully');
          history.push('/user-form/thankyou');
          localStorage.setItem('submitForm', true);
        } catch (err) {
          console.log(err);
          if (err.response)
            if(err.response.data.message==="Error: Already Submitted"){
              toast.error(`You Have Already Submitted "${formName}"`);
            }
            else{
              toast.error(err.response.data.message);
            }
          else{
            toast.error("Something went wrong");
          }  
        } finally {
            setLoading(false);
        }
      });
    });
  };

  return (
    <div className="feedback-main-wrapper">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-4">
            <div className="feedback-leftside">
              <div className="from-logo">
                <img src={logo} width="40" className="me-2" />
              </div>
              <h2 className='mt-2'>{formName}</h2>
              <p>{formDescription}</p>
            </div>
          </div>
          <div className="col-md-8">
            <div className="feedback-form-wapper">
              <div>
                <div id="formio-result" />
              </div>
              {/* <Link to="/dashboard" className='back_btn'><button className="btn btn-secondary">Back</button></Link> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedBackForm;
