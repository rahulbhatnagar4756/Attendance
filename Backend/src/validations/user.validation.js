const Joi = require('@hapi/joi');
const { password, objectId } = require('./custom.validation');

const addEmployee = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    name: Joi.string().required(),
    emp_id: Joi.string().required(),
    phone: Joi.number().required(),
    doj: Joi.date().required(),
    dob: Joi.date(),
    designation: Joi.string().required(),
    profile_image: Joi.string(),
    in_time: Joi.string().required(),
    out_time: Joi.string().required(),
    working_hour: Joi.string().required(),
    password: Joi.string().required().custom(password),
    role: Joi.string().required().custom(objectId),
    status: Joi.boolean().required(),
    allotted_leaves: Joi.number(),
    level:Joi.string(),
    userId: Joi.string().optional()
  }),
};

const addEmployeeSalary = {
  salarySlipValues:Joi.object().keys({
    basic: Joi.number().allow("").optional(),
    hra: Joi.number().allow("").optional(),
    cca: Joi.number().allow("").optional(),
    medical: Joi.number().allow("").optional(),
    transport: Joi.number().allow("").optional(),
    employer_pf: Joi.number().allow("").optional(),
    performance_incentive: Joi.number().allow("").optional(),
    pf_deduction: Joi.number().allow("").optional(),
    esi_deduction: Joi.number().allow("").optional(),
    professional_tax: Joi.number().allow("").optional(),
    medical_insurance: Joi.number().allow("").optional(),
    income_tax: Joi.number().allow("").optional(),
    leave_deduction: Joi.number().allow("").optional(),
    month: Joi.string().required(),
    year: Joi.string().required(),
  }),
};

const addEmployeeVerification = {
  formData: Joi.object().keys({
    prev_company_emp_id: Joi.string().optional(),
    prev_company_name: Joi.string().optional(),
    prev_company_doj: Joi.date().optional(),
    prev_company_dor: Joi.date().optional(),
    prev_company_designation: Joi.string().optional(),
    prev_company_employment_status: Joi.string()
    .valid('Active', 'Resigned And Left', 'Absconding', 'Terminated', 'Serving Notice Period')
    .optional(),
    elligible_for_rehire: Joi.string().optional(),
    additional_comments: Joi.string().allow(''),
    file_name: Joi.string().optional(),
    document_image: Joi.string().optional(),
  }),
};

const uploadImage = {
  body: Joi.object().keys({
    profile_image: Joi.string(),
  }),
};


const deleteEmployee = {
  body: Joi.object().keys({
    userId: Joi.array().required().custom(objectId),
  }),
};

module.exports = {
  addEmployee,
  deleteEmployee,
  uploadImage,
  addEmployeeVerification,
  addEmployeeSalary
};
