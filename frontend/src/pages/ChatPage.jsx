import { SearchIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  Input,
  Skeleton,
  SkeletonCircle,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import Conversation from '../components/Conversation';
import { GiConversation } from 'react-icons/gi';
import MessageContainer from '../components/MessageContainer';
import { useEffect, useState } from 'react';
import useShowToast from '../hooks/useShowToast';
import { useRecoilState, useRecoilValue } from 'recoil';
import { conversationAtom, selectConversationAtom } from '../atoms/messagesAtom';
import userAtom from '../atoms/userAtom';
import { useSocket } from '../context/SocketContext';

const ChatPage = () => {
  const showtoast = useShowToast();
  const [loadingConversation, setLoadingConversation] = useState(true);
  const [conversations, setConversations] = useRecoilState(conversationAtom);
  const [selectedConversation, setSelectedConversation] = useRecoilState(selectConversationAtom);
  const [searchText, setSearchText] = useState('');
  const [searchingUsers, setSearchingUsers] = useState(false);
  const currentUser = useRecoilValue(userAtom);
  const { socket, onlineUsers } = useSocket();

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.on('connect', () => {
      console.log('Socket connected');
    });
    socket.on('messageSeen', ({ conversationId }) => {
      setConversations(prev => {
        const updatedConversations = prev.map(conversation => {
          if (conversation._id === conversationId) {
            return {
              ...conversation,
              lastMessage: {
                ...conversation.lastMessage,
                seen: true
              }
            };
          }
          return conversation;
        });
        return updatedConversations;
      });
    });
  }, [socket, setConversations]);
  useEffect(() => {
    const getConversation = async () => {
      try {
        const res = await fetch('/api/messages/conversations');
        const data = await res.json();
        if (res.ok) {
          setConversations(data);
        } else {
          showtoast('error', data.message, 'error');
        }
      } catch (error) {
        showtoast('error', error.message, 'error');
      } finally {
        setLoadingConversation(false);
      }
    };
    getConversation();
  }, [showtoast, setConversations]);
  const handleConversationSearch = async e => {
    e.preventDefault();
    setSearchingUsers(true);
    try {
      const res = await fetch(`/api/users/profile/${searchText}`);
      const searchUser = await res.json();
      if (searchUser.error) {
        showtoast('error', searchUser.error, 'error');
        return;
      }

      /// if user is trying to message themseleves
      const messageingYourSelf = searchUser._id === currentUser._id;

      if (messageingYourSelf) {
        showtoast('error', 'You can not message yourself', 'error');
        setSearchText('');
        return;
      }
      // if user already in a conversation with the searchs user
      const conversationAlreadyExists = conversations.find(
        convers => convers.participants[0]._id === searchUser._id
      );
      if (conversationAlreadyExists) {
        setSelectedConversation({
          _id: conversationAlreadyExists._id,
          userId: searchUser._id,
          username: searchUser.username,
          userProfilePic: searchUser.profilePic
        });
        return;
      }
      const mockConversation = {
        mock: true,
        lastMessage: {
          text: '',
          sender: ''
        },
        _id: Date.now(),
        participants: [
          {
            _id: searchUser._id,
            username: searchUser.username,
            profilePic: searchUser.profilePic
          }
        ]
      };

      setConversations(preConversation => [...preConversation, mockConversation]);
    } catch (error) {
      showtoast('Searching ', error.message, 'error');
    } finally {
      setSearchingUsers(false);
    }
  };
  return (
    <Box
      position={'absolute'}
      w={{ base: '100%', md: '80%', lg: '750px' }}
      left={'50%'}
      p={4}
      transform={'translateX(-50%)'}
    >
      <Flex
        gap={4}
        flexDirection={{ base: 'column', md: 'row' }}
        maxW={{ sm: '400px', md: 'full' }}
        mx={'auto'}
      >
        <Flex
          flex={30}
          flexDirection={'column'}
          gap={2}
          maxW={{ sm: '250px', md: 'full' }}
          mx={'auto'}
        >
          <Text fontWeight={700} color={useColorModeValue('gray.600', 'gray.400')}>
            Your Conversations
          </Text>
          <form onSubmit={handleConversationSearch}>
            <Flex alignItems={'center'} gap={2}>
              <Input
                placeholder="Search for a user"
                value={searchText}
                onChange={e => {
                  setSearchText(e.target.value);
                }}
              />
              <Button size={'sm'} isLoading={searchingUsers} onClick={handleConversationSearch}>
                <SearchIcon />
              </Button>
            </Flex>
          </form>

          {loadingConversation &&
            [0, 1, 2, 3, 4].map((_, i) => (
              <Flex key={i} gap={4} alignItems={'center'} p={1} borderRadius={'md'}>
                <Box>
                  <SkeletonCircle size={10} />
                </Box>
                <Flex gap={3} w={'full'} flexDirection={'column'}>
                  <Skeleton h={'10px'} w={'80px'} />
                  <Skeleton h={'8px'} w={'90%'} />
                </Flex>
              </Flex>
            ))}
          {!loadingConversation &&
            conversations.map(conversation => (
              <Conversation
                key={conversation._id}
                isOnline={onlineUsers.includes(conversation.participants[0]._id)}
                conversation={conversation}
              />
            ))}
        </Flex>
        {!selectedConversation._id && (
          <Flex
            flex={70}
            alignItems={'center'}
            justifyContent={'center'}
            p={2}
            borderRadius={'md'}
            height={'400px'}
          >
            <GiConversation size={100} />
            <Text fontSize={20}>Select a conversation to start messaging</Text>
          </Flex>
        )}
        {selectedConversation._id && <MessageContainer />}
      </Flex>
    </Box>
  );
};

export default ChatPage;
