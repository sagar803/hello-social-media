import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import SearchUsers from "components/SearchUsers";
import WidgetWrapper from "components/WidgetWrapper";

const SearchResultWidget = ({ search, users }) => {
  //search is what is to searched and users is all users array
  const { palette } = useTheme();
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  
  const resultResult = users.filter((user) => user.firstName.toLowerCase().includes(search.toLowerCase()) || user.lastName.includes(search.toLowerCase()));
  return (
        <Box
          marginTop="5px"
          padding= "1rem 0.25rem 1rem .5rem"
          backgroundColor={palette.neutral.light}
          fontSize="0.5rem"
          maxHeight="300px"
          width="200px"
          position='absolute'
          borderRadius='8px'
          zIndex="1"
        >
            <Typography
                color={palette.neutral.dark}
                variant="h6"
                fontWeight="200"
                sx={{ mb: "1rem" }}
            >
                {(users.length) ? 'Search Results...' : 'No user found'}
            </Typography>
            <Box 
              paddingRight="0.15rem"
              maxHeight="210px"
              display="flex" 
              flexDirection="column" 
              gap="1rem"
              overflow="auto"
              sx={{
              '&::-webkit-scrollbar': {
                width: '2px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: palette.primary.main,
                borderRadius: '8px',
              },
            }}  
            >
            {users.length && (
                resultResult.map((user) => (
                    <SearchUsers
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
        </Box>
  );
};

export default SearchResultWidget;
