const User = require("../models/userModel");
const Wallet = require("../models/walletModel");

exports.updateBalance = async (req, res) => {
  try {
    const userId = req.session.user._id; // Assuming you pass the userId
    const orderAmount = req.body.orderAmount; // Amount to be added to the wallet
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user's wallet balance
    const wallet = await Wallet.findOne({ userId });
    if (wallet) {
      wallet.balance += orderAmount;
      await wallet.save();
    } else {
      await Wallet.create({ userId, balance: orderAmount });
    }

    res.status(200).json({ message: "Wallet updated successfully" });
  } catch (error) {
    console.error("Error updating wallet:", error);
    res.status(500).json({ error: "An error occurred" });
  }
};
