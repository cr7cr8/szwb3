import React, { useState, useRef, useEffect, useLayoutEffect, useContext, useCallback, createContext, useMemo } from 'react';

import logo from './logo.svg';
import './App.css';


import ThemeContextProvider from "./ThemeContextProvider";
import { ContextProvider as EditorCtx } from "./ContextProvider";
import Content, { InstantContent } from "./Content";
import ContentPerson from "./ContentPerson";

import MainPage from "./MainPage";

import {
  BrowserRouter, Route, Routes, useRoutes, Link, useParams, matchPath, useLocation, useNavigate,

} from "react-router-dom";


import { Container, Grid, Paper, IconButton, ButtonGroup, Stack, Box, Button, Chip, Avatar, CssBaseline, Typography, Collapse, Switch, Divider } from '@mui/material';
import Dialog from '@mui/material/Dialog';

import SettingsIcon from '@mui/icons-material/Settings';
import multiavatar from '@multiavatar/multiavatar'
import { url, toPreHtml, hexToRGB, hexToRGB2 } from "./config";

import { ThemeProvider, useTheme, createTheme, styled, } from '@mui/material/styles';
import useAppContext from './useAppContext';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

export const AppContext = createContext()





function App() {


  const [postArr, setPostArr] = useState([])
  const [userName, setUserName] = useState("User" + String(Math.random()).substring(3, 6))

  const [clickFn, setClickFn] = useState(null)

  const [isAnimiDone, setIsAnimiDone] = useState(false)

  const [savedPostArr, setSavedPostArr] = useState()

  const [needUpdateArr, setNeedUpdateArr] = useState([])
  const [needReduceArr, setNeedReduceArr] = useState([])

  const navigate = useNavigate()
  const location = useLocation()
  console.log(document.referrer)

  return (
    <ThemeContextProvider>
      <AppContext.Provider value={{
        userName, setUserName, clickFn, setClickFn, isAnimiDone, setIsAnimiDone, savedPostArr, setSavedPostArr,
        postArr, setPostArr,
        needUpdateArr, setNeedUpdateArr,
        needReduceArr, setNeedReduceArr,
      }}>

        <Container disableGutters={true} fixed={false} maxWidth={window.innerWidth >= 3000 ? false : "lg"} >
          <CssBaseline />



          <Routes>
            <Route path="/" element={<><TopBar /><MainPage /></>} />
            <Route path="/person/:personName" element={
              <>
                <Button onClick={function () {

                  navigate("/")
                }}>Home</Button>
                <ContentPerson />
              </>
            } />
          </Routes>

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

  const { userName, clickFn, } = useAppContext()

  const userAvatarSrc = "data:image/svg+xml;base64," + btoa(multiavatar(userName))
  const avatarString = multiavatar(userName)
  let avatarColor = avatarString.match(/#[a-zA-z0-9]*/)[0]
  if (avatarColor.length < 7) {
    avatarColor = "#" + avatarColor[1] + avatarColor[1] + avatarColor[2] + avatarColor[2] + avatarColor[3] + avatarColor[3]
  }
  const bgcolor = hexToRGB(avatarColor, 0.2)

  const theme = useTheme()

  const [settingOn, setSettingOn] = useState(false)


  //const navigate = useNavigate()
  //const location = useLocation()
  //const isMainPage = Boolean(matchPath("/", location.pathname))


  return (
    <Paper sx={{
      bgcolor: theme.isLight ? bgcolor : hexToRGB2(avatarColor, 0.6), padding: "4px", my: "8px", mx: "4px", display: "flex", alignItems: "center",
      justifyContent: "center",


    }}>
      <Box sx={{
        padding: "4px", borderRadius: "1000px", bgcolor: "background.default", width: "fit-content",
        transition: "transfrom, 300ms",

      }}>
        <Avatar src={userAvatarSrc} sx={{ width: "2.4rem", height: "2.4rem" }} />
      </Box>

      <Box sx={{
        //bgcolor: "background.default",
        width: "60%", maxWidth: "600px",
        color: theme.palette.text.secondary,
        //   bgcolor: "pink",
        transition: "all 300ms",
        mx: "8px",
      }}>
        <Box sx={{
          bgcolor: "background.default", borderRadius: "8px", width: "100%", maxWidth: "600px",
          color: theme.palette.text.secondary, px: "8px",
          height: "calc( 2.4rem + 4px )", display: "flex", alignItems: "center"
        }}
          onClick={clickFn}
        >
          <Typography sx={{ fontSize: theme.sizeObj, color: theme.palette.text.default, display: "inline-block" }}>{userName} ....</Typography>
        </Box>

        <Collapse unmountOnExit={false} in={settingOn}>
          <Box direction="row" spacing={2} sx={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>


            <RadioGroup
              row
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              value={theme.sizeObj[0]}
              onChange={function (e) {
                const sizeValue = e.target.value

                theme.setSizeObj({ xs: sizeValue, sm: sizeValue, md: sizeValue, lg: sizeValue, xl: sizeValue })
              }}
            >
              <FormControlLabel value="1rem" control={<Radio />} label="xs" sx={{ "& span": { fontSize: "1rem" } }} checked={Boolean(theme.sizeObj.xs === "1rem")} />
              <FormControlLabel value="1.25rem" control={<Radio />} label="sm" sx={{ "& span": { fontSize: "1.25rem" } }} checked={theme.sizeObj.sm === "1.25rem"} />
              <FormControlLabel value="1.5rem" control={<Radio />} label="md" sx={{ "& span": { fontSize: "1.5rem" } }} checked={theme.sizeObj.md === "1.5rem"} />
              <FormControlLabel value="1.75rem" control={<Radio />} label="lg" sx={{ "& span": { fontSize: "1.75rem" } }} checked={theme.sizeObj.lg === "1.75rem"} />
              <FormControlLabel value="2rem" control={<Radio />} label="xl" sx={{ "& span": { fontSize: "2rem" } }} checked={theme.sizeObj.xl === "2rem"} />
            </RadioGroup>
            <Switch
              //   sx={{ position: "absolute", right: -10 }}
              checked={!theme.isLight}
              onChange={function (event) {
                event.target.checked
                  ? theme.setMode("dark")
                  : theme.setMode("light")
              }}
            />
          </Box>


        </Collapse>




      </Box>

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
            setSettingOn(pre => !pre)
          }}
        >
          <SettingsIcon sx={{ color: theme.palette.background.default, }} fontSize='large' />
        </Avatar>
      </Box>

    </Paper >
  )
}
