const moment = require("moment");

const addEmployeeTemplate = (name, emp_id, password) => {
 return `<p>Hello ${name}</p>
  <p>you are registered with kis. Your employee_id is ${emp_id} and your password is ${password} </p>
  <p> Do not forward or share your  details to anyone</p>  
  <p> Sincerely</p>
  <p> The Kis Team</p>
  `;
};

const taggedEmployeeTemplate = (receiverName, message) => {
  return `<p>Hello ${receiverName},</p>
          <p>${message}</p>
          <a href="https://attendance.krishnais.com">attendance.krishnais.com</a>`;
 };

 const wfhTemplate = (user, body) => {
    return `<p>Hi Sir/Ma'am, </p>
     <p>Kindly Approve my below mentioned work from home request.</p>
    <p>
     <table className="table table-hover" style="border: 1px solid black; border-collapse: collapse;">
        <thead>
            <tr >
                <th colspan="3">Work From Home Application</th>
            </tr>
        </thead>
        <tbody>
        <tr>
        <th scope="col"  style="border: 1px solid black; border-collapse: collapse;">Employee Name</th>
        <td scope="col" style="border: 1px solid black; border-collapse: collapse;">${user.name}</td>
        </tr>
        <tr>
        <th scope="col"  style="border: 1px solid black; border-collapse: collapse;">Designation</th>
        <td scope="col" style="border: 1px solid black; border-collapse: collapse;">${user.designation}</td>
        </tr>
        <tr>
        <tr>
        <th scope="col"  style="border: 1px solid black; border-collapse: collapse;">Reason</th>
        <td scope="col" style="border: 1px solid black; border-collapse: collapse;">${body.wfh_reason}</td>
        </tr>
        <tr>
        <th scope="col"  style="border: 1px solid black; border-collapse: collapse;">Date</th>
        <td scope="col" style="border: 1px solid black; border-collapse: collapse;">${moment(body.from).format("DD/MM/YYYY")} - ${moment(body.to).format("DD/MM/YYYY")}</td>
        </tr>
        <tr>
        <th scope="col"  style="border: 1px solid black; border-collapse: collapse;">Approved By</th>
        <td scope="col" style="border: 1px solid black; border-collapse: collapse;">${body.approved_by}</td>
        </tr>
        </tbody>
   </table>

    </p>

     `;
 };

module.exports = {
  addEmployeeTemplate,
  taggedEmployeeTemplate,
  wfhTemplate,
};
