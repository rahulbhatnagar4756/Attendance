import S3 from "react-aws-s3";
import { AWS } from "../constants/AppConstants";

export const uploadS3Image = async (fileInput, dirName) => {
  let result = {};
  let file = fileInput.current.files[0];
  let newFileName = fileInput.current.files[0].name.replace(/\..+$/, "");
  const config = {
    bucketName: AWS.BUCKET_NAME,
    dirName: dirName /* optional */,
    region: AWS.REGION,
    accessKeyId: AWS.ACCESS_KEY_ID,
    secretAccessKey: AWS.SECRET_ACCESS_KEY,
  };
  const ReactS3Client = new S3(config);
  await ReactS3Client.uploadFile(file, newFileName).then((data) => {
    result = data;
  });
  return result;
};
