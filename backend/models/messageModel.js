import mongoose from "mongoose";
const messageSchema = mongoose.Schema(
  {
    conversationId: { type: mongoose.Types.ObjectId, ref: "Conversation" },
    sender: { type: mongoose.Types.ObjectId, ref: "User" },
    text: { type: String },
    seen: { type: Boolean, default: false },
    img: {
      type: String,
      default: "",
    },
  },

  { timestamps: true }
);
const Message = mongoose.model("Message", messageSchema);
export default Message;
