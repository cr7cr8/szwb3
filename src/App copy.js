import React, { useState, useRef, useEffect, useLayoutEffect, useContext, useCallback, createContext, useMemo } from 'react';

import logo from './logo.svg';
import './App.css';


import ThemeContextProvider from "./ThemeContextProvider";
import { ContextProvider as EditorCtx } from "./ContextProvider";
import Content, { InstantContent } from "./Content";
import MainPage from "./MainPage";

import {
  BrowserRouter, Route, Routes, useRoutes, Link, useParams, matchPath, useLocation, useNavigate

} from "react-router-dom";


import { Container, Grid, Paper, IconButton, ButtonGroup, Stack, Box, Chip, Avatar, CssBaseline } from '@mui/material';
import Dialog from '@mui/material/Dialog';

import SettingsIcon from '@mui/icons-material/Settings';
import multiavatar from '@multiavatar/multiavatar'
import { url, toPreHtml, hexToRGB, hexToRGB2 } from "./config";

import { ThemeProvider, useTheme, createTheme, styled, } from '@mui/material/styles';
import useAppContext from './useAppContext';


export const AppContext = createContext()





function App() {


  const [postArr, setPostArr] = useState([])
  const [userName, setUserName] = useState("User" + String(Math.random()).substring(3, 6))

  const [clickFn, setClickFn] = useState(null)

  const [isAnimiDone, setIsAnimiDone] = useState(false)

  const [savedPostArr, setSavedPostArr] = useState()


  return (
    <ThemeContextProvider>
      <AppContext.Provider value={{
        userName, setUserName, clickFn, setClickFn, isAnimiDone, setIsAnimiDone, savedPostArr, setSavedPostArr,
        postArr, setPostArr
      }}>

        <Container disableGutters={true} fixed={false} maxWidth={window.innerWidth >= 3000 ? false : "lg"} >
          <CssBaseline />

          <TopBar />
          <MainPage />
     
          {/* <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/person/:personName" element={<ProfilePage />} />
          </Routes> */}

        </Container>
      </AppContext.Provider>
    </ThemeContextProvider>



  );
}

export default App;

function ProfilePage() {

  const { personName } = useParams()
  const location = useLocation()
  console.log(matchPath("/person/:personName", location.pathname))
  return (
    <Box>{personName}</Box>

  )
}


function TopBar({ ...props }) {

  const { userName, setUserName, clickFn, setClickFn, isAnimiDone, setIsAnimiDone } = useAppContext()

  const userAvatarSrc = "data:image/svg+xml;base64," + btoa(multiavatar(userName))
  const avatarString = multiavatar(userName)
  let avatarColor = avatarString.match(/#[a-zA-z0-9]*/)[0]
  if (avatarColor.length < 7) {
    avatarColor = "#" + avatarColor[1] + avatarColor[1] + avatarColor[2] + avatarColor[2] + avatarColor[3] + avatarColor[3]
  }
  const bgcolor = hexToRGB(avatarColor, 0.2)

  const theme = useTheme()

  const navigate = useNavigate()

  const location = useLocation()
  const isMainPage = Boolean(matchPath("/", location.pathname))


  return (
    <Paper sx={{
      bgcolor: theme.isLight ? bgcolor : hexToRGB2(avatarColor, 0.6), padding: "4px", my: "8px", mx: "4px", display: "flex", alignItems: "center",
      justifyContent: "center",

  
    }}>
      <Box sx={{
        padding: "4px", borderRadius: "1000px", bgcolor: "background.default", width: "fit-content",
        ...!isMainPage && { transform: "translateX(200%) translateY(150%) scale(2)" },
        transition: "transfrom, 300ms",

      }}>
        <Avatar src={userAvatarSrc} sx={{ width: "2.4rem", height: "2.4rem" }} />
      </Box>

      <Box sx={{
        bgcolor: "background.default", borderRadius: "8px", width: "60%", mx: "8px",  maxWidth: "600px",
        color: theme.palette.text.secondary, px: "8px",
        ...isMainPage && { height: "calc( 2.4rem + 4px)" },
        ...!isMainPage && { aspectRatio: "16 / 9" },
        transition: "all 300ms",
      }}
        onClick={clickFn}

      ></Box>

      {/* <Link to={Boolean(clickFn) ? `/person/${userName}` : "/"} target="_self"> */}
        <Box sx={{
          padding: "4px", borderRadius: "1000px", bgcolor: "background.default", width: "fit-content",

        }}>
          <Avatar sx={{
            width: "2.4rem", height: "2.4rem",
            bgcolor: theme.isLight ? bgcolor : hexToRGB2(avatarColor, 0.6),
            "&:hover": { bgcolor: avatarColor, cursor: "pointer" }
          }}
            onClick={function () {
              // window.open("/person", '_blank')
              // Boolean(clickFn) ? navigate(`/person/${userName}`) : navigate(`/`)
            }}
          >
            <SettingsIcon sx={{ color: theme.palette.background.default, }} fontSize='large' />
          </Avatar>
        </Box>
      {/* </Link> */}
    </Paper >
  )
}
