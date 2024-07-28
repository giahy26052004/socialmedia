import {
  Avatar,
  Box,
  Button,
  Flex,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';
import { BsInstagram } from 'react-icons/bs';
import { CgMoreO } from 'react-icons/cg';
import { useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';

import useFollowUnfollow from '../hooks/useFollowUnfollow';

const UserHeader = ({ user }) => {
  const toast = useToast();
  const currentUser = useRecoilValue(userAtom);

  const { handleFollowAndUnFollow, updating, following } = useFollowUnfollow(user);
  const coppyURL = () => {
    const currentURL = window.location.href;
    navigator.clipboard.writeText(currentURL).then(() => {
      toast({ description: 'Copied', duration: 2000 });
    });
  };
  if (!user) return;
  if (!currentUser) return;
  return (
    <VStack gap={4} alignItems={'start'}>
      <Flex justifyContent={'space-between'} w={'full'}>
        <Box>
          <Text fontSize={'2xl'}>{user.name}</Text>
          <Flex alignItems={'center'} gap={2}>
            <Text fontSize={'sm'}>{user.username}</Text>
            <Text fontSize={'xs'} bg={'gray.dark'} color={'gray.light'} borderRadius={'full'}>
              {user.name}.com
            </Text>
          </Flex>
        </Box>
        <Box>
          {user.profilePic && (
            <Avatar name={user.name} src={user.profilePic} size={{ base: 'md', md: 'xl' }}></Avatar>
          )}
          {!user.profilePic && (
            <Avatar
              name={user.name}
              src={'https://bit.ly/broken-link'}
              size={{ base: 'md', md: 'xl' }}
            ></Avatar>
          )}
        </Box>
      </Flex>
      <Text>{user.bio}</Text>
      {currentUser?._id === user?._id && (
        <Link href="/update">
          <Button size={'sm'}>Update Profile</Button>
        </Link>
      )}
      {currentUser?._id !== user._id && (
        <Button onClick={handleFollowAndUnFollow} size={'sm'} isLoading={updating}>
          {following ? 'UnFollow' : 'Follow'}
        </Button>
      )}
      <Flex w={'full'} justifyContent={'space-between'}>
        <Flex gap={2} alignItems={'center'}>
          <Text color={'gray.light'}>{user.followers.length} followers</Text>
          <Box w="1" h={1} bg={'gray.light'} borderRadius={'full'}></Box>
          <Link color={'gray.light'}>instagram.com</Link>
        </Flex>
        <Flex>
          <Box className="icon-container">
            <BsInstagram size={24} cursor={'pointer'} />
          </Box>
          <Box className="icon-container">
            <Menu>
              <MenuButton>
                <CgMoreO size={24} cursor={'pointer'} />
              </MenuButton>
              <Portal>
                <MenuList bg={'gray.dark'}>
                  <MenuItem bg={'gray.dark'} onClick={coppyURL}>
                    Coppy Link{' '}
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </Box>
        </Flex>
      </Flex>
      <Flex w={'full'}>
        <Flex
          flex={1}
          borderBottom={'1.5px solid white'}
          justifyContent={'center'}
          padding={3}
          cursor={'pointer'}
        >
          <Text fontWeight={'bold'}>Threads</Text>
        </Flex>
        <Flex
          flex={1}
          borderBottom={'1px solid gray'}
          justifyContent={'center'}
          padding={3}
          color={'gray.light'}
          cursor={'pointer'}
        >
          <Text fontWeight={'bold'}>Replies</Text>
        </Flex>
      </Flex>
    </VStack>
  );
};

export default UserHeader;
