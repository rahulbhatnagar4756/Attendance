const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const documentPermissionSchema = new Schema({

    document_id:
    {
        type: Schema.Types.ObjectId,
        ref: 'Documents',
    },
    user_id:
    {
        type: Schema.Types.ObjectId,
        ref: 'Users',
    },
},
    {
        timestamps: true,
    }
);
const DocumentsPermission = mongoose.model('DocumentsPermission', documentPermissionSchema);
module.exports = DocumentsPermission;