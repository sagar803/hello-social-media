import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import Navbar from "scenes/navbar";
import { useTheme } from "@emotion/react";
import { useSocket } from "hooks/useSocket";
import UserImage from "components/UserImage";

const Chat = () => {
  const isNonMobileScreens = useMediaQuery("(min-width:500px)");
  const { socket, onlineUsers, connected, error } = useSocket();
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const friends = user.friends || [];
  const socketRef = useRef(null);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const bottomRef = useRef(null);
  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const dark = theme.palette.neutral.dark;
  const background = theme.palette.background.default;
  const primaryLight = theme.palette.primary.light;
  const alt = theme.palette.background.alt;
  const [chatId, setChatId] = useState(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const toggleSidebar = () => {
    setIsActive((prev) => !prev);
  };


  const handleReceivePrivateMessage  = useCallback(
    (msg) => {
      if (msg.senderId === activeChat?._id) {
        setMessages((prevMessages) => [...prevMessages, { chatId: msg.chatId, senderId: msg.senderId, receiverId: msg.receiverId, message: msg.message }]);
      } else {
        console.log('Message from other user');
      }
    },
    [activeChat]
  );
  
  useEffect(() => {
    if(socket){
      socket.on("receivePrivateMessage", handleReceivePrivateMessage );
    }
    return () => {
      if(socket){
        socket.off("receivePrivateMessage", handleReceivePrivateMessage );
      }
    };
  }, [handleReceivePrivateMessage ])


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (currentMessage.trim() && activeChat) {
      setMessages((prevMessages) => [...prevMessages,{ chatId, senderId: user._id, receiverId: activeChat._id, message: currentMessage, timestamp: Date.now()}]);
      socket.emit("privateMessage", { chatId, senderId: user._id, receiverId: activeChat._id, message: currentMessage });
      setCurrentMessage("");
    }
  };

  const getChatId = async (userId1, userId2) => {
    const response = await fetch(`${process.env.REACT_APP_API}/chat/chatId?userId1=${userId1}&userId2=${userId2}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) return null
    // if (!response.ok) throw new Error('Failed to fetch chat ID');
    return response.json();
  };
  
  const createChat = async (userId1, userId2) => {
    const response = await fetch(`${process.env.REACT_APP_API}/chat/newChat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId1, userId2 }),
    });
    if (!response.ok) throw new Error('Failed to create chat');
    return response.json();
  };

  const handleFriendClick = async (friend) => {
    setMessagesLoading(true)
    try {
      let chatResponse = await getChatId(user._id, friend._id);
      let chatId = chatResponse?.chatId;
  
      if (!chatId) {
        chatResponse = await createChat(user._id, friend._id);
        chatId = chatResponse.chatId;
      }
  
      setActiveChat(friend);
      setChatId(chatId);

      const messagesResponse = await fetch(`${process.env.REACT_APP_API}/chat/messages/${chatId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!messagesResponse.ok) throw new Error('Failed to fetch messages');
      const messages = await messagesResponse.json();
      setMessages(messages);      
    } catch (error) {
      console.error('Error handling friend click:', error);
    } finally{
      setMessagesLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box>
      <Box
        zIndex="1"
        padding='1rem 4%'
        position={isNonMobileScreens ?'sticky' : "block"}
        top="0"

        sx={{backdropFilter: isNonMobileScreens ? 'blur(2px)' : "undefined"}}
        
      >
        <Navbar />
      </Box>

      <Box
        width="100%"
        padding="1rem 4%"
        display={isNonMobileScreens ? "flex" : "block"}
        gap="0.5rem"
        justifyContent="space-between"
      >
        {/* User List on the Left */}
        {isNonMobileScreens ? (
              <Box flexBasis="26%" item xs={3} backgroundColor={alt} height="80vh" sx={{ overflowY: "auto", borderRadius: "8px" }}>
              <Typography variant="h6" p={2} sx={{ borderBottom: '1px solid #ddd' }}>
                Friends
              </Typography>
              <List>
                {friends && friends.map((friend) => {
                  const isOnline = onlineUsers.includes(friend._id);
                  return (
                    <ListItem button onClick={() => handleFriendClick(friend)} key={friend._id} sx={{ mb: 1, backgroundColor: activeChat._id == friend._id ? neutralLight : 'transparent'}}>
                      <Box sx={{ position: 'relative', width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden' }} >
                        <UserImage image={friend.picturePath} size="50px" />                      
                        {isOnline && <Box sx={{position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: '50%', backgroundColor: 'green', border: '2px solid #fff' }}/>}
                      </Box>
                      <ListItemText primary={`${friend.firstName} ${friend.lastName}`} sx={{ ml: 1 }}/>
                    </ListItem>
                  );
                })}
              </List>
          </Box>     
        ) : (
          <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '300px',
                height: '100vh',
                backgroundColor: alt,
                transform: isActive ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.3s ease-in-out',
                zIndex: 10,
                borderRadius: '0 8px 8px 0',
              }}
            >
              <Typography variant="h6" p={2} sx={{ borderBottom: '1px solid #ddd' }}>
                Friends
              </Typography>
              <List>
                {friends &&
                  friends.map((friend) => {
                    const isOnline = onlineUsers.includes(friend._id);
                    return (
                      <ListItem
                        button
                        onClick={() => handleFriendClick(friend)}
                        key={friend._id}
                        sx={{ mb: 1, backgroundColor: activeChat._id == friend._id ? neutralLight : 'transparent'}}
                      >
                        <Box
                          sx={{
                            position: 'relative',
                            width: '50px',
                            height: '50px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                          }}
                        >
                          <UserImage image={friend.picturePath} size="50px" />
                          {isOnline && (
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 2,
                                right: 2,
                                width: 14,
                                height: 14,
                                borderRadius: '50%',
                                backgroundColor: 'green',
                                border: '2px solid #fff',
                              }}
                            />
                          )}
                        </Box>
                        <ListItemText primary={`${friend.firstName} ${friend.lastName}`} sx={{ ml: 1 }} />
                      </ListItem>
                    );
                  })}
              </List>
            </Box>
          )}

        {/* Chat Section on the Right */}
        <Box flexBasis="70%" item xs={9} display="flex" flexDirection="column" height="80vh">
          {messagesLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : activeChat ? (
            <>
              {/* Chat Header */}
              <Box backgroundColor={alt} sx={{ position: 'relative', p: 2, display: "flex", alignItems: "center", flexDirection: "row", height: "10%", borderRadius: "8px", }}  >
                  <Box sx={{ position: 'relative', width: '50px', height: '40px', borderRadius: '8px', overflow: 'hidden' }} >
                    <UserImage image={activeChat.picturePath} size="40px" />                      
                    {onlineUsers.includes(activeChat._id) && <Box sx={{position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: '50%', backgroundColor: 'green', border: '2px solid #fff' }}/>}
                  </Box>
                  <Typography>{`${activeChat.firstName} ${activeChat.lastName}`}</Typography>

                  {!isNonMobileScreens && (
                    <Box
                      onClick={toggleSidebar}
                      sx={{
                        position: 'absolute',
                        right: '10px',
                        backgroundColor: 'gray',
                        padding: '10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      {isActive ? 'Close' : 'Open Chats'}
                    </Box>
                  )}
              </Box>

              {/* Chat Messages */}
              <Box
                sx={{
                  flexGrow: 1,
                  p: 2,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '70%',
                  '&::-webkit-scrollbar': {
                    width: '5px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: background,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: alt,
                    borderRadius: '4px',
                  },
                }}
              >
                {messages && messages.map((message, index) => (
                  <Box
                    key={index}
                    display="flex"
                    justifyContent={message.senderId === user._id ? "flex-end" : "flex-start"}
                    mb={2}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        backgroundColor: message.senderId === user._id ? "#1976d2" : "#f5f5f5",
                        color: message.senderId === user._id ? "#fff" : "#000",
                        maxWidth: "60%",
                      }}
                    >
                      <Typography variant="body1">{message.message}</Typography>
                      <Typography variant="caption" display="block">
                        {message.senderId !== user._id 
                          ? `${activeChat.firstName} ${activeChat.lastName} - ${formatTime(message.timestamp)}`
                          : `${user.firstName} ${user.lastName} - ${formatTime(message.timestamp)}`}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
                <div ref={bottomRef} />
              </Box>

              {/* Input Box */}
              <Paper
                component="form"
                sx={{ display: "flex", alignItems: "center", p: 2, height: "10%" }}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <TextField
                  variant="outlined"
                  placeholder="Type a message..."
                  fullWidth
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                />
                <Button variant="contained" sx={{ ml: 2 }} onClick={handleSendMessage}>
                  Send
                </Button>
              </Paper>
            </>
          ) : (
            <Typography variant="h6" p={2} textAlign="center">
              Click on a friend to start a conversation.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
