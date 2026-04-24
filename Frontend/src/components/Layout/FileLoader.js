import React from "react";
import LoaderImg from "../../assets/images/file_uploader.gif";

function FileLoader() {
  return (
    <div className="loader">
      <img src={LoaderImg} alt="" />
    </div>
  );
}

export default FileLoader;