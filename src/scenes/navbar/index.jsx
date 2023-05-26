import { useState , useEffect} from "react";
import {
  Box,
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
  Menu,
  Close,
  Clear
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setMode, setLogout , setUsers} from "state";
import { useNavigate } from "react-router-dom";
import FlexBetween from "components/FlexBetween";
import SearchResultWidget from "../widgets/SearchResultWidget";

/*const fullName = `${user.firstName} ${user.lastName}`;*/

function Navbar (){
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const users = useSelector((state) => state.users);
  const user = useSelector((state) => state.user);
  const { _id } = useSelector((state) => state.user);
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
    const userInput = window.prompt("Warning: Are you sure you want to delete your account. Type 'CONFIRM' To continue:");
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
    
  const handleSearch = (event) => {
    setSearch(event.target.value)
    const result = users.filter((user) => user.firstName.includes(search) || user.lastName.includes(search) || user.fullName.includes(search));
    setSearchResult(result)
  }
  const openMessaging = () => {
    window.open(`${process.env.REACT_APP_MESSAGING_URL}`, '_blank');
  };

    return (
      <FlexBetween borderRadius="8px" padding="1rem 6%" backgroundColor={alt}>
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
        {isNonMobileScreens && (
          <Box>
            <FlexBetween
                backgroundColor={neutralLight}
                borderRadius="9px"
                gap="3rem"
                padding="0.1rem 1.5rem"
                >
                <InputBase 
                  onChange={handleSearch}
                  value={search}
                  placeholder="Search..." 
                />
                <IconButton>
                  { search ? <Clear onClick={ () => setSearch("")} /> : <Search />}
                </IconButton>
            </FlexBetween>
            { search && <SearchResultWidget users={searchResult}/>}
          </Box>
        )}
        
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
          <IconButton onClick={openMessaging}>
            <Message sx={{ fontSize: "25px" }} />
          </IconButton>
          <Notifications sx={{ fontSize: "25px" }} />
          <Help sx={{ fontSize: "25px" }} />
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
        <IconButton
          onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
        >
          <Menu />
        </IconButton>
      )}
      {/* MOBILE NAV */}
      { !isNonMobileScreens && isMobileMenuToggled && (
        <Box
          position="fixed"
          right="0"
          top="0"
          height="100%"
          zIndex="10"
          maxWidth="300px"
          minWidth="200px"
          backgroundColor={background}
        >
          {/* CLOSE ICON */}
          <Box display="flex" justifyContent="flex-end" p="1rem">
            <IconButton
              onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
            >
              <Close />
            </IconButton>
          </Box>

          {/* MENU ITEMS */}
          <FlexBetween
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap="3rem"
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
            <IconButton onClick={openMessaging}>
              <Message sx={{ fontSize: "25px" }} />
            </IconButton>
            <Notifications sx={{ fontSize: "25px" }} />
            <Help sx={{ fontSize: "25px" }} />
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
        </Box>
      )}
    </FlexBetween>
  );
}

export default Navbar;