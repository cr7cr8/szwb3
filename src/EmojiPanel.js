import React, { useState, useRef, useEffect, useLayoutEffect, useContext } from 'react';

import { EditorState, KeyBindingUtil, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, SelectionState, CharacterMetadata } from 'draft-js';


// import { makeStyles, styled, useTheme, withStyles, withTheme } from '@material-ui/core/styles';
// import { Typography, Button, ButtonGroup, Container, Paper, Avatar, IconButton, Box, Slide } from "@material-ui/core";

// import { height } from '@material-ui/system';
// import { withContext } from "./ContextProvider"

// import classNames from "classnames"

// import PropTypes from 'prop-types';
// import SwipeableViews from 'react-swipeable-views';

// import AppBar from '@material-ui/core/AppBar';
// import Tabs from '@material-ui/core/Tabs';
// import Tab from '@material-ui/core/Tab';

// import { InsertEmoticon, PanToolOutlined, PeopleOutlined, BeachAccessOutlined } from "@material-ui/icons";
import { Button, CssBaseline, Switch, Paper, IconButton, Popover, Typography, Slide, Tabs, Tab, AppBar, Stack, Box, Divider } from '@mui/material';
import { EmojiEmotionsOutlined } from '@mui/icons-material';
import { blue, red } from '@mui/material/colors';
import {
  isMobile,
  isFirefox,
  isChrome,
  browserName,
  engineName,
} from "react-device-detect";

import emojiArr, { emojiRegex } from "./EmojiConfig";
import { useTheme } from '@mui/system';
import { Context } from "./ContextProvider";


export default function EmojiPanel({ insertEmoji, editorRef, ...props }) {

  const theme = useTheme()
  const { editorState, setEditorState, sizeObj } = useContext(Context)
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);


    setTimeout(() => {

      //     const a = EditorState.forceSelection(editorState, editorState.getSelection())
      setEditorState(EditorState.forceSelection(editorState, editorState.getSelection()))
    }, 0);


  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;



  const [tabValue, setTabValue] = React.useState(0);
  const [dataArr, setDataArr] = useState(emojiArr)

  const [emojiIndex, setEmojiIndex] = useState(0)


  return (
    <>


      <IconButton size="small" onClick={handleClick} sx={{alignSelf:"right"}}>

        <EmojiEmotionsOutlined fontSize="large" />
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',

        }}

        sx={{ "& .MuiPaper-root": { height: "300px", width: isChrome ? "28rem" : "33rem", flexDirection: "column", display: "flex", overflow: "hidden" } }}
      >
        <Box style={{ width: "100%", height: "10px", display: "block", flexGrow: 1, wordBreak: "break-all", overflow: "auto" }} >
          {
            dataArr.map((item, index) => {
              if (index !== emojiIndex) { return <React.Fragment key={index}></React.Fragment> }

              let match;
              const arr = [];
              while (match = emojiRegex.exec(item.symbolStr)) {
                const emoji = match[0];
                arr.push(emoji)

              }

              return (
                <React.Fragment key={index}>
                  {/* <Typography variant="body2" sx={{ fontSize: theme.sizeObj }}>dfsdf</Typography> */}
                  {arr.map((item, index) => {

                    return (
                      <IconButton key={index}
                        sx={{ fontSize: "2rem" }}

                        onClick={function () {
                          insertEmoji(item)
                        }}

                      // className={allClassNames}
                      // onClick={function () {
                      //   if (index > 0) {
                      //     setDataArr(pre => {
                      //       pre[0].symbolStr = pre[0].symbolStr.replace(item + " ", "")
                      //       pre[0].symbolStr = item + " " + pre[0].symbolStr
                      //       if (ctx) { setEmojiCtxStr(pre[0].symbolStr) }
                      //       return pre
                      //     })
                      //   }
                      //   insertEmoji(item)
                      // }}
                      >
                        {item}
                      </IconButton>
                    )
                  })}

                </React.Fragment >
              )
            })
          }
        </Box>

        <Divider />

        <Stack direction="row" style={{}}>
          {dataArr.map((item, index) => {

            return <IconButton key={index} sx={{ fontSize: "2rem", width: "2.5rem", height: "2.5rem" }}
              onClick={function () {
                setEmojiIndex(index)
              }}
            >
              {item.category}
            </IconButton>
          })}
        </Stack>


      </Popover>

    </>
  )


}


