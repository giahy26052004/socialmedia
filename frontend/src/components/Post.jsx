import { Avatar, Box, Flex, Image, Text } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import Actions from './Actions';
import { useEffect, useState } from 'react';
import useShowToast from '../hooks/useShowToast';
import { formatDistanceToNow } from 'date-fns';
import { DeleteIcon } from '@chakra-ui/icons';
import { useRecoilState, useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';
import postsAtom from '../atoms/postsAtom';
const Post = ({ post }) => {
  const [user, setUser] = useState(null);
  const currentUser = useRecoilValue(userAtom);
  const [posts, setPosts] = useRecoilState(postsAtom);
  const showtoast = useShowToast();
  const navigate = useNavigate();
  useEffect(() => {
    const getUSer = async () => {
      try {

        const res = await fetch(`/api/users/profile/` + post.postedBy);
        const data = await res.json();
        if (data.error) {
          showtoast('error UserPage', data.error, 'error');
          return;
        }
        setUser(data);
      } catch (error) {
        showtoast('getUser API ', 'Error ', 'error');
        setUser(null);
      }
    };
    getUSer();
  }, [post.postedBy, showtoast, setPosts]);
  const handleDeletePost = async e => {
    e.preventDefault();
    try {
      console.log(post._id);
      if (!window.confirm('Are you sure you want to delete post?')) return;
      const res = await fetch('api/posts/' + post._id, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.error) {
        showtoast('error', data.error, 'error');
        return;
      }
      showtoast('delete post', 'success', 'success');

      setPosts(
        posts.filter(p => {
          return p._id !== post._id;
        })
      );
    } catch (error) {
      showtoast('Delete Post API error', error.message, 'error');
    }
  };
  if (!post) return null;
  if (!user) return null;
  return (
    <Link to={`/${user.username}/post/${post._id}`}>
      <Flex gap={3} mb={4} py={5}>
        <Flex flexDirection={'column'} alignItems={'center'}>
          <Avatar
            size="md"
            name="huycon"
            src={user?.profilePic}
            onClick={e => {
              e.preventDefault();
              navigate(`/${user.username}`);
            }}
          />
          <Box w={'1px'} h={'full'} bg={'gray.light'} my={2}></Box>
          {/* line */}
          <Box position={'relative'} w={'full'}>
            {post.replies.length === 0 && <Text textAlign={'center'}>😲</Text>}
            {post.replies[0] && (
              <Avatar
                size={'xs'}
                name="John doe"
                position={'absolute'}
                src={post.replies[0].userProfilePic}
                top={'0px'}
                left={'15px'}
                padding={'2px'}
              />
            )}

            {post.replies[1] && (
              <Avatar
                size={'xs'}
                name="John doe"
                position={'absolute'}
                src={post.replies[1].userProfilePic}
                bottom={'0px'}
                right={'-5px'}
                padding={'2px'}
              />
            )}
            {post.replies[2] && (
              <Avatar
                size={'xs'}
                name="John doe"
                position={'absolute'}
                src={post.replies[2].userProfilePic}
                bottom={'0px'}
                left={'5px'}
                padding={'2px'}
              />
            )}
          </Box>
        </Flex>
        <Flex flex={1} flexDirection={'column'} gap={2}>
          <Flex justifyContent={'space-between'} w={'full'}>
            <Flex w={'full'} alignItems={'center'}>
              <Text
                fontSize={'sm'}
                fontWeight={'bold'}
                onClick={e => {
                  e.preventDefault();
                  navigate(`/${user.username}`);
                }}
              >
                {user?.username}
              </Text>
              <Image src="/checkicon.svg" alt="hi" w={4} h={4} ml={1} />
            </Flex>
            <Flex gap={4} alignItems={'center'}>
              <Text fontSize={'xs'} w={36} textAlign={'right'} color={'gray.light'}>
                {formatDistanceToNow(new Date(post.createdAt))} ago
              </Text>
              {currentUser?._id === user._id && <DeleteIcon size={20} onClick={handleDeletePost} />}
            </Flex>
          </Flex>
          <Text fontSize={'sm'}>{post.text}</Text>
          {post.img && (
            <Box
              borderRadius={6}
              overflow={'hidden'}
              border={'1px solid'}
              borderColor={'gray.light'}
            >
              <Image src={post.img} w={'full'} />
            </Box>
          )}

          <Flex gap={3} my={1}>
            <Actions post={post} />
          </Flex>
        </Flex>
      </Flex>
    </Link>
  );
};

export default Post;
