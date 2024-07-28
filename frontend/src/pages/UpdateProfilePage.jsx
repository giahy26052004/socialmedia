'use client';

import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  Avatar,
  Center
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import userAtom from '../atoms/userAtom';
import usePreviewImgs from '../hooks/usePreviewImgs';
import useShowToast from '../hooks/useShowToast';
import { useNavigate } from 'react-router-dom';

export default function UpdateProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useRecoilState(userAtom);
  const showToast = useShowToast();
  const [inputs, setInputs] = useState({
    username: user.username,
    name: user.name,
    email: user.email,
    bio: user.bio,
    password: ''
  });
  const [updating, setUpdating] = useState(false);
  const fileRef = useRef(null);
  const { handleImageChange, imgUrl } = usePreviewImgs();
  const handleSubmit = async e => {
    e.preventDefault();
    if (updating) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/users/update/${user._id}`, {
        method: 'PUT', // Sử dụng phương thức PUT để cập nhật dữ liệu
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...inputs, profilePic: imgUrl })
      });

      if (!res.ok) {
        showToast('Error', 'response API err', 'error');
      }
      const data = await res.json();
      if (data.error) {
        showToast('Error', data.error, 'error');
        return;
      }

      localStorage.setItem('user-socialmedia', JSON.stringify(data.user));
      setUser(data.user);
      showToast('Edit', 'Success', 'success');
    } catch (error) {
      showToast('Error updating profile', error.message, 'error');
    } finally {
      setUpdating(false);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <Flex align={'center'} justify={'center'}>
        <Stack
          spacing={4}
          w={'full'}
          maxW={'md'}
          bg={useColorModeValue('white', 'gray.dark')}
          rounded={'xl'}
          boxShadow={'lg'}
          p={6}
        >
          <Heading lineHeight={1.1} fontSize={{ base: '2xl', sm: '3xl' }}>
            User Profile Edit
          </Heading>
          <FormControl id="userName">
            <Stack direction={['column', 'row']} spacing={6}>
              <Center>
                <Avatar size="xl" boxShadow={'md'} src={imgUrl || user.profilePic} />
              </Center>
              <Center w="full">
                <Button w="full" onClick={() => fileRef.current.click()}>
                  Change Avatar
                </Button>
                <Input
                  type="file"
                  hidden
                  ref={fileRef}
                  onChange={e => {
                    handleImageChange(e);
                  }}
                />
              </Center>
            </Stack>
          </FormControl>{' '}
          <FormControl isRequired>
            <FormLabel>Full name</FormLabel>
            <Input
              placeholder="UserName"
              value={inputs.name}
              onChange={e => setInputs({ ...inputs, name: e.target.value })}
              _placeholder={{ color: 'gray.500' }}
              type="text"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>User name</FormLabel>
            <Input
              placeholder="UserName"
              value={inputs.username}
              onChange={e => setInputs({ ...inputs, username: e.target.value })}
              _placeholder={{ color: 'gray.500' }}
              type="text"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Email address</FormLabel>
            <Input
              placeholder="your-email@example.com"
              _placeholder={{ color: 'gray.500' }}
              type="email"
              value={inputs.email}
              onChange={e => setInputs({ ...inputs, email: e.target.value })}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Bio</FormLabel>
            <Input
              value={inputs.bio}
              onChange={e => setInputs({ ...inputs, bio: e.target.value })}
              placeholder="your bio ."
              _placeholder={{ color: 'gray.500' }}
              type="text"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              placeholder="password"
              _placeholder={{ color: 'gray.500' }}
              type="password"
              value={inputs.password}
              onChange={e => setInputs({ ...inputs, password: e.target.value })}
            />
          </FormControl>
          <Stack spacing={6} direction={['column', 'row']}>
            <Button
              bg={'red.400'}
              color={'white'}
              w="full"
              _hover={{
                bg: 'red.500'
              }}
              onClick={() => navigate(`/${user.username}`)}
            >
              Cancel
            </Button>
            <Button
              isLoading={updating}
              bg={'green.400'}
              color={'white'}
              w="full"
              type="submit"
              _hover={{
                bg: 'green.500'
              }}
            >
              Submit
            </Button>
          </Stack>
        </Stack>
      </Flex>
    </form>
  );
}
