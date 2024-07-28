import {
  Avatar,
  Divider,
  Flex,
  Image,
  Skeleton,
  SkeletonCircle,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import Message from './Message';
import MessageInput from './MessageInput';
import { useEffect, useRef, useState } from 'react';
import useShowToast from '../hooks/useShowToast';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { conversationAtom, selectConversationAtom } from '../atoms/messagesAtom';
import userAtom from '../atoms/userAtom';
import { useSocket } from '../context/SocketContext';
import messageSound from '../assets/sounds/message.mp3';

const MessageContainer = () => {
  const showtoast = useShowToast();
  const selectedConversation = useRecoilValue(selectConversationAtom);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messages, setMessages] = useState([]);
  const currentUser = useRecoilValue(userAtom);
  const endOfMessagesRef = useRef(null);
  const { socket } = useSocket();
  const setConversation = useSetRecoilState(conversationAtom);
  //setMessages socket newMessage to server
  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.on('newMessage', message => {
      if (selectedConversation._id === message.conversationId) {
        setMessages(preMess => [...preMess, message]);
      }
      if (!document.hasFocus()) {
        const sound = new Audio(messageSound);
        sound.play();
      }
      setConversation(preConversation => {
        const updateConversations = preConversation.map(conversation => {
          if (conversation._id === selectedConversation._id) {
            return {
              ...conversation,
              lastMessage: {
                text: message.text,
                sender: message.sender,
                seen: false
              }
            };
          }
          return conversation;
        });
        return updateConversations;
      });
    });
    return () => socket.off('newMessage');
  }, [socket, selectedConversation._id, setConversation]);
  //seen socket
  useEffect(() => {
    const lastMessageIsFromOtherUser =
      messages?.length && messages[messages.length - 1].sender !== currentUser._id;
    if (lastMessageIsFromOtherUser) {
      socket.emit('markMessageAsSeen', {
        conversationId: selectedConversation._id,
        userId: selectedConversation.userId
      });
    }
    socket.on('messageSeen', ({ conversationId }) => {
      if (conversationId === selectedConversation._id) {
        setMessages(preMessages => {
          const updateMessages = preMessages.map(message => {
            if (!message.seen) {
              return { ...message, seen: true };
            }
            return message;
          });
          return updateMessages;
        });
      }
    });
  }, [currentUser._id, socket, messages, selectedConversation.userId, selectedConversation._id]);
  useEffect(() => {
    const getMessage = async () => {
      setLoadingMessages(true);
      setMessages([]);
      try {
        if (selectedConversation.mock) return;
        const res = await fetch('/api/messages/' + selectedConversation.userId);
        const messages = await res.json();
        if (messages.error) {
          showtoast('API get message', messages.error, 'error');
          return;
        }
        setMessages(messages); // update messages state
      } catch (error) {
        showtoast('API get message', error.message, 'error');
        return;
      } finally {
        setLoadingMessages(false);
      }
    };
    getMessage();
  }, [selectedConversation, showtoast, selectedConversation.userId, selectedConversation.mock]);

  //scrollIntoViewEnd
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  return (
    <Flex
      flex={70}
      bg={useColorModeValue('gray.200', 'gray.dark')}
      borderRadius={'md'}
      flexDirection={'column'}
    >
      {/* message header */}
      <Flex gap={2} w={'full'} h={12} alignItems={'center'}>
        <Avatar src={selectedConversation.userProfilePic} size={'sm'} />
        <Text display={'flex'} alignItems={'center'}>
          {selectedConversation.username} <Image src="/checkicon.svg" w={4} h={4} ml={1} />
        </Text>
      </Flex>
      <Divider />
      <Flex height={'400px'} overflowY={'auto'} flexDir={'column'} gap={4} my={4} px={2}>
        {loadingMessages &&
          [...Array(5)].map((_, i) => {
            return (
              <Flex
                key={i}
                p={1}
                borderRadius={'md'}
                alignSelf={i % 2 === 0 ? 'flex-start' : 'flex-end'}
                gap={2}
                alignItems={'center'}
              >
                {i % 2 === 0 && <SkeletonCircle size={7} />}
                <Flex flexDir={'column'} gap={2}>
                  <Skeleton h={'8px'} w={'250px'} />
                  <Skeleton h={'8px'} w={'250px'} />
                  <Skeleton h={'8px'} w={'250px'} />
                </Flex>
                {i % 2 !== 0 && <SkeletonCircle size={7} />}
              </Flex>
            );
          })}
        {!loadingMessages &&
          messages.map(message => (
            <Message
              key={message._id}
              message={message}
              ownMessage={currentUser._id === message.sender}
            />
          ))}
        <div ref={endOfMessagesRef} />
      </Flex>
      <MessageInput setMessages={setMessages} />
    </Flex>
  );
};

export default MessageContainer;
