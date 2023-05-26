import { Box, Typography, useTheme } from "@mui/material";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";

const SearchResultWidget = ({ users }) => {
  const { palette } = useTheme();
  
  return (
    <Box
        maxHeight="400px"
        width="290px"
        overflow="auto"
        position='absolute'
        borderRadius='8px'
        border="1px solid grey"
        sx={{
            '&::-webkit-scrollbar': {
              width: '5px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '8px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            },
          }}
    >
        <WidgetWrapper>
        <Typography
            color={palette.neutral.dark}
            variant="h6"
            fontWeight="200"
            sx={{ mb: "1rem" }}
        >
            {(users.length) ? 'Search Results...' : 'No user found'}
        </Typography>
        <Box display="flex" flexDirection="column" gap="1.5rem">
        {users.length && (
            users.map((user) => (
                <Friend
                    key={user._id}
                    friendId={user._id}
                    name={`${user.firstName} ${user.lastName}`}
                    subtitle={user.occupation}
                    userPicturePath={user.picturePath}
                />
                ))
            )
        }
        </Box>
        </WidgetWrapper>
    </Box>
  );
};

export default SearchResultWidget;
