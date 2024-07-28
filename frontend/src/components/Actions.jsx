import {
  Box,
  Flex,
  Modal,
  ModalOverlay,
  Text,
  ModalContent,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  Input,
  Button,
  useDisclosure,
  ModalHeader
} from '@chakra-ui/react';
import { useState } from 'react';
import useShowToast from '../hooks/useShowToast';
import { useRecoilState, useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';
import postsAtom from '../atoms/postsAtom';

const Actions = ({ post }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const user = useRecoilValue(userAtom);
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [liked, setLiked] = useState(post?.likes.includes(user?._id));
  const [isliking, setLiking] = useState(false);
  const [isReplying, setReplying] = useState(false);
  const [reply, setReply] = useState('');
  const showToast = useShowToast();
  const handleLikeAndUnLike = async () => {
    if (!user) return showToast('Error', 'You must be logged in to like a post', 'error');
    if (isliking) return;
    setLiking(true);
    try {
      const res = await fetch('/api/posts/like/' + post._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.error) {
        showToast('Data Api Like', data.error, 'error');
      }
      if (!liked) {
        const updatePosts = posts.map(p => {
          if (p._id === post._id) {
            return { ...p, likes: [...p.likes, user._id] };
          }
          return p;
        });
        setPosts(updatePosts);
      } else {
        const updatePosts = posts.map(p => {
          if (p._id === post._id) {
            return { ...p, likes: p.likes.filter(id => id !== user._id) };
          }
          return p;
        });
        setPosts(updatePosts);
      }
      setLiked(!liked);
    } catch (error) {
      showToast('Like API ', error, 'error');
      return;
    } finally {
      setLiking(false);
    }
  };
  const handleReply = async () => {
    if (!user) return showToast('error', 'You must be logged in to reply to a post', 'error');
    if (isReplying) return;
    setReplying(true);
    try {
      const res = await fetch('/api/posts/reply/' + post._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: reply })
      });
      const data = await res.json();
      if (data.error) return showToast('error', data.error, 'error');
      const updatedPosts = posts.map(p => {
        if (p._id === post._id) {
          return { ...p, replies: [...p.replies, data] };
        }
        return p;
      });
      setPosts(updatedPosts);
      setReply('');
      onClose();
    } catch (e) {
      showToast('Reply API', e.message, 'error');
      return;
    } finally {
      setReplying(false);
    }
  };
  if (!post) return null;
  return (
    <Flex flexDirection={'column'}>
      <Flex gap={3} my={2} onClick={e => e.preventDefault()}>
        {' '}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill={liked ? 'rgb(237,73,86)' : ''}
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          color={liked ? 'rgb(237,73,86)' : ''}
          className="size-6"
          width={20}
          onClick={handleLikeAndUnLike}
        >
          <title>Likes</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          width={20}
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6"
          onClick={onOpen}
        >
          {' '}
          <title>Comment</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
          />
        </svg>
      </Flex>

      <Flex gap={2} alignItems={'center'}>
        <Text color={'gray.light'} fontSize={'sm'}>
          {post?.likes.length} likes
        </Text>
        <Box w={0.5} h={0.5} borderRadius={'full'} bg={'gray.light'}></Box>
        <Text color={'gray.light'} fontSize={'sm'}>
          {post?.replies.length} replies
        </Text>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Comment</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <Input
                placeholder="Reply goes here..."
                value={reply}
                onChange={e => setReply(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleReply}>
              Reply
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
export default Actions;

