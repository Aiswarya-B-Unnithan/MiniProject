const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const User = require("./userModel");

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  fName: { type: String, required: true },
  lName: { type: String, required: true },
  email: { type: String, required: true },
  address1: { type: String, required: true },
  address2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  mobile: { type: Number },
});

addressSchema.plugin(mongoosePaginate);
const addressCollection = mongoose.model("adress", addressSchema);
module.exports = addressCollection;
