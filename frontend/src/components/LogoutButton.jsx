import { Button } from '@chakra-ui/react';
import { useSetRecoilState } from 'recoil';
import userAtom from '../atoms/userAtom';
import { IoLogOutOutline } from 'react-icons/io5';
import useShowToast from '../hooks/useShowToast';

const LogoutButton = () => {
  const setUser = useSetRecoilState(userAtom);
  const showToast = useShowToast();
  const handleLogout = async () => {
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
      console.log(err);
    }
  };
  return (
    <Button position={'fixed'} top={'30px'} right={'30px'} size={'sm'} onClick={handleLogout}>
      <IoLogOutOutline size={20} />
    </Button>
  );
};

export default LogoutButton;
