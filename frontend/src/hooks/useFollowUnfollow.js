import { useState } from 'react';
import useShowToast from './useShowToast';
import { useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';

const useFollowUnfollow = user => {
  const currentUser = useRecoilValue(userAtom);
  const showtoast = useShowToast();
  const [following, setFollowing] = useState(user.followers.includes(currentUser?._id));
  const [updating, setUpdating] = useState(false);

  const handleFollowAndUnFollow = async () => {
    try {
      if (!currentUser) {
        showtoast('Error', 'Please Login to follow', 'error');
        return;
      }
      if (updating) return;
      setUpdating(true);
      try {
        const res = await fetch(`/api/users/follow/${user._id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        if (res.ok) {
          setFollowing(!following);
          if (following) {
            showtoast(`UnFollow ${user.name}`, 'Successfully', 'success');
            user.followers.pop();
          } else {
            showtoast(`Follow ${user.name}`, 'Successfully', 'success');
            user.followers.push(currentUser._id);
          }
        }
        if (data.error) {
          showtoast('Error', data.error, 'error');
          return;
        }
      } catch (error) {
        showtoast('erorr folowing', error, 'error');
      } finally {
        setUpdating(false);
      }
    } catch (e) {
      showtoast('follow error', e.message, 'error');
    }
  };
  return { handleFollowAndUnFollow, updating, following };
};

export default useFollowUnfollow;
