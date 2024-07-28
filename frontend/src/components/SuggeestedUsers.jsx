import { Box, Flex, Skeleton, SkeletonCircle, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import SuggestUsers from './SuggestUsers';
import useShowToast from '../hooks/useShowToast';

const SuggeestedUsers = () => {
  const [loading, setLoading] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const showToast = useShowToast();
  useEffect(() => {
    const getSuggestedUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/users/suggested');
        const data = await res.json();
        if (data.error) {
          showToast('error SuggestedUsers', data.error, 'error');
          return;
        }
        setSuggestedUsers(data);
      } catch (e) {
        showToast('API SuggestedUsers', 'Error ', 'error');
        return;
      } finally {
        setLoading(false);
      }
    };
    getSuggestedUsers();
  }, [showToast]);
  return (
    <>
      <Text mb={4} fontWeight={'bold'}>
        Suggested Users
      </Text>
      <Flex direction={'column'} gap={4}>
        {!loading && suggestedUsers.map(user => <SuggestUsers key={user._id} user={user} />)}
        {loading &&
          [...Array(5)].map((_, i) => {
            return (
              <Flex key={i} p={1} borderRadius={'md'} gap={2} alignItems={'center'}>
                <Box>
                  <SkeletonCircle size={10} />
                </Box>
                <Flex w={'full'} flexDir={'column'} gap={2}>
                  <Skeleton h={'8px'} w={'80px'} />
                  <Skeleton h={'8px'} w={'90px'} />
                </Flex>
                <Flex>
                  <Skeleton h={'20px'} w={'60px'} />
                </Flex>
              </Flex>
            );
          })}
      </Flex>
    </>
  );
};

export default SuggeestedUsers;

///loading skeleton for suggersted users, if you want to coppy and paste
//  <Flex key={i} p={1} borderRadius={'md'} gap={2} alignItems={'center'}>
//    <Box>
//      <SkeletonCircle size={10} />
//    </Box>
//    <Flex w={'full'} flexDir={'column'} gap={2}>
//      <Skeleton h={'8px'} w={'80px'} />
//      <Skeleton h={'8px'} w={'90px'} />
//    </Flex>
//    <Flex>
//      <Skeleton h={'20px'} w={'60px'} />
//    </Flex>
//  </Flex>;
