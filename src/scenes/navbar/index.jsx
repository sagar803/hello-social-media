import React, { useState , useEffect} from "react";
import {
  Menu,
  Box,
  Button,
  IconButton,
  InputBase,
  Typography,
  Select,
  MenuItem,
  FormControl,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Search,
  Message,
  DarkMode,
  LightMode,
  Notifications,
  Help,
  Close,
  Clear
} from "@mui/icons-material";
import { Menu as IconsMenu } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setMode, setLogout , setUsers} from "state";
import { useNavigate } from "react-router-dom";
import FlexBetween from "components/FlexBetween";
import SearchResultWidget from "../widgets/SearchResultWidget";
import UserImage from "components/UserImage";
import NotificationMenu from "scenes/widgets/Notifications";

/*const fullName = `${user.firstName} ${user.lastName}`;*/

function Navbar ({marginTop="10px"}){
  const [search, setSearch] = useState("");
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const users = useSelector((state) => state.users);
  const user = useSelector((state) => state.user);
  const { _id, picturePath } = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);  

  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const dark = theme.palette.neutral.dark;
  const background = theme.palette.background.default;
  const primaryLight = theme.palette.primary.light;
  const alt = theme.palette.background.alt;
  const fullName = `${user.firstName} ${user.lastName}`;
  


  const deleteAccount = async () => {
    const userInput = window.prompt("This is irreversible. Type 'CONFIRM' To continue:");
    if (userInput === "CONFIRM"){
      const deleted = await fetch(
        `${process.env.REACT_APP_API}/users/${_id}`, 
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
        const response = await deleted.json();
        console.log(response)
        dispatch(setLogout())
        window.alert("Account deleted successfully.");
    }
    else{
      window.alert("Account deletion canceled. You did not enter the correct confirmation code.");
    }
    
  };

  const getUsers = async () => {
    const users = await fetch(
      `${process.env.REACT_APP_API}/users`,
      {
        method : "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
    const response = await users.json();
    dispatch(setUsers({users: response}));
  }
  useEffect(() => {
    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  //side menu logout menu settings from MUI menu components
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

    return (
      <FlexBetween  marginTop={marginTop} borderRadius="8px" padding="1rem 6%" backgroundColor={alt}>
      <FlexBetween gap="1.75rem">
        <Typography
          fontWeight="bold"
          fontSize="clamp(1rem, 2rem, 2.25rem)"
          color="primary"
          onClick={() => navigate("/home")}
          sx={{
            "&:hover": {
              color: primaryLight,
              cursor: "pointer",
            },
          }}
        >
          Hello
        </Typography>
        <Box>
          <FlexBetween
              width={isNonMobileScreens ? "200px" : "130px"}
              backgroundColor={neutralLight}
              borderRadius="9px"
              gap="1rem"
              padding="0.1rem 1rem"
              >
              <InputBase 
                onChange={(event)=>setSearch(event.target.value)}
                value={search}
                placeholder="Search..." 
              />
              <IconButton>
                { search ? <Clear onClick={ () => setSearch("")} /> : <Search />}
              </IconButton>
          </FlexBetween>
          { search && <SearchResultWidget search={search} users={users}/>}
        </Box>

      </FlexBetween>

      {/* DESKTOP NAV */}
      {isNonMobileScreens ? (
        <FlexBetween gap="2rem">
          <IconButton onClick={() => dispatch(setMode())}>
            {theme.palette.mode === "dark" ? (
              <DarkMode sx={{ fontSize: "25px" }} />
            ) : (
              <LightMode sx={{ color: dark, fontSize: "25px" }} />
            )}
          </IconButton>
          <IconButton onClick={() => navigate("/chat")}>
            <Message sx={{ fontSize: "25px" }} />
          </IconButton>
          <IconButton>
            <NotificationMenu/>
          </IconButton>
          <IconButton>
            <Help sx={{ fontSize: "25px" }} />
          </IconButton>
          <FormControl variant="standard" value={fullName}>
            <Select
              value={fullName}
              sx={{
                backgroundColor: neutralLight,
                width: "150px",
                borderRadius: "0.25rem",
                p: "0.25rem 1rem",
                "& .MuiSvgIcon-root": {
                  pr: "0.25rem",
                  width: "3rem",
                },
                "& .MuiSelect-select:focus": {
                  backgroundColor: neutralLight,
                },
              }}
              input={<InputBase />}
            >
              <MenuItem value={fullName}>
                <Typography>{fullName}</Typography>
              </MenuItem>
              <MenuItem onClick={deleteAccount}>Delete Account</MenuItem>
              <MenuItem onClick={() => dispatch(setLogout())}>Log Out</MenuItem>
            </Select>
          </FormControl>
        </FlexBetween>
      ) : (
            isMobileMenuToggled
            ? (
              <Box 
                backgroundColor={neutralLight}
                borderRadius="8px">
                <IconButton
                  onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
                >
                  <Close />
                </IconButton>
              </Box>
            ) : (
            <IconButton
              onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
            >
              <IconsMenu />
            </IconButton>
            )
      )}

      {/* MOBILE NAV */}
      { !isNonMobileScreens && isMobileMenuToggled && (
        <Box
          position="absolute"
          right="6%"
          top="15%"
          zIndex="10"
          width="80px"
        >

          {/* MENU ITEMS */}
          <FlexBetween
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            padding="10px"
            gap="2rem"
            backgroundColor={neutralLight}
            borderRadius="8px"
            boxShadow='0px 0px 20px 1px rgba(0, 0, 0, 0.3)'
          >
            <IconButton
              onClick={() => dispatch(setMode())}
              sx={{ fontSize: "25px" }}
            >
              {theme.palette.mode === "dark" ? (
                <DarkMode sx={{ fontSize: "25px" }} />
              ) : (
                <LightMode sx={{ color: dark, fontSize: "25px" }} />
              )}
            </IconButton>
            <IconButton onClick={() => navigate("/chat")}>
              <Message sx={{ fontSize: "25px" }} />
            </IconButton>
            <IconButton>
              <NotificationMenu />
            </IconButton>
            <IconButton>
              <Help sx={{ fontSize: "25px" }} />
            </IconButton>

            <Button
              id="basic-button"
              aria-controls={open ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
            >
              <UserImage image={picturePath} />
            </Button>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              <MenuItem value={fullName}>
                  <Typography>{fullName}</Typography>
              </MenuItem>
              <MenuItem onClick={deleteAccount}>Delete Account</MenuItem>
              <MenuItem onClick={() => dispatch(setLogout())}>Log Out</MenuItem>
            </Menu>

            {/*<FormControl variant="standard" value={fullName}>
              <Select
                value={fullName}
                sx={{
                  backgroundColor: neutralLight,
                  borderRadius: "0.25rem",
                  p: "0.25rem 1rem",
                  "& .MuiSvgIcon-root": {
                    pr: "0.25rem",
                    width: "3rem",
                  },
                  "& .MuiSelect-select:focus": {
                    backgroundColor: neutralLight,
                  },
                }}
                input={<InputBase />}
              >
                <MenuItem value={fullName}>
                  <Typography>{fullName}</Typography>
                </MenuItem>
                <MenuItem onClick={deleteAccount}>Delete Account</MenuItem>
                <MenuItem onClick={() => dispatch(setLogout())}>Log Out</MenuItem>
              </Select>
            </FormControl>
              */}
          </FlexBetween>
        </Box>
      )}
    </FlexBetween>
  );
}

export default Navbar;