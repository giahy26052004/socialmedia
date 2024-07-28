import { Button, Text } from '@chakra-ui/react';
import useShowToast from '../hooks/useShowToast';
import useLogout from '../hooks/useLogout';

const SettingsPage = () => {
  const showtoast = useShowToast();
  const logout = useLogout();
  const freezeAccount = async () => {
    if (!window.confirm('Are you sure you want to freeze your account?')) return;
    try {
      const res = await fetch('/api/users/freeze', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.error) {
        return showtoast('error', data.error, 'error');
      }
      if (data.success) {
        logout();
        showtoast('success', 'Your Account has been frozen', 'success');
      }
    } catch (error) {
      showtoast('error', error.message, 'error');
    }
  };
  return (
    <>
      <Text>Freeze Your Account</Text>
      <Text>You can unfreeze your account anytime by logging in</Text>
      <Button size={'sm'} colorScheme="red" onClick={freezeAccount}>
        Freeze
      </Button>
    </>
  );
};

export default SettingsPage;
