const { User, Organisation, Leaves } = require('../models/index');
const { roles } = require('../config/roles.js');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const checkAccess = async (parentId, userId, leaveId) => {
  try {
    let currentUserRoleData = await User.findOne({ _id: parentId }).populate({
      path: 'role',
      select: 'role',
    });    
    const { role } = currentUserRoleData;       
    if (role.role === (!roles[1] || !roles[4])) {
      if (parentId && (userId || leaveId)) {       
        if (!currentUserRoleData) throw new ApiError(httpStatus.NOT_FOUND);        
        let childrensId = [];  
        let currentUserLevelData = await Organisation.findOne({ parent: parentId });    
        let parentLevel1 = currentUserLevelData.children;
        childrensId = [...parentLevel1];
        if (parentLevel1) {
          const parentLevel2 = await Organisation.find({ parent: { $in: parentLevel1 } }).select("children");
          for (let child of parentLevel2) {
            childrensId = [...childrensId, ...child.children];
          }
          if (childrensId) {
            const childlevel3 = await Organisation.find({ parent: { $in: childrensId } }).select("children");
            for (let child of childlevel3) {
              childrensId = [...childrensId, ...child.children];
            }
          }
        }
        if (!currentUserLevelData) throw new ApiError(httpStatus.NOT_FOUND);
        let childIsExist;
        let userData;
        if (leaveId) {
          userData = await Leaves.findOne({ _id: leaveId }).populate({
            path: 'user_id',
            select: '_id',
          });
          const { user_id } = userData;

          childIsExist = childrensId.find((item) => item.toString() === user_id._id.toString());
        }
        if (userId) childIsExist = childrensId.find((item) => item.toString() === userId.toString());
        if (role.role === roles[1] || role.role === roles[4] || (currentUserLevelData && childIsExist)) return false;
        else true;
      } throw new ApiError(httpStatus.NOT_FOUND);

      }
      else{
        return false;
      }
    } catch (err) {
      console.log(err)
      throw new ApiError(httpStatus.UNAUTHORIZED, err);
    }
  };

  module.exports = {
    checkAccess,
  };
