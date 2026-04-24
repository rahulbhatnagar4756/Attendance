import React, { useState, useEffect } from 'react';
import { SALARY_SLIP } from '../../../constants/AppConstants';
import { useSelector } from 'react-redux';
import MonthYearDropdown from './MonthYearDropdown ';
import { getAccessToken } from '../../../constants/Api';
import { API_BASE_URL } from '../../../environment';
import { toast } from 'react-toastify';
import { httpClient } from '../../../constants/Api';
import LoaderComponent from './LoaderComponent';

const EmployeeSalarySlip = () => {
  const userData = useSelector((state) => state.user.user.user);
  const [selectedDate, setSelectedDate] = useState('');
  const [pdfLink, setPdfLink] = useState("");
  const inputElement = React.useRef()
  const [isLoading, setLoading] = useState(false); 
  const [allSalariesData, setallSalariesData] = useState([]);
  
  useEffect(() => {
    getAllSalaryData();
  }, []);

  const getAllSalaryData = async() => {
       await httpClient
      .get(SALARY_SLIP.GET_ALL_SALARY_SLIP_OF_A_USER.replace('{userId}', userData.id))
      .then((res) => {
        console.log({res})
        if (res.status === 200) {
          setallSalariesData(res.data.salaries)
        }
      })
      .catch((err) => {
        if (err.response) {
          toast.error(err.response.data.message);
        } else {
          toast.error('Something went wrong');
        }
      });
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const token = getAccessToken();
  //  const url = `http://localhost:3001/v1/user/get/salary-slip/${userData.id}`;
  const url = `${API_BASE_URL}/${SALARY_SLIP.GET_SALARY_SLIP_BY_USER_ID}/${userData.id}`;
  const fullToken = `Bearer ${token}`;
 

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   console.log("onSubmit ios calling")
  //   const xmlhttp = new XMLHttpRequest();
  //   const formData = new FormData();

  //   formData.append('authorization', fullToken);
  //   formData.append('selectedDate', selectedDate);

  //   xmlhttp.open('POST', url);
  //   xmlhttp.setRequestHeader('Access-Control-Allow-Origin', '*');

  //   xmlhttp.responseType = 'stram';
  //   xmlhttp.onload = function () {
  //     if (xmlhttp.readyState === xmlhttp.DONE) {
  //         if (xmlhttp.status === 200) {
  //           // saveAs(xmlhttp.response);
  //           console.log(xmlhttp.response,"rfjrwerj");
  //           console.log(xmlhttp.responseText, "dgdfgfdgfd");
  //           //window.open("data:application/pdf;base64," + xmlhttp.response, '_blank');
  //          const link = document.createElement('a');
  //           //link.setAttribute('href', 'data:"application/pdf;' + xmlhttp.response);
  //           //console.log(xmlhttp.response, 'sdsdsdssd');
  //            link.setAttribute('href', 'data:application/pdf;base64,' + xmlhttp.response);
  //            //setPdfLink("data:application/pdf;base64," + xmlhttp.response);


  //           link.setAttribute('download', 'Salary-slip.pdf');
        
  //           document.body.appendChild(link);
  //           link.click();
  //           document.body.removeChild(link);


  //           //saveAs(xmlhttp.response, 'salary.pdf');
  //         }else if(xmlhttp.status === 404){

  //           console.log(xmlhttp,"rfjrwerj");
  //           console.log(xmlhttp.responseText, "dgdfgfdgfd");
  //           toast.error(JSON.parse(xmlhttp.response.message));
  //           // toast.error("salry not found for this user, please add first");
  //         }else{
  //           toast.error("Something went wrong");
  //         }
  //         //inputElement.click();
  //     }
  // };

  //   xmlhttp.send(formData);
  // };



  const handleSubmit = (e)=>{
    e.preventDefault();
    setLoading(true);
      try {
        const bodyData = {
          authorization:fullToken,
          selectedDate
        }

        httpClient
          .post(`${SALARY_SLIP.GET_SALARY_SLIP_BY_USER_ID}/${userData.id}`, bodyData)
          .then((res) => {
            console.log(res);
            const link = document.createElement('a');
            link.setAttribute('href', 'data:application/pdf;base64,' + res.data);
            link.setAttribute('download', 'Salary-slip.pdf');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setLoading(false);
          })
          .catch((err) => {
            console.log({err})
            if (err.response) {
              toast.error(err.response.data.message);
            } else {
              toast.error('Something went wrong');
            }
            setLoading(false)
          });
      } catch (err) {
        console.log(err);
        if (err.response) {
          toast.error(err.response.data.message);
        } else {
          toast.error('Something went wrong');
        }
         setLoading(false); 
      }
  
  };
  return (
    <div className="main_content_panel">
      <div className="header_title_docs mb-4">
        <h1 className="ms-0">
          <span>Download Salary Slip</span>
        </h1>
      </div>
      <form auto-complete="off" onSubmit={handleSubmit}>
        <div className="col-sm-4">
          {/* previous working functionality show date dropdown based on joiningDate when single salary details saved in db for every user
          <MonthYearDropdown joiningDate={new Date(userData.doj)} onDateSelect={handleDateSelect} /> */}
          {/* New functionality Show all salaries date dropdown of a user that are saved in Database */}
          <MonthYearDropdown allSalariesData = {allSalariesData} onDateSelect={handleDateSelect} />
          <input type="hidden" name="authorization" value={fullToken} />
          <button type="submit" className="btn btn-leave_status mt-3">
            Generate{ isLoading ? <LoaderComponent/> : ''}
          </button>
          {pdfLink && <a  download href={pdfLink} ref={inputElement} > Click to Download </a>}
        </div>
      </form>
    </div>
  );
};

export default EmployeeSalarySlip;
