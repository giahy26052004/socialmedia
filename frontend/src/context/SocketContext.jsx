import { createContext, useContext, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { io } from 'socket.io-client';
import userAtom from '../atoms/userAtom';

const SocketContext = createContext();
export const useSocket = () => {
  return useContext(SocketContext);
};
export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const user = useRecoilValue(userAtom);
  useEffect(() => {
     if (!user?._id) {
       console.error('User ID is undefined');
       return;
     }
    const socket = io('http://localhost:5000', {
      query: {
        userId: user?._id
      }
    });
    socket.on('getOnlineUsers', users => {
      setOnlineUsers(users);
    });

    setSocket(socket);
    return () => socket && socket.close();
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>{children}</SocketContext.Provider>
  );
};
