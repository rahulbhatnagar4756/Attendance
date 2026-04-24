import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { httpClient } from "../../../constants/Api";
import { useHistory } from "react-router";
import Loader from "../../Layout/Loader";
import UploadImage from "../../../assets/images/dummy_profile.jpeg";
import { USER } from "../../../constants/AppConstants";
import moment from "moment";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../../Utils/cropUtils"; // You'll need to create this utility file


function MyProfile() {
  const userDetail = useSelector((state) => state.user.user.user);
  let history = useHistory();
  const titleRef = useRef();
  const [values, setValues] = useState("");
  const [empRole, setEmpRole] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [employeeRegex, setEmployeeRegex] = useState("");
  const [employeeRegexClass, setEmployeeRegexClass] = useState("mb-4 col-lg-6");
  const [focusClass, setFocusClass] = useState("mb-4 col-lg-6");
  const [uploadedImage, setUploadedImage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [formErrors, setFormErrors] = useState({
    guardian_name: '',
    guardian_phone: '',
  });

  // Crop state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  // const [rotation, setRotation] = useState(0);

  useEffect(() => {
    getEmployee();
  }, []);

  useEffect(() => {
    if (formSubmitted) {
      const firstErrorField = document.querySelector('.form-control.is-invalid');

      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth' });
        firstErrorField.focus();
        setFormSubmitted(false);
      }
    }
  }, [formSubmitted]);

  const userData = JSON.parse(localStorage.getItem("user"));
  const userObject = userData && userData.user;
  const userRoleName = userObject && userObject.role.role;

  const handleCheckboxChange = (e) => {
    setIsChecked(!isChecked);
    if (e.target.checked) {
      setValues({ ...values, correspondence_address: values.permanent_address });
    } else {
      setValues({ ...values, correspondence_address: '' });
    }
  };

  const getEmployee = async () => {
    await httpClient
      .get(USER.GET_BY_ID.replace("{id}", userDetail.id))
      .then((res) => {
        if (res.status === 200) {
          res.data.user.doj = res.data.user.doj ? moment(res.data.user.doj).format("YYYY-MM-DD") : "MM/DD/YYYY";
          res.data.user.dob = res.data.user.dob ? moment(res.data.user.dob).format("YYYY-MM-DD") : "MM/DD/YYYY";
          setEmpRole(userDetail.role.role);
          setValues(res.data.user);
          setUploadedImage(res.data.user.profile_image);
          const addressesAreSame = res.data.user.permanent_address === res.data.user.correspondence_address && res.data.user.permanent_address != null && res.data.user.correspondence_address != null;
          setIsChecked(addressesAreSame);
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

  const validateForm = () => {
    const errors = {
      guardian_name: '',
      guardian_phone: '',
    };

    if (values.guardian_name && values.guardian_name.toString().trim() !== '' && !/^[A-Za-z\s]+$/.test(values.guardian_name)) {
      errors.guardian_name = 'Name must contain only letters and spaces';
    } else if (values.guardian_name && values.guardian_name.length === 1 && !values.guardian_name.match(/^[a-zA-Z]*$/)) {
      errors.guardian_name = 'On first place Name only allowed letter';
    }
    if (values.guardian_phone && values.guardian_phone.toString().trim() !== '' && !/^\d+$/.test(values.guardian_phone)) {
      errors.guardian_phone = 'Phone number must contain only numeric digits';
    } else if (values.guardian_phone && values.guardian_phone.toString().trim() !== '' && values.guardian_phone.toString().startsWith('0')) {
      errors.guardian_phone = 'On first place phone number only allowed non-zero digits';
    } else if (values.guardian_phone && values.guardian_phone.toString().trim() !== '' && values.guardian_phone.toString().length !== 10) {
      errors.guardian_phone = 'Phone number must be exactly 10 digits long';
    }

    setFormErrors(errors);
    return Object.values(errors).every((error) => error === '');
  };

  const updateEmployeeSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    values.role = values.role._id;
    values.working_hour = String(
      parseInt(values.out_time) - parseInt(values.in_time)
    );
    values.status = true;
    if (employeeRegex) {
      return;
    }
    const isValid = validateForm();
    if (isValid) {
      const formData = new FormData();
      for (let key of Object.keys(values)) {
        console.log({ [key]: values[key] })
        if (key === "guardian_phone" && values[key] === null) {
          formData.append([key], "");
        } else {
          formData.append([key], values[key]);
        }
      }
      try {
        await httpClient
          .put(USER.UPDATE_USER.replace("{id}", userDetail.id), formData)
          .then(async (res) => {
            if (res.status === 200) {
              toast.success("Profile Updated successfully");
              if (userRoleName === 'Out Source') {
                history.push("/docs/main-page");
              }
              else {
                history.push("/dashboard");
              }
              setLoading(false);
            }
          })
          .catch((err) => {
            console.log(err);
            if (err.response) {
              if (err.response.data.message === "Error: Email already exist!") {
                setErrorEmail("Email already exist!");
                setFocusClass("mb-4 col-lg-6 error-focus");
              } else if (
                err.response.data.message === "Employee ID already exist!"
              ) {
                setEmployeeRegex("Employee ID already exist!");
                setEmployeeRegexClass("mb-4 col-lg-6 error-focus");
              } else {
                toast.error(err.response.data.message);
              }
            } else {
              toast.error("Something went wrong");
            }
          });
      } catch (err) {
        console.log(err);
      }
    } else {
      setFormSubmitted(true);
      setLoading(false);
      return;
    }
  };

  const setEmpValue = (e) => {
    e.preventDefault();
    setValues({ ...values, emp_id: e.target.value });
    const regex = new RegExp(
      "^KIS/[A-Z][A-Z][A-Z]?/2[0-9][1-9][0-9]/[0-9][0-9]?[0-9]?$"
    );
    const matchEmpId = regex.test(e.target.value);
    if (!matchEmpId) {
      setEmployeeRegex("Please enter correct Employee ID");
      setEmployeeRegexClass("mb-4 col-lg-6 error-focus");
      return;
    } else {
      setEmployeeRegex("");
      setEmployeeRegexClass("mb-4 col-lg-6");
    }
  };

  // const handleClick = async (e) => {
  //   try {
  //     setImageLoading(true);
  //     let reader = new FileReader();
  //     reader.readAsDataURL(titleRef.current.files[0]);
  //     reader.onloadend = function (e) {
  //       setUploadedImage([reader.result]);
  //     };
  //     setValues({ ...values, profile_image: e.target.files[0]})
  //     setImageLoading(false);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  const handleClick = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageLoading(true);
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);

      // Reset zoom and rotation to defaults
      setZoom(1);
      // setRotation(0);

      setImageSrc(imageDataUrl);
      setShowCropModal(true);
      setImageLoading(false);

      // Reset the file input value so that selecting the same file again will trigger onChange
      e.target.value = '';
    }
  };

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropComplete = async () => {
    try {
      setImageLoading(true);
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        // rotation
      );

      // Convert blob to file
      const file = new File([croppedImage], "profile.jpg", { type: "image/jpeg" });

      setValues({ ...values, profile_image: file });
      setUploadedImage(URL.createObjectURL(croppedImage));
      setShowCropModal(false);
      setImageLoading(false);
    } catch (e) {
      console.error(e);
      setImageLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loader />}
      <div className="main_content_panel">
        <div className="header_title">
          <h1>
            {" "}
            <span> My Profile</span>
          </h1>
        </div>
        <form className="" auto-complete="off" onSubmit={updateEmployeeSubmit}>
          <div className="row">
            <div className="col-lg-6 mb-2">
              <div className="dashboard_card my_profile_card">
                <div className="header_title">
                  <h3> Employee Detail</h3>
                </div>
                <div className="employee_profile">
                  <div className="row">
                    <div className="mb-4 col-lg-6">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        value={values.name}
                        onChange={(e) =>
                          setValues({ ...values, name: e.target.value })
                        }
                        required
                        readOnly
                        className="form-control"
                        placeholder="Enter Full Name"
                      />
                    </div>
                    <div className={focusClass}>
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        value={values.email}
                        onChange={(e) =>
                          setValues({ ...values, email: e.target.value })
                        }
                        readOnly
                        required
                        className="form-control"
                        placeholder="Enter Email"
                      />
                      <small style={{ color: "red" }} role="alert">
                        {errorEmail}
                      </small>
                    </div>
                    <div className={employeeRegexClass}>
                      <label className="form-label">Employee ID</label>
                      <input
                        type="text"
                        value={values.emp_id}
                        onChange={setEmpValue}
                        required
                        readOnly
                        className="form-control"
                        placeholder="Enter Employee ID"
                      />
                      <small style={{ color: "red" }} role="alert">
                        {employeeRegex}
                      </small>
                    </div>
                    <div className="mb-4 col-lg-6">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="text"
                        value={values.phone}
                        onChange={(e) =>
                          setValues({ ...values, phone: e.target.value })
                        }
                        readOnly
                        minLength="10"
                        maxLength="10"
                        className="form-control"
                        placeholder="Enter Phone Number"
                      />
                    </div>
                    <div className="mb-4 col-lg-6">
                      <label className="form-label">Date of Birth</label>
                      <input
                        type="date"
                        value={values.dob}
                        onChange={(e) =>
                          setValues({
                            ...values,
                            dob: e.target.value,
                          })
                        }
                        readOnly
                        max={moment().format("YYYY-MM-DD")}
                        className="form-control"
                      />
                    </div>
                    <div className="mb-4 col-lg-6">
                      <label className="form-label">In Time</label>
                      <input
                        type="time"
                        value={values.in_time}
                        onChange={(e) =>
                          setValues({ ...values, in_time: e.target.value })
                        }
                        required
                        readOnly
                        className="form-control"
                        placeholder="Enter In Time"
                      />
                    </div>
                    <div className="mb-4 col-lg-6">
                      <label className="form-label">Out Time</label>
                      <input
                        type="time"
                        value={values.out_time}
                        onChange={(e) =>
                          setValues({ ...values, out_time: e.target.value })
                        }
                        required
                        readOnly
                        className="form-control"
                        placeholder="Enter Out Time"
                      />
                    </div>
                    <div className="mb-4 col-lg-6">
                      <label className="form-label">Designation</label>
                      <input
                        type="text"
                        value={values.designation}
                        onChange={(e) =>
                          setValues({
                            ...values,
                            designation: e.target.value,
                          })
                        }
                        required
                        readOnly
                        className="form-control"
                        placeholder="Enter Designation"
                      />
                    </div>
                    {/* <div className="mb-4 col-lg-6">
                      <label className="form-label">Select your role</label>
                      <input
                        type="text"
                        value={empRole}
                        onChange={(e) =>
                          setValues({
                            ...values,
                            designation: e.target.value,
                          })
                        }
                        required
                        readOnly
                        className="form-control"
                        placeholder="Enter Designation"
                      />
                    </div> */}
                    <div className="mb-4 col-lg-6">
                      <label className="form-label">Date of Joining</label>
                      <input
                        type="date"
                        value={values.doj}
                        onChange={(e) =>
                          setValues({
                            ...values,
                            doj: e.target.value,
                          })
                        }
                        readOnly
                        required
                        className="form-control"
                        placeholder="Enter Designation"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 mb-2">
              <div className="dashboard_card my_profile_card">
                <div className="header_title">
                  <h3> Personal Detail</h3>
                </div>
                <div className="employee_profile">
                  <div className="row">
                    <div className="mb-4 col-lg-6">
                      <label className="form-label">Guardian Name</label>
                      <input
                        type="text"
                        name="guardian_name"
                        value={values.guardian_name}
                        className={`form-control ${formErrors.guardian_name ? 'is-invalid' : ''}`}
                        placeholder="Enter Guardian Name"
                        onChange={(e) => {
                          const inputText = e.target.value;
                          if (inputText.length === 1 && !inputText.match(/^[a-zA-Z]*$/)) {
                            setFormErrors({ ...formErrors, guardian_name: 'On first place Name only allowed letter ' });
                            return;
                          }
                          if (!inputText.match(/^[a-zA-Z\s]*$/)) {
                            setFormErrors({ ...formErrors, guardian_name: 'Name must contain only letters and spaces' });
                            return;
                          }
                          setValues({
                            ...values,
                            guardian_name: inputText,
                          });
                          setFormErrors({ ...formErrors, guardian_name: '' });
                        }}
                        onBlur={() => {
                          if (values.guardian_name.length === 0) {
                            setFormErrors({ ...formErrors, guardian_name: '' });
                          }
                        }}
                      />
                      <small style={{ color: 'red' }} role="alert">
                        {formErrors.guardian_name}
                      </small>
                    </div>
                    <div className={focusClass}>
                      <label className="form-label">
                        Guardian Contact Number
                      </label>
                      <input
                        type="text"
                        maxLength="10"
                        value={values.guardian_phone}
                        className={`form-control ${formErrors.guardian_phone ? 'is-invalid' : ''}`}
                        placeholder="Enter Guardian Phone Number"
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          // Use a regular expression to remove any non-digit characters
                          const cleanedInput = inputValue.replace(/[^0-9]/g, '');
                          setValues({
                            ...values, guardian_phone: cleanedInput,
                          })
                          setFormErrors({ ...formErrors, guardian_phone: '' });
                          if (cleanedInput.startsWith('0')) {
                            setFormErrors({ ...formErrors, guardian_phone: 'On first place phone number only allowed non-zero digits' });
                          }
                        }}
                      />
                      <small style={{ color: 'red' }} role="alert">
                        {formErrors.guardian_phone}
                      </small>
                    </div>
                    <div className={focusClass}>
                      <label className="form-label">Blood Group</label>
                      <input
                        type="text"
                        value={values.blood_group}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          if (/^[A-Za-z][A-Za-z\s()+-]*$/.test(inputValue) || inputValue === '') {
                            // Allow empty input or only letters (uppercase and lowercase), spaces, and small brackets, but not as the first character
                            setValues({ ...values, blood_group: e.target.value })
                          }
                        }}

                        className="form-control"
                        placeholder="Enter Blood Group"
                      />
                    </div>
                    <div className={focusClass}>
                      <label className="form-label">Marital Status</label>
                      <select
                        className="form-control"
                        aria-label="Default select example"
                        value={values.marital_status}
                        onChange={(e) =>
                          setValues({
                            ...values,
                            marital_status: e.target.value,
                          })
                        }
                      >
                        <option value="">Select</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                      </select>
                    </div>

                    <div className={employeeRegexClass}>
                      <label className="form-label">Permanent Address</label>
                      <textarea
                        row="3"
                        className="form-control"
                        placeholder="Enter Permanent Address"
                        value={values.permanent_address}
                        onChange={(e) => {
                          if (e.target.value !== values.correspondence_address) {
                            setIsChecked(false);
                          }
                          setValues({
                            ...values,
                            permanent_address: e.target.value,
                          });
                        }}
                      ></textarea>
                    </div>
                    <div className={employeeRegexClass}>
                      <label className="form-label">
                        Correspondence Address
                      </label>
                      <textarea
                        row="3"
                        className="form-control"
                        placeholder="Enter Correspondence Address"
                        value={values.correspondence_address}
                        disabled={isChecked ? true : false}
                        onChange={(e) => {
                          setValues({
                            ...values,
                            correspondence_address: e.target.value,
                          });
                        }}
                      ></textarea>
                      <div className="d-flex align-items-start" style={{ marginTop: '5px' }}>
                        <input className="mt-1" type="checkbox" checked={isChecked} onChange={handleCheckboxChange} />
                        <label className="form-label" style={{ marginLeft: '10px', fontSize: '14px' }}>Same As Permanent Address</label>
                      </div>
                    </div>
                    <div className="mb-5 col-lg-5">
                      <div className="profile-outer-pic text-center">
                        <div className="profile-pic justify-content-center">
                          <label className="-label" htmlFor="file">
                            <span className="glyphicon glyphicon-camera"></span>
                            <span>
                              {!imageLoading ? "Change Image" : "Uploading..."}
                            </span>
                          </label>
                          <input
                            id="file"
                            type="file"
                            onChange={handleClick}
                            ref={titleRef}
                            accept="image/*"
                          />
                          <img
                            src={uploadedImage ? uploadedImage : UploadImage}
                            alt=""
                            id="output"
                            width="200"
                          />
                        </div>
                        <label className="form-label profile_image_title mt-3">Upload Profile Image</label>
                      </div>
                    </div>
                    {showCropModal && (
                      <div className="crop-modal">
                        <div className="crop-modal-content">
                          <div className="modal-title">Crop Profile Image</div>

                          <div className="crop-container">
                            <Cropper
                              image={imageSrc}
                              crop={crop}
                              zoom={zoom}
                              // rotation={rotation}
                              aspect={1}
                              onCropChange={setCrop}
                              onCropComplete={onCropComplete}
                              onZoomChange={setZoom}
                            />
                          </div>

                          <div className="controls">
                            <div className="control-group">
                              <label>Zoom: {Number(zoom - 1).toFixed(1)}x</label>
                              <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                onChange={(e) => setZoom(Number(e.target.value))}
                              />
                            </div>

                            <div className="control-group">
                              {/* <label>Rotation: {rotation}°</label>
                              <input
                                type="range"
                                value={rotation}
                                min={0}
                                max={360}
                                step={1}
                                onChange={(e) => setRotation(Number(e.target.value))}
                              /> */}
                              {/* <div className="rotation-buttons">
                                <button
                                  type="button"
                                  className="btn-rotate"
                                  onClick={() => setRotation((prev) => (prev - 90) % 360)}
                                >
                                  ↺ 90°
                                </button>
                                <button
                                  type="button"
                                  className="btn-rotate"
                                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                                >
                                  ↻ 90°
                                </button>
                              </div> */}
                            </div>
                          </div>

                          <div className="modal-buttons">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setShowCropModal(false)}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={handleCropComplete}
                              disabled={imageLoading}
                            >
                              {imageLoading ? "Saving..." : "Save"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-12" style={{ textAlign: "Center" }}>
              <button
                type="submit"
                disabled={imageLoading ? true : false}
                className="btn btn-leave_status"
              >
                Submit Details
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default MyProfile;
