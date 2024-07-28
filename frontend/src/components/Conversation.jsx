import {
  Avatar,
  AvatarBadge,
  Flex,
  Image,
  Stack,
  Text,
  useColorModeValue,
  WrapItem
} from '@chakra-ui/react';
import { useRecoilState, useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';
import { BsCheck2All, BsFillImageFill } from 'react-icons/bs';
import { selectConversationAtom } from '../atoms/messagesAtom';

const Conversation = ({ conversation, isOnline }) => {
  const user = conversation.participants[0];

  const lastMessage = conversation.lastMessage;
  const currentUser = useRecoilValue(userAtom);
  const [selectedConversation, setSelectedConversation] = useRecoilState(selectConversationAtom);
  return (
    <Flex
      gap={4}
      alignItems={'center'}
      p={'1'}
      _hover={{
        cursor: 'pointer',
        bg: useColorModeValue('gray.light', 'gray.dark'),
        color: useColorModeValue('white', 'dark')
      }}
      bg={useColorModeValue(
        selectedConversation._id === conversation._id ? 'gray.light' : '',
        selectedConversation._id === conversation._id ? 'gray.dark' : ''
      )}
      onClick={() => {
        setSelectedConversation({
          _id: conversation._id,
          userId: user._id,
          username: user.username,
          userProfilePic: user.profilePic,
          mock: conversation.mock
        });
      }}
      borderRadius={'md'}
    >
      <WrapItem>
        <Avatar size={{ base: 'xs', sm: 'sm', md: 'md' }} src={user?.profilePic}>
          {isOnline ? <AvatarBadge boxSize={'1em'} bg={'green.500'} /> : ''}
        </Avatar>
      </WrapItem>
      <Stack direction={'column'} fontSize={'sm'}>
        <Text fontWeight={'700'} display={'flex'} alignItems={'center'}>
          {user?.username} <Image src="/checkicon.svg" w={4} h={4} ml={1} />
        </Text>
        <Text fontSize={'xs'} display={'flex'} alignItems={'center'} gap={2}>
          {currentUser._id === lastMessage.sender ? (
            <BsCheck2All size={16} color={lastMessage?.seen ? '#387df5' : ''} />
          ) : (
            <></>
          )}
          {lastMessage?.text?.length > 20
            ? lastMessage.text.substring(0, 20) + '...'
            : lastMessage.text || <BsFillImageFill size={15} />}
        </Text>
      </Stack>
    </Flex>
  );
};

export default Conversation;
