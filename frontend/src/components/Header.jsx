import { Button, Flex, Image, useColorMode } from '@chakra-ui/react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import userAtom from '../atoms/userAtom';
import { CgHome, CgUser } from 'react-icons/cg';
import { Link } from 'react-router-dom';
import { IoLogOutOutline } from 'react-icons/io5';
import useLogout from '../hooks/useLogout';
import authScreenAtom from '../atoms/authAtom';
import { BsFillChatQuoteFill } from 'react-icons/bs';
import { SettingsIcon } from '@chakra-ui/icons';

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useRecoilValue(userAtom);
  const handleLogout = useLogout();
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  return (
    <Flex justifyContent={'space-between'} mt={6} mb={12}>
      {user && (
        <Link to="/">
          <CgHome size={20} />
        </Link>
      )}
      {!user && (
        <Link to={'/auth'} onClick={() => setAuthScreen('login')}>
          Login
        </Link>
      )}
      <Image
        cursor={'pointer'}
        alt="logo"
        w={6}
        src={colorMode === 'dark' ? '/light-logo.svg' : '/dark-logo.svg'}
        onClick={toggleColorMode}
      />
      {user && (
        <Flex alignItems={'center'} gap={4}>
          <Link to={`/${user.username}`}>
            <CgUser size={20} />
          </Link>
          <Link to={`/chat`}>
            <BsFillChatQuoteFill size={20} />
          </Link>
          <Link to={`/settings`}>
            <SettingsIcon size={20} />
          </Link>
          <Button size={'xs'}>
            <IoLogOutOutline size={20} onClick={handleLogout} />
          </Button>
        </Flex>
      )}
      {!user && (
        <Link to={'/auth'} onClick={() => setAuthScreen('signup')}>
          Sign Up
        </Link>
      )}
    </Flex>
  );
};

export default Header;
