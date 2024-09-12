import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const user = useSelector((state) => state.user);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user._id) {
      const socket = io("http://localhost:3001");

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

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, connected, error, onlineUsers }}
    >
      {children}
    </SocketContext.Provider>
  );
};
