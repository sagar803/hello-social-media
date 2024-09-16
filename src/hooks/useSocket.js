import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { setNotifications } from "state";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const user = useSelector((state) => state.user);
  const socketRef = useRef(null);
  const dispatch = useDispatch();
  const [connected, setConnected] = useState(false);
  const [connectedFriendId, setConnectedFriendId] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user._id) {
      const socket = io(`${process.env.REACT_APP_API}`);

      socket.emit("userOnline", user._id);

      socket.on("connect", () => {
        socketRef.current = socket;
        setConnected(true);
      });

      socket.on("onlineUsers", (data) => {
        setOnlineUsers(data);
      });

      socket.on("disconnect", () => {
        setConnected(false);
      });

      socket.on("connect_error", (err) => {
        setError(err.message);
      });

      socket.on("receivePrivateMessage", handleRecieveMsg);

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, [user, connectedFriendId]);

  const handleRecieveMsg = useCallback(
    (msg) => {
      if (msg.senderId !== connectedFriendId) {
        dispatch(setNotifications({ notifications: msg }));
      }
    },
    [connectedFriendId]
  );

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        error,
        onlineUsers,
        connectedFriendId,
        setConnectedFriendId,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
