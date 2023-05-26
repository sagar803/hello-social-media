import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import Form from "./Form";

const LoginPage = () => {
  const theme = useTheme();
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  return (
    <Box 
      display="flex"
      flexDirection="column"
      justifyContent='space-between'
      height='100vh'
    >
      <Box
        width="100%"
        backgroundColor={theme.palette.background.alt}
        p="1rem 6%"
        textAlign="center"
      >
        <Typography fontWeight="bold" fontSize="32px" color="primary">
          Hello
        </Typography>
      </Box>

      <Box
        width={isNonMobileScreens ? "500px" : "90%"}
        maxWidth='500px'
        p="2rem"
        m="2rem auto"
        borderRadius="1.5rem"
        backgroundColor={theme.palette.background.alt}
      >
        <Typography textAlign="center" fontWeight="500" variant="h5" sx={{ mb: "1.5rem" }}>
          Welcome to Hello,
          <br/>
          Connecting people, building communities.
        </Typography>
        <Form />
      </Box>
      <Box
        width="100%"
        backgroundColor={theme.palette.background.alt}
        p="0.5rem 6%"
        textAlign="center"
      >
        <Typography fontSize="13px" color="primary">
          &#169; sagar chawla
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
