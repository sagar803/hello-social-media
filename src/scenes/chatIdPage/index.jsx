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
import { useDispatch, useSelector } from "react-redux";
import Navbar from "scenes/navbar";
import { useTheme } from "@emotion/react";
import { useSocket } from "hooks/useSocket";
import UserImage from "components/UserImage";
import { setNotifications } from "state";
import { useNavigate, useParams } from "react-router-dom";

const ChatIdPage = () => {
  const { id } = useParams();
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const friends = user.friends || [];
  const activeChat = friends.find((friend) => friend._id === id);

  const isNonMobileScreens = useMediaQuery("(min-width:500px)");
  const navigate = useNavigate()
  const { socket, onlineUsers, connected, setConnectedFriendId } = useSocket();
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const bottomRef = useRef(null);
  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const background = theme.palette.background.default;
  const alt = theme.palette.background.alt;
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [chatId, setChatId] = useState(null);

  useEffect(() => setConnectedFriendId(id), [id])

  const toggleSidebar = () => setIsActive((prev) => !prev);

  const handleReceivePrivateMessage = (msg) => {
    if(msg.senderId == id){

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          chatId: msg.chatId,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          message: msg.message,
          timestamp: Date.now(),
        },
      ]);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("receivePrivateMessage", handleReceivePrivateMessage);
    }
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (currentMessage.trim() && activeChat) {
      let msg = {
        chatId,
        senderId: user._id,
        receiverId: activeChat._id,
        message: currentMessage,
        timestamp: Date.now(),
      };
      setMessages((prevMessages) => [...prevMessages, msg]);
      socket.emit("privateMessage", msg);
      setCurrentMessage("");
    }
  };

  const getChatId = async (userId1, userId2) => {
    const response = await fetch(
      `${process.env.REACT_APP_API}/chat/chatId?userId1=${userId1}&userId2=${userId2}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) return null;
    return response.json();
  };

  const createChat = async (userId1, userId2) => {
    const response = await fetch(`${process.env.REACT_APP_API}/chat/newChat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId1, userId2 }),
    });
    if (!response.ok) throw new Error("Failed to create chat");
    return response.json();
  };

  useEffect(() => {
    const fetchChatIdAndMessages = async () => {
      setMessagesLoading(true);
      try {
        // Fetch or create chat
        let chatResponse = await getChatId(user._id, id);
        let chatId = chatResponse?.chatId;

        if (!chatId) {
          chatResponse = await createChat(user._id, id);
          chatId = chatResponse?.chatId;
        }

        setChatId(chatId);

        const messagesResponse = await fetch(
          `${process.env.REACT_APP_API}/chat/messages/${chatId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!messagesResponse.ok) throw new Error("Failed to fetch messages");

        const messages = await messagesResponse.json();
        setMessages(messages);
      } catch (error) {
        console.error("Error fetching chat or messages:", error);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchChatIdAndMessages();
  }, [id, user._id, token]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Box>
      <Box
        zIndex="1"
        padding="1rem 4%"
        position={isNonMobileScreens ? "sticky" : "block"}
        top="0"
        sx={{ backdropFilter: isNonMobileScreens ? "blur(2px)" : "undefined" }}
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
          <Box
            flexBasis="26%"
            item
            xs={3}
            backgroundColor={alt}
            height="80vh"
            sx={{ overflowY: "auto", borderRadius: "8px" }}
          >
            <Typography
              variant="h6"
              p={2}
              sx={{ borderBottom: "1px solid #ddd" }}
            >
              Friends
            </Typography>
            <List>
              {friends &&
                friends.map((friend) => {
                  const isOnline = onlineUsers.includes(friend._id);
                  return (
                    <ListItem
                      button
                      onClick={() => navigate(`/chat/${friend._id}`)}
                      key={friend._id}
                      sx={{
                        mb: 1,
                        backgroundColor:
                          activeChat && activeChat._id == friend._id
                            ? neutralLight
                            : "transparent",
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          width: "50px",
                          height: "50px",
                          borderRadius: "8px",
                          overflow: "hidden",
                        }}
                      >
                        <UserImage image={friend.picturePath} size="50px" />
                        {isOnline && (
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 2,
                              right: 2,
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              backgroundColor: "green",
                              border: "2px solid #fff",
                            }}
                          />
                        )}
                      </Box>
                      <ListItemText
                        primary={`${friend.firstName} ${friend.lastName}`}
                        sx={{ ml: 1 }}
                      />
                    </ListItem>
                  );
                })}
            </List>
          </Box>
        ) : (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "300px",
              height: "100vh",
              backgroundColor: alt,
              transform: isActive ? "translateX(0)" : "translateX(-100%)",
              transition: "transform 0.3s ease-in-out",
              zIndex: 10,
              borderRadius: "0 8px 8px 0",
            }}
          >
            <Typography
              variant="h6"
              p={2}
              sx={{ borderBottom: "1px solid #ddd" }}
            >
              Friends
            </Typography>
            <List>
              {friends &&
                friends.map((friend) => {
                  const isOnline = onlineUsers.includes(friend._id);
                  return (
                    <ListItem
                      button
                      onClick={() => navigate(`/chat/${friend._id}`)}
                      key={friend._id}
                      sx={{
                        mb: 1,
                        backgroundColor:
                          activeChat && activeChat._id == friend._id
                            ? neutralLight
                            : "transparent",
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          width: "50px",
                          height: "50px",
                          borderRadius: "8px",
                          overflow: "hidden",
                        }}
                      >
                        <UserImage image={friend.picturePath} size="50px" />
                        {isOnline && (
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 2,
                              right: 2,
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              backgroundColor: "green",
                              border: "2px solid #fff",
                            }}
                          />
                        )}
                      </Box>
                      <ListItemText
                        primary={`${friend.firstName} ${friend.lastName}`}
                        sx={{ ml: 1 }}
                      />
                    </ListItem>
                  );
                })}
            </List>
          </Box>
        )}

        {/* Chat Section on the Right */}
        <Box
          flexBasis="70%"
          item
          xs={9}
          display="flex"
          flexDirection="column"
          height="80vh"
        >
          {messagesLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <CircularProgress />
            </Box>
          ) : activeChat ? (
            <>
              {/* Chat Header */}
              <Box
                backgroundColor={alt}
                sx={{
                  position: "relative",
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "row",
                  height: "10%",
                  borderRadius: "8px",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: "50px",
                    height: "40px",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <UserImage image={activeChat.picturePath} size="40px" />
                  {onlineUsers.includes(activeChat._id) && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 2,
                        right: 2,
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        backgroundColor: "green",
                        border: "2px solid #fff",
                      }}
                    />
                  )}
                </Box>
                <Typography>{`${activeChat.firstName} ${activeChat.lastName}`}</Typography>

                {!isNonMobileScreens && (
                  <Box
                    onClick={toggleSidebar}
                    sx={{
                      position: "absolute",
                      right: "10px",
                      backgroundColor: "gray",
                      padding: "10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    {isActive ? "Close" : "Friends List"}
                  </Box>
                )}
              </Box>

              {/* Chat Messages */}
              <Box
                sx={{
                  flexGrow: 1,
                  p: 2,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  height: "70%",
                  "&::-webkit-scrollbar": {
                    width: "5px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: background,
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: alt,
                    borderRadius: "4px",
                  },
                }}
              >
                {messages &&
                  messages.map((message, index) => (
                    <Box
                      key={index}
                      display="flex"
                      justifyContent={
                        message.senderId === user._id
                          ? "flex-end"
                          : "flex-start"
                      }
                      mb={2}
                    >
                      <Paper
                        sx={{
                          p: 2,
                          backgroundColor:
                            message.senderId === user._id
                              ? "#1976d2"
                              : "#f5f5f5",
                          color:
                            message.senderId === user._id ? "#fff" : "#000",
                          maxWidth: "60%",
                        }}
                      >
                        <Typography variant="body1">
                          {message.message}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {message.senderId !== user._id
                            ? `${activeChat.firstName} ${
                                activeChat.lastName
                              } - ${formatTime(message.timestamp)}`
                            : `${user.firstName} ${
                                user.lastName
                              } - ${formatTime(message.timestamp)}`}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
                <div ref={bottomRef} />
              </Box>

              {/* Input Box */}
              <Paper
                component="form"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 2,
                  height: "10%",
                }}
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
                <Button
                  variant="contained"
                  sx={{ ml: 2 }}
                  onClick={handleSendMessage}
                >
                  Send
                </Button>
              </Paper>
            </>
          ) : isNonMobileScreens ? (
            <Typography variant="h6" p={2} textAlign="center">
              Click on a friend to start a conversation.
            </Typography>
          ) : (
            <Box
              item
              xs={3}
              backgroundColor={alt}
              height="80vh"
              sx={{ overflowY: "auto", borderRadius: "8px" }}
            >
              <Typography
                variant="h6"
                p={2}
                sx={{ borderBottom: "1px solid #ddd" }}
              >
                Click on a friend to start a conversation.
              </Typography>
              <List>
                {friends &&
                  friends.map((friend) => {
                    const isOnline = onlineUsers.includes(friend._id);
                    return (
                      <ListItem
                        button
                        onClick={() => navigate(`/chat/${friend._id}`)}
                        key={friend._id}
                        sx={{
                          mb: 1,
                          backgroundColor:
                            activeChat && activeChat._id == friend._id
                              ? neutralLight
                              : "transparent",
                        }}
                      >
                        <Box
                          sx={{
                            position: "relative",
                            width: "50px",
                            height: "50px",
                            borderRadius: "8px",
                            overflow: "hidden",
                          }}
                        >
                          <UserImage image={friend.picturePath} size="50px" />
                          {isOnline && (
                            <Box
                              sx={{
                                position: "absolute",
                                bottom: 2,
                                right: 2,
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                backgroundColor: "green",
                                border: "2px solid #fff",
                              }}
                            />
                          )}
                        </Box>
                        <ListItemText
                          primary={`${friend.firstName} ${friend.lastName}`}
                          sx={{ ml: 1 }}
                        />
                      </ListItem>
                    );
                  })}
              </List>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ChatIdPage;
