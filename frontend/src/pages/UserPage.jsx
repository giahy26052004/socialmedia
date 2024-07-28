import { useEffect, useState } from 'react';
import UserHeader from '../components/UserHeader';
import { useParams } from 'react-router-dom';

import { Flex, Spinner } from '@chakra-ui/react';
import Post from '../components/Post';
import useShowToast from '../hooks/useShowToast';
import useGetUserProfile from '../hooks/useGetUserProfile';
import { useRecoilState } from 'recoil';
import postsAtom from '../atoms/postsAtom';

const UserPage = () => {
  const { user, loading } = useGetUserProfile();
  const { username } = useParams();
  const showToast = useShowToast();
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [fetchingPost, setFetchingPost] = useState(false);

  useEffect(() => {
    const getPosts = async () => {
      if (!user) return;
      setFetchingPost(true);
      try {
        const res = await fetch(`/api/posts/user/${username}`);
        const data = await res.json();
        if (data.error) {
          showToast('error UserPost', data.error, 'error');
          return;
        }
        setPosts(data);
      } catch (error) {
        showToast('error getUserPost Api ', error, 'error');
      } finally {
        setFetchingPost(false);
      }
    };
    getPosts();
  }, [username, showToast, setPosts, user]);
  if (!user && loading) {
    return (
      <Flex justifyContent={'center'}>
        <Spinner size={'xl'} />
      </Flex>
    );
  }

  if (!user) return <h1>User not found</h1>;
  return (
    <>
      <UserHeader user={user} />
      {!fetchingPost && posts.length === 0 && <h1>User has not posts</h1>}
      {fetchingPost && (
        <Flex justifyContent={'center'} my={12}>
          <Spinner size={'xl'} />
        </Flex>
      )}
      {posts.map(post => (
        <Post key={post._id} post={post} />
      ))}
    </>
  );
};

export default UserPage;
