import { atom } from 'recoil';
export const conversationAtom = atom({
  key: 'conversationAtom',
  default: []
});
export const selectConversationAtom = atom({
  key: 'selectConversationAtom',
  default: {
    _id: '',
    userId: '',
    username: '',
    userProfilePic: ''
  }
});
