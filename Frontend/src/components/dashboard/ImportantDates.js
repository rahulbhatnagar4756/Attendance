import React, { useEffect, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { httpClient } from "../../constants/Api";
import { IMPORTANT_DATES } from "../../constants/AppConstants";

function ImportantDates() {
  const [impDates, setImpDates] = useState("");

  useEffect(() => {
    const getImportantDates = () => {
      try {
        httpClient
          .get(IMPORTANT_DATES.get)
          .then((res) => {
            if (res.status === 200) {
              setImpDates(res.data);
            }
          })
          .catch((err) => {
            if (err.response) {
              toast.error(err.response.data.message);
            } else {
              toast.error("Something went wrong");
            }
          });
      } catch (err) {
        console.log(err);
      }
    };
    getImportantDates();
  }, []);

  return (
    <>
      <div className="col-lg-3">
        <div className="dashboard_card">
          <div className="card_title">
            <h4>Important Dates</h4>
          </div>
          <marquee direction="up" style={{ height: "500px" }}>
            <ul className="important_date_list">
              {impDates &&
                impDates.map((dates, i) => (
                  <li key={i}>
                    <div className="date_item">
                      <h2>{moment(dates.date).format("D")}</h2>
                      <h4>{moment(dates.date).format("MMM")}</h4>
                    </div>
                    <p>{dates.event}</p>
                  </li>
                ))}
            </ul>
          </marquee>
        </div>
      </div>
    </>
  );
}

export default ImportantDates;
