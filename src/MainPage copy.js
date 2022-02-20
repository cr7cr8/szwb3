import React, { useState, useRef, useEffect, useLayoutEffect, useContext, useCallback, createContext, useMemo } from 'react';

import logo from './logo.svg';
import './App.css';


import ThemeContextProvider from "./ThemeContextProvider";
import { ContextProvider as EditorCtx } from "./ContextProvider";
import Content, { InstantContent } from "./Content";


import { BrowserRouter, Route, Routes, Link, useNavigate, useHistory } from "react-router-dom";


import { Container, Grid, Paper, IconButton, ButtonGroup, Stack, Box, Chip, Avatar } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import SettingsIcon from '@mui/icons-material/Settings';

import { AvatarChip } from "./PeopleList"
import useAppContext from './useAppContext'
import {
  EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw,
  RichUtils, Modifier, convertFromHTML, AtomicBlockUtils
} from 'draft-js';
import multiavatar from '@multiavatar/multiavatar'
import { url, toPreHtml, hexToRGB, hexToRGB2 } from "./config";

import { ThemeProvider, useTheme, createTheme, styled, } from '@mui/material/styles';


export default function MainPage() {


  const { userName, setUserName, clickFn, setClickFn, isAnimiDone, setIsAnimiDone, savedPostArr, setSavedPostArr, postArr, setPostArr } = useAppContext()

  const [open, setOpen] = useState(false)
  const [savedEditorState, setSavedEditorState] = useState()
  const [savedImageObj, setSavedImageObj] = useState()


  const [savedVoteArr, setSavedVoteArr] = useState()
  const [savedVoteTopic, setSavedVoteTopic] = useState()
  const [savedPollDuration, setSavedPollDuration] = useState()



  const userAvatarSrc = "data:image/svg+xml;base64," + btoa(multiavatar(userName))
  const avatarString = multiavatar(userName)
  let avatarColor = avatarString.match(/#[a-zA-z0-9]*/)[0]
  if (avatarColor.length < 7) {
    avatarColor = "#" + avatarColor[1] + avatarColor[1] + avatarColor[2] + avatarColor[2] + avatarColor[3] + avatarColor[3]
  }
  const bgcolor = hexToRGB(avatarColor, 0.2)

  const theme = useTheme()

  const navigate = useNavigate()




  useEffect(function () {

    setClickFn(pre => (function () { setOpen(true) }))




    return function () {

      setClickFn(null)

    }

  }, [])

  return (
    <>



      {/* <Paper sx={{
        bgcolor: theme.isLight ? bgcolor : hexToRGB2(avatarColor, 0.6), padding: "4px", my: "8px", mx: "4px", display: "flex", alignItems: "center",
        justifyContent: "center",

        // transform: `scale(${open ? 0 : 1})`,
        // transition: "all, 300ms",
      }}>
        <Box sx={{ padding: "4px", borderRadius: "1000px", bgcolor: "background.default", width: "fit-content", }}>
          <Avatar src={userAvatarSrc} sx={{ width: "2.4rem", height: "2.4rem" }} />
        </Box>

        <Box sx={{
          bgcolor: "background.default", borderRadius: "8px", width: "60%", mx: "8px", maxWidth: "600px", height: "calc( 2.4rem + 4px)",
          color: theme.palette.text.secondary, px: "8px"
        }}
          onClick={function () {

            setOpen(true)

          }}

        ></Box>

        <Link to={`/person/${userName}`} target="_blank">
          <Box sx={{
            padding: "4px", borderRadius: "1000px", bgcolor: "background.default", width: "fit-content",
          }}>
            <Avatar sx={{
              width: "2.4rem", height: "2.4rem",
              bgcolor: theme.isLight ? bgcolor : hexToRGB2(avatarColor, 0.6),
              "&:hover": { bgcolor: avatarColor, cursor: "pointer" }
            }}
            //</Box> onClick={function () {
            //  window.open("/person", '_blank')
            //  navigate(1)
            //  }}
            >
              <SettingsIcon sx={{ color: theme.palette.background.default, }} fontSize='large' />
            </Avatar>
          </Box>
        </Link>
      </Paper> */}






      <Content postArr={postArr} setPostArr={setPostArr} userName={userName}


      />

      <Dialog

        onBackdropClick={function () { setOpen(false) }}
        fullWidth={true}
        //  fullScreen={true}
        open={open}
        onClose={function () {



        }}
        scroll={"body"}
        sx={{
          overflow: "visible",

          "& > div > div": { overflow: "visible", paddingTop: "8px", }
        }}
      >
        <Grid container
          direction="row"
          justifyContent="space-around"
          alignItems="flex-start"
          spacing={0}
          sx={{}}
        >
          <Grid item xs={10} sm={10} md={10} lg={10} xl={10} sx={{}}>
            <EditorCtx

              userName={userName}
              open={open}

              savedImageObj={savedImageObj}
              setSavedImageObj={setSavedImageObj}

              savedEditorState={savedEditorState}
              setSavedEditorState={setSavedEditorState}

              {...{
                savedVoteArr, setSavedVoteArr,
                savedVoteTopic, setSavedVoteTopic,
                savedPollDuration, setSavedPollDuration
              }}

              onSubmit={function (preHtml) {
                // console.log(preHtml)
                setPostArr(pre => {

                  pre.unshift(preHtml)
                  return [...pre]
                  //  return [preHtml, ...pre]
                })
                setOpen(false)
              }} />
          </Grid>
        </Grid>

      </Dialog>
    </>
  )
}