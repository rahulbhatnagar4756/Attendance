import React from "react";
import LoaderImg from "../../../assets/images/loader.gif"

function LoaderComponent() {
  return (
    <div className="">
      <img src={LoaderImg} alt="" width={18} height={18} style={{marginLeft:"10px"}} />
    </div>
  );
}

export default LoaderComponent;