import { useRecoilValue } from 'recoil';
import LoginCard from '../components/LoginCard';
import authScreenAtom from '../atoms/authAtom';
import SignupCard from '../components/SignupCard';

const AuthPage = () => {
  const authScreenState = useRecoilValue(authScreenAtom);
  console.log(authScreenState);
  return <div>{authScreenState === 'login' ? <LoginCard /> : <SignupCard />}</div>;
};

export default AuthPage;
