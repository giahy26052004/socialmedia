import { Box, Flex, Spinner } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import Post from '../components/Post';
import useShowToast from '../hooks/useShowToast';
import { useRecoilState } from 'recoil';
import postsAtom from '../atoms/postsAtom';
import SuggeestedUsers from '../components/SuggeestedUsers';

const HomePage = () => {
  const showtoast = useShowToast();
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const getFeedPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/posts/feed');
        const data = await res.json();
        if (data.error) {
          showtoast('Feed API error', data.error, 'error');
          return;
        }
        setPosts(data);
      } catch (e) {
        showtoast('Feed API error', e, 'error');
      } finally {
        setLoading(false);
      }
    };
    getFeedPosts();
  }, [showtoast, setPosts]);
  return (
    <Flex gap={10} alignItems={'flex-start'}>
      <Box flex={70}>
        {!loading && posts.length === 0 && <h1>Follow some users to see the feed</h1>}
        {loading && (
          <Flex justify={'Center'}>
            <Spinner size={'xl'} />
          </Flex>
        )}
        {posts.map(post => (
          <Post key={post._id} post={post} />
        ))}
      </Box>
      <Box
        flex={30}
        display={{
          base: 'none',
          md: 'block'
        }}
      >
        <SuggeestedUsers />{' '}
      </Box>
    </Flex>
  );
};

export default HomePage;
