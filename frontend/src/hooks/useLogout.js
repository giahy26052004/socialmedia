import { useSetRecoilState } from 'recoil';
import userAtom from '../atoms/userAtom';
import useShowToast from './useShowToast';

const useLogout = () => {
  const setUser = useSetRecoilState(userAtom);
  const showToast = useShowToast();
  const logout = async () => {
    try {
      const res = await fetch('/api/users/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      console.log(data);
      if (data.error) {
        showToast('error', data.error, 'error');
        return;
      }
      localStorage.removeItem('user-socialmedia');
      setUser(null);
    } catch (err) {
      showToast('error', err.message, 'error');
    }
  };
  return logout;
};

export default useLogout;
