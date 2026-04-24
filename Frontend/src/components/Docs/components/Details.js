import React from 'react';
const Details = ({ nodeData }) => {
const data  = nodeData?.permittedUsers && nodeData?.permittedUsers.map(d=>d.name);

  return (
    <>
      <div>
        <table className="table table-hover employee-list-table">
          <thead>
            <span className='fw-bold' style={{ whiteSpace: 'nowrap' }}>Permitted Users</span>
            <tr>
              <th className="text-nowrap">
                S.No.
              </th>
              <th className="text-nowrap">
                Name
              </th>
            </tr>
          </thead>
          <tbody>
            {nodeData && nodeData.permittedUsers.map((data, i) => ( <tr key={i}>
              <td>
                <span className="number">{i + 1}</span>
              </td>
              <td className="textLeft text-nowrap">{data.user_id.name}</td>
            </tr>))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Details;
