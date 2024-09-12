import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import HomePage from "scenes/homePage";
import LoginPage from "scenes/loginPage";
import ProfilePage from "scenes/profilePage";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme";
import Chat from "scenes/chatPage";
import { SocketProvider } from "hooks/useSocket";

function App() {
  const mode = useSelector((state) => state.mode);
  const user = useSelector((state) => state.user);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const isAuth = Boolean(useSelector((state) => state.token));

  const appContent = (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/home"
          element={isAuth ? <HomePage /> : <Navigate to="/" />}
        />
        <Route
          path="/profile/:userId"
          element={isAuth ? <ProfilePage /> : <Navigate to="/" />}
        />
        <Route path="/chat" element={isAuth ? <Chat /> : <Navigate to="/" />} />
      </Routes>
    </>
  );

  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          {isAuth ? <SocketProvider>{appContent}</SocketProvider> : appContent}
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
