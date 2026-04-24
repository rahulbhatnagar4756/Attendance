const moment = require("moment");
const formatTime = (time) => {
    return moment(time, "h:m").format("hh:mm A");
  };
const leaveTemplate = (user, body) => {
    return `<p>Hi Sir/Ma'am, </p>
     <p>Kindly Approve my below mentioned leave.</p>
    <p>
     <table className="table table-hover" style="border: 1px solid black; border-collapse: collapse;">
        <thead>
            <tr >
                <th colspan="3">Leave Application</th>
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
        <th scope="col"  style="border: 1px solid black; border-collapse: collapse;">Leave Type(Full Day/Half Day/ Short Leave)</th>
        <td scope="col" style="border: 1px solid black; border-collapse: collapse;">${body.type}</th>
        </tr>
        <tr>
        <th scope="col"  style="border: 1px solid black; border-collapse: collapse;">Reason</th>
        <td scope="col" style="border: 1px solid black; border-collapse: collapse;">${body.leave_reason}</td>
        </tr>
        <tr>
        <th scope="col"  style="border: 1px solid black; border-collapse: collapse;">Date</th>
        <td scope="col" style="border: 1px solid black; border-collapse: collapse;">${moment(body.from).add(330, 'm').format("DD/MM/YYYY")} ${body.type === "Half Day" || body.type === "Short Leave" || moment(moment(body.from).format("YYYY/MM/DD")).isSame(moment(moment(body.to).format("YYYY/MM/DD"))) ? " " : "to " + moment(body.to).format("DD/MM/YYYY")}</td>
        </tr>
        <tr>
        <th scope="col"  style="border: 1px solid black; border-collapse: collapse;">Time</th>
        <td scope="col" style="border: 1px solid black; border-collapse: collapse;">${body.start_time?formatTime(body.start_time):""}-${body.end_time?formatTime(body.end_time):""}</td>
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
    leaveTemplate,
};