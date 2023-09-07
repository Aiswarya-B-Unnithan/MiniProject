const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});
// Apply pagination plugin to the product schema
AdminSchema.plugin(mongoosePaginate);
const adminCollection = mongoose.model("admin", AdminSchema);

module.exports = adminCollection;
