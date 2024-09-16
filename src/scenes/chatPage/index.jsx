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
import { useSelector } from "react-redux";
import Navbar from "scenes/navbar";
import { useTheme } from "@emotion/react";
import { useSocket } from "hooks/useSocket";
import UserImage from "components/UserImage";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const navigate = useNavigate()
  const isNonMobileScreens = useMediaQuery("(min-width:500px)");
  const { socket, onlineUsers, connected, error } = useSocket();
  const user = useSelector((state) => state.user);
  const friends = user.friends || [];
  const [currentMessage, setCurrentMessage] = useState("");
  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const background = theme.palette.background.default;
  const alt = theme.palette.background.alt;
  const [messagesLoading, setMessagesLoading] = useState(false);


  return (
    <Box>
      <Box zIndex="1" padding='1rem 4%' position={isNonMobileScreens ?'sticky' : "block"} top="0" sx={{backdropFilter: isNonMobileScreens ? 'blur(2px)' : "undefined"}} >
        <Navbar />
      </Box>

      <Box width="100%" padding="1rem 4%" display={isNonMobileScreens ? "flex" : "block"} gap="0.5rem" justifyContent="space-between">
        {/* User List on the Left */}
        {isNonMobileScreens && (
          <Box flexBasis="26%" item xs={3} backgroundColor={alt} height="80vh" sx={{ overflowY: "auto", borderRadius: "8px" }}>
              <Typography variant="h6" p={2} sx={{ borderBottom: '1px solid #ddd' }}>
                Friends
              </Typography>
              <List>
                {friends && friends.map((friend) => {
                  const isOnline = onlineUsers.includes(friend._id);
                  return (
                    <ListItem button onClick={() => navigate(`/chat/${friend._id}`)} key={friend._id} sx={{ mb: 1 }}>
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
        )}

        {/* Chat Section on the Right */}
        <Box flexBasis="70%" item xs={9} display="flex" flexDirection="column" height="80vh">
          {messagesLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : isNonMobileScreens ? (
            <Typography variant="h6" p={2} textAlign="center">
              Click on a friend to start a conversation.
            </Typography>
          ) : (
            <Box item xs={3} backgroundColor={alt} height="80vh" sx={{ overflowY: "auto", borderRadius: "8px" }}>
            <Typography variant="h6" p={2} sx={{ borderBottom: '1px solid #ddd' }}>
              Click on a friend to start a conversation.
            </Typography>
            <List>
              {friends && friends.map((friend) => {
                const isOnline = onlineUsers.includes(friend._id);
                return (
                  <ListItem button onClick={() => navigate(`/chat/${friend._id}`)} key={friend._id} sx={{ mb: 1}}>
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
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
