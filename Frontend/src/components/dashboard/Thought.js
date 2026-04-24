import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { httpClient } from "../../constants/Api";
import { THOUGHT } from "../../constants/AppConstants";
import BdayCake from "../../assets/images/bday_design.png";
import ThoughtImage from "../../assets/images/thought_bg.png";

function Thought() {
  const [thought, setThought] = useState("");
  const [type, setType] = useState("");
  const [imageUrl, setBgUrl] = useState("");

  useEffect(() => {
    const getThought = () => {
      try {
        httpClient
          .get(THOUGHT.GET_THOUGHT)
          .then((res) => {
            if (res.status === 200 && res.data.listThought[0]) {
              setThought(
                res.data.listThought[0].thought
                  .replaceAll("&lt;", "<")
                  .replaceAll("&gt;", ">")
              );
              setType(res.data.listThought[0].title);
              setBgUrl(res.data.listThought[0].background_image);
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
    getThought();
  }, []);

  return (
    <>
      {thought.length > 0 && (
        <div className="col-md-12 mb-4">
          <div className="thoughtof_day_wrapper">
            <span>
              {" "}
              Today’s
              <br /> {type === "Thought" ? "Thought" : "Announcement"}
            </span>
            <div className="thought_box">
              <div
                className="dashboard_card"
                style={{
                  backgroundImage: `url(${imageUrl ? imageUrl : ThoughtImage})`,
                }}
              >
                <div className="content_container">
                  <div className="top_design_element">
                    <img src={BdayCake} alt="" />
                  </div>
                  <h2>
                    <div dangerouslySetInnerHTML={{ __html: thought }}></div>
                    {/* {thought ? thought.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replace(/<[^>]+>/g, '') : "No Thought For Today"} */}

                    {/* {thought} */}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Thought;
