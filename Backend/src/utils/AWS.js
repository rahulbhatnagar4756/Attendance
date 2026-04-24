
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
        Key: 'porfile-images/' + moment() + "-" + data.file.name,
    };

    return s3.upload(uploadParams).promise();
}

const s3CheckoutImageUpload = async (data) => {
    const uploadParams = {
        Bucket: AWS_BUCKET,
        Body: data.file.data,
        Key: 'checkout-user-images/' + moment() + "-" + data.file.name,
    };

    return s3.upload(uploadParams).promise();
}

const s3DocumentVerificationImageUpload = async (data) => {
    const uploadParams = {
        Bucket: AWS_BUCKET,
        Body: data.file.data,
        Key: 'employee-document-verification-images/' + moment() + "-" + data.file.name,
    };

    return s3.upload(uploadParams).promise();
}

const s3SickLeaveAttachmentUpload = async (data) => {
    const uploadParams = {
        Bucket: AWS_BUCKET,
        Body: data.file.data,
        Key: 'sick-leave-attachment/' + moment() + "-" + data.file.name,
    };

    return s3.upload(uploadParams).promise();
}



module.exports = {
    s3Upload,
    s3CheckoutImageUpload,
    s3DocumentVerificationImageUpload,
    s3SickLeaveAttachmentUpload

}
