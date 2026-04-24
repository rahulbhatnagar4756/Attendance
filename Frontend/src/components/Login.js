import React, { useState } from "react";
import { Redirect } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

// import { toast } from "react-toastify";
import loginImage from "../assets/images/login.jpg";

import { userSignIn } from "../redux/actions/AuthActions";

import { AiOutlineEyeInvisible, AiOutlineEye } from 'react-icons/ai';
import { httpClient } from "../constants/Api";
import { USER } from "../constants/AppConstants";
import { toast } from 'react-toastify';

function Login() {
  const dispatch = useDispatch();
  const route = useSelector((state) => state.route.route);
  const loading = useSelector((state) => state.user.loading);
  const[state, setState] = useState(false);
  const [values, setValues] = useState({
    username: "",
    password: "",
    role: "",
    type:""
  });
  const toggleBtn =() =>{
    
    setState( prevState => !prevState);
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = await httpClient.post(USER.GET_USER_BY_EMP_ID, {empId:values.username});
    if(!userData.data.user){
      toast.error("Incorrect Username or Password");
    }else{
     dispatch(userSignIn({...values, role:userData.data.user.role._id, type: "user"}));
    }
  };
  return (
    <>
      {route === "/dashboard" && <Redirect to="/dashboard" />}
      {route === "/docs/main-page" && <Redirect to="/docs/main-page" />}
      <div className="login-page">
        <div className="login-box">
          <div className="illustration-wrapper">
            <img src={loginImage} alt="Login" />
          </div>
          <form
            id="login-form"
            onSubmit={handleSubmit}
            className="row g-3 needs-validation"
            noValidate
          >
            <p className="form-title">Welcome back</p>
            <p>Login to Mark your Attendance</p>
            <div className="col-md-12">
              <label htmlFor="validationCustom01" className="form-label">
                Employee Id
              </label>
              <input
                type="text"
                className="form-control"
                id="validationCustom01"
                value={values.username}
                onChange={(e) =>
                  setValues({ ...values, username: e.target.value })
                }
                required
              />
              <div className="valid-feedback">Looks good!</div>
            </div>
            <div className="col-md-12">
              <label htmlFor="validationCustom02" className="form-label">
                Password
              </label>
              <div  style={{height:"20px", padding:"10px", position:"absolute", marginLeft:"310px", }}  onClick={()=>toggleBtn()} >{state ?<AiOutlineEyeInvisible/>:<AiOutlineEye/>} </div>
              <input
            
               type={state ? "text" : "password"}
                className="form-control"
                
                id="validationCustom02"
                value={values.password}
                onChange={(e) =>
                  setValues({ ...values, password: e.target.value })
                }
                required
                style ={{}}
              />
              
              <div className="valid-feedback">Looks good!</div>
            </div>
            <div className="col-12">
              {loading ? (
                <button
                  className="req_btn w-100 pe-none"
                  type="submit"
                  disabled
                >
                  <div
                    className="spinner-border text-light"
                    style={{ width: "1.5em", height: "1.5em" }}
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </button>
              ) : (
                <button className="req_btn w-100" type="submit">
                  Login Now
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
export default Login;
