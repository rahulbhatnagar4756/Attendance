const AWS = require('aws-sdk');
const config = require('../config/config');
const s3 = new AWS.S3({
  accessKeyId: config.aws.access_key,
  secretAccessKey: config.aws.secret_access_key,
});

const uploadImage = async (data) => {
  const params = {
    Bucket: 'kisuserimages', // pass your bucket name
    Key: 'test.jpg', // file will be saved as testBucket/contacts.csv
    Body: JSON.stringify(data, null, 2),
  };

  await s3.upload(params, function (err, data) {
    if (err) {
      console.log(err);
    }
    console.log(data, 'uploaded successfully');
  });
};

module.exports = {
  uploadImage,
};
