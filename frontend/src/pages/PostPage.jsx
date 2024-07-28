import { Avatar, Box, Button, Divider, Flex, Image, Spinner, Text } from '@chakra-ui/react';
import Actions from '../components/Actions';
import Comment from '../components/Comment';
import useGetUserProfile from '../hooks/useGetUserProfile';
import { useEffect } from 'react';
import useShowToast from '../hooks/useShowToast';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { DeleteIcon } from '@chakra-ui/icons';
import { useRecoilState, useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';
import postsAtom from '../atoms/postsAtom';

const PostPage = () => {
  const currentUser = useRecoilValue(userAtom);
  const { user, loading } = useGetUserProfile();
  const [posts, setPosts] = useRecoilState(postsAtom);
  const showtoast = useShowToast();
  const navigate = useNavigate();
  const { pid } = useParams();
  const currentPost = posts[0];
  console.log(posts);
  useEffect(() => {
    const getPost = async () => {
      setPosts([]); // reset posts array on new post request to avoid duplicate posts
      try {
        const res = await fetch(`/api/posts/${pid}`);
        const data = await res.json();
        if (data.error) {
          showtoast('API PostPage', data.error, 'error');
          return;
        }
        setPosts([data]);
      } catch (err) {
        showtoast('API PostPage', err, 'error');
      }
    };
    getPost();
  }, [pid, showtoast, setPosts]);
  const handleDeletePost = async e => {
    e.preventDefault();
    try {
      console.log(currentPost._id);
      if (!window.confirm('Are you sure you want to delete post?')) return;
      const res = await fetch('/api/posts/' + currentPost._id, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.error) {
        showtoast('error', data.error, 'error');
        return;
      }
      showtoast('delete post', 'success', 'success');
      navigate('/' + user.username);
    } catch (error) {
      showtoast('Delete Post API error', error.message, 'error');
    }
  };
  if (!user && loading)
    return (
      <Flex justifyContent={'center'}>
        <Spinner size={'xl'} />
      </Flex>
    );

  if (!currentPost) return null;
  return (
    <>
      <Flex>
        <Flex w={'full'} alignItems={'center'} gap={3}>
          <Avatar src={user.profilePic} name="hycon" size={'md'} />
          <Flex>
            <Text fontSize={'sm'} fontWeight={'bold'}>
              {user.username}
            </Text>
            <Image src="/checkicon.svg" w={4} h={4} ml={4} />
          </Flex>
        </Flex>
        <Flex gap={4} alignItems={'center'}>
          <Text fontSize={'xs'} w={36} textAlign={'right'} color={'gray.light'}>
            {formatDistanceToNow(new Date(currentPost?.createdAt))} ago
          </Text>
          {currentUser?._id === user._id && (
            <DeleteIcon cursor={'pointer'} size={20} onClick={handleDeletePost} />
          )}
        </Flex>
      </Flex>
      <Text my={3}>{currentPost?.text}</Text>
      {currentPost.img && (
        <Box borderRadius={6} overflow={'hidden'} border={'1px solid'} borderColor={'gray.light'}>
          <Image src={currentPost.img} w={'full'} />
        </Box>
      )}
      <Flex gap={3} my={3}>
        <Actions post={currentPost} />
      </Flex>
      <Divider my={4} />
      <Flex justifyContent={'space-between'}>
        <Flex gap={2} alignItems={'center'}>
          <Text fontSize={'2xl'}>🖐</Text>
          <Text color={'gray.light'}> Get the app to like ,reply and post</Text>
        </Flex>
        <Button>Get</Button>
      </Flex>
      <Divider my={4} />
      {currentPost?.replies.map((reply, index) => (
        <Comment
          key={index}
          reply={reply}
          lastReplies={reply._id === currentPost.replies[currentPost.replies.length - 1]._id}
        />
      ))}
    </>
  );
};

export default PostPage;
