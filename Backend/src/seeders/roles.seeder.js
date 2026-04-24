const mongoose = require('mongoose');
const config = require('../config/config');
const logger = require('../config/logger');
const Roles = require('../models/roles.model');

mongoose.connect(config.mongoose.url, { useNewUrlParser: true, useUnifiedTopology: true });

const roles = [
  new Roles({
    role: 'Super Admin',
  }),
  new Roles({
    role: 'Project Manager',
  }),
  new Roles({
    role: 'Sales',
  }),
  new Roles({
    role: 'HR',
  }),
  new Roles({
    role: 'Employee',
  }),
  new Roles({
    role: 'Out Source',
  }),
];

const getAllRoles = async () => {
  return Roles.find();
};

let done = 0;
for (let i = 0; i < 1; i++) {
  getAllRoles().then((res) => {
    if (res.length < 1) {
      for (let i = 0; i < roles.length; i++) {
        roles[i].save(function (err, res) {
          done++;
          if (done === roles.length) {
            exit();
          }
        });
      }
    } else {
      exit();
    }
  });
  logger.info('Database seeded successfully');
}

function exit() {
  mongoose.disconnect();
}
