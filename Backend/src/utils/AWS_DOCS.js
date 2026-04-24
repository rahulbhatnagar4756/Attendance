
const AWS = require('aws-sdk');
const moment = require('moment')
const { AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, AWS_REGION_NAME, AWS_BUCKET } = process.env
const s3Credentials = {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION_NAME
}

AWS.config.update(s3Credentials);
const s3 = new AWS.S3(s3Credentials.region);

const s3Upload = async (data) => {
    const uploadParams = {
        Bucket: AWS_BUCKET,
        Body: data.file.data,
        Key: 'kis-documents/local/' + moment() + "-" + data.file.name,
        Key: 'kis-documents/stagging/' + moment() + "-" + data.file.name,
        Key: 'kis-documents/live/' + moment() + "-" + data.file.name,
    };

    return s3.upload(uploadParams).promise();
}


module.exports = {
    s3Upload
}