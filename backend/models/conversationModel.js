import mongoose from "mongoose";
const ConversationSchema = mongoose.Schema(
  {
    participants: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    lastMessage: {
      text: String,
      sender: { type: mongoose.Types.ObjectId, ref: "User" },
      seen: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);
const Conversation = mongoose.model("Conversation", ConversationSchema);
export default Conversation;
