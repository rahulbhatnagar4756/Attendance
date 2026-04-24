import React from "react";
import LoaderImg from "../../assets/images/loader.gif";

function Loader() {
  return (
    <div className="loader">
      <img src={LoaderImg} alt="" />
    </div>
  );
}

export default Loader;
