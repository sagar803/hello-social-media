import React, { useState } from 'react';
import { Button, Menu, MenuItem, Badge, Typography, IconButton, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useSelector } from 'react-redux';
import UserImage from 'components/UserImage';
import { useNavigate } from 'react-router-dom';

const NotificationMenu = () => {
  const friends = useSelector((state) => state.user.friends);
  const navigate = useNavigate()
  const notifications = useSelector((state) => state.notifications);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getFriendDetails = (senderId) => {
    const friend = friends.find((friend) => friend._id === senderId);
    if (friend) {
      return {
        name: `${friend.firstName} ${friend.lastName}`,
        picturePath: friend.picturePath,
      };
    }
    return { name: 'Unknown User', picturePath: null };
  };

  return (
    <>
      <IconButton
        id="notifications-button"
        aria-controls={open ? 'notifications-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        color="inherit"
      >
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'notifications-button',
        }}
      >
        {notifications.length > 0 ? (
          notifications.slice().reverse().map((notification, index) => {
            const { name, picturePath } = getFriendDetails(notification.senderId);
            return (
              <MenuItem key={index} onClick={() => navigate(`/chat/${notification.senderId}`)}>
                {picturePath && <UserImage size={'40px'} image={picturePath} />}
                <Box ml={2}>
                  <Typography variant="subtitle1">
                    New message from {name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {notification.message}
                  </Typography>
                </Box>
              </MenuItem>
            );
          })
        ) : (
          <MenuItem disabled>
            <Typography>No new notifications</Typography>
          </MenuItem>
        )}
        {/* <MenuItem onClick={onClearNotifications}>
          <Typography>Clear All Notifications</Typography>
        </MenuItem> */}
      </Menu>
    </>
  );
};

export default NotificationMenu;
