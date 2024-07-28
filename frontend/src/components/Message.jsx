import { Avatar, Box, Flex, Image, Skeleton, Text } from '@chakra-ui/react';
import { useRecoilValue } from 'recoil';
import { selectConversationAtom } from '../atoms/messagesAtom';
import userAtom from '../atoms/userAtom';
import { BsCheck2All } from 'react-icons/bs';
import { useState } from 'react';

const Message = ({ ownMessage, message }) => {
  const selectedConversation = useRecoilValue(selectConversationAtom);
  const user = useRecoilValue(userAtom);
  const [imgLoaded, setImgLoaded] = useState(false);
  console.log(imgLoaded);
  return (
    <>
      {ownMessage ? (
        <Flex gap={2} alignSelf={'flex-end'}>
          {message.text && (
            <Flex bg={'green.800'} maxW={'350px'} p={1} borderRadius={'md'}>
              <Text maxW={'350px'} p={1} borderRadius={'md'}>
                {message.text}
              </Text>
              <Box
                alignSelf={'flex-end'}
                ml={1}
                color={message.seen ? '#387df5' : ''}
                fontWeight={'bold'}
              >
                <BsCheck2All size={16} />
              </Box>
            </Flex>
          )}

          {message.img && !imgLoaded && (
            <Flex mt={5} w={'200px'}>
              <Image
                src={message.img}
                hidden
                onLoad={() => setImgLoaded(true)}
                alt="Message Image"
                borderRadius={4}
              />
              {!imgLoaded && <Skeleton w={'200px'} h={'200px'} />}
            </Flex>
          )}
          {message.img && imgLoaded && (
            <Flex mt={5} w={'200px'}>
              <Image src={message.img} alt="Message Image" borderRadius={4} />
              <Box
                alignSelf={'flex-end'}
                ml={1}
                color={message.seen ? '#387df5' : ''}
                fontWeight={'bold'}
              >
                <BsCheck2All size={16} />
              </Box>{' '}
            </Flex>
          )}
          <Avatar src={user.profilePic} w={7} h={7} />
        </Flex>
      ) : (
        <Flex gap={2}>
          <Avatar src={selectedConversation.userProfilePic} w={7} h={7} />
          {message.text && (
            <Text maxW={'350px'} bg={'gray.500'} p={1} borderRadius={'md'}>
              {message.text}
            </Text>
          )}
          {message.img && !imgLoaded && (
            <Flex mt={5} w={'200px'}>
              <Image
                src={message.img}
                hidden
                onLoad={() => setImgLoaded(true)}
                alt="Message Image"
                borderRadius={4}
              />
              {!imgLoaded && <Skeleton w={'200px'} h={'200px'} />}
            </Flex>
          )}
          {message.img && imgLoaded && (
            <Flex mt={5} w={'200px'}>
              <Image src={message.img} alt="Message Image" borderRadius={4} />
            </Flex>
          )}
        </Flex>
      )}
    </>
  );
};

export default Message;
