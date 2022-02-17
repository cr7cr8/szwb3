import React, { createContext, useEffect, useState, useReducer, useRef, useMemo, useCallback, useLayoutEffect, useContext, Component } from 'react';

import { EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, AtomicBlockUtils } from 'draft-js';

import { stateToHTML } from 'draft-js-export-html';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2, } from 'react-html-parser';
import reactElementToJSXString from 'react-element-to-jsx-string';


import { ThemeProvider, useTheme, createTheme, styled, } from '@mui/material/styles';

import Immutable from "immutable"

import { AvatarChip } from "./PeopleList"

import { Container, Grid, Paper, Typography, Box, Chip, Avatar, Link, Button, LinearProgress, Stack, IconButton, Divider } from '@mui/material';
import {
  EmojiEmotions, FormatSize, FormatAlignLeft, FormatAlignCenter, FormatAlignRight, StackedBarChart, HorizontalSplitOutlined,
  ChatBubbleOutline, Reply, MoreHoriz,Edit, BubbleChart,
} from '@mui/icons-material';

import { blue, red, grey } from '@mui/material/colors';

import axios from "axios";
import { url, toPreHtml, hexToRGB, hexToRGB2, useScreenState } from "./config";
import { compareAsc, format, formatDistanceToNow } from 'date-fns';
import { zhCN } from "date-fns/locale";
import Countdown from "react-countdown";
import multiavatar from "@multiavatar/multiavatar";
import useAppContext from './useAppContext';
//import { ContextProvider as EditorCtx, useEditorState } from "./ContextProvider";
import { SimpleDraftProvider } from './ContextProvider';



export default function CommentSector({ item, avatarColor, toHtml, PostingTime, commentCount, setCommentCount, preHtmlEditor, ...props }) {
  const theme = useTheme()
  const { content, postID, ownerName, postingTime } = item
  const { userName } = useAppContext()
  const editorRef = useRef("a")

  const bgcolor = hexToRGB2(avatarColor, 0.2)

  const [commentArr, setCommentArr] = useState([])



  const loadComments = useCallback(function () {
    const beforeTime = commentArr.length > 0 ? commentArr[commentArr.length - 1].postingTime : ""

    axios.get(`${url}/api/comment/${postID}/${beforeTime}`)
      .then(response => {
        setCommentArr(pre => {
          return uniqByKeepFirst([...pre, ...response.data], function (item) { return item.commentID })
        })
      })

  }, [commentArr])


  useEffect(function () {
    loadComments()
  }, [])


  useEffect(function () {

    if (preHtmlEditor?.content) {
      setCommentArr(pre => {
        return uniqByKeepFirst([preHtmlEditor, ...pre], function (item) { return item.commentID })
      })
    }

  }, [preHtmlEditor])





  return (
    <Box className="comment-sector" sx={{
      display: "relative",

      bgcolor: theme.isLight ? hexToRGB2(avatarColor, 0.1) : hexToRGB2(avatarColor, 0.4),
    }}
    >


      <Box sx={{



        paddingLeft: "4px", paddingRight: "4px",

        display: "relative",
        ...(commentArr.length > 0) && { paddingBottom: "4px", "& .bar:first-of-type": { paddingTop: "4px" } },
        //    bgcolor: theme.isLight ? hexToRGB2(avatarColor, 0.1) : hexToRGB2(avatarColor, 0.4),
      }}>
     


        {/* <SimpleDraftProvider postID={postID} userName={userName} /> */}


        {commentArr.map((comment, index) => {
          const { commentID, content, ownerName, postingTime } = comment
          const isLast = (index + 1) === commentArr.length
          return (
            <React.Fragment key={commentID}>

              <Box className="bar" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <AvatarChip name={ownerName} avatarScale={1.2} textScale={0.8} boxShadow={0} title={true} />

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <PostingTime postingTime={postingTime} />
                  {/* <IconButton size="small">
                    <Edit fontSize='medium' />
                  </IconButton> */}
                  <IconButton size="small">
                    <ChatBubbleOutline fontSize='medium' />
                    <Typography sx={{ fontSize: "1rem !important", color: theme.palette.text.secondary }}>&nbsp;{3}</Typography>
                  </IconButton>
                </Box>


              </Box>

              <Paper sx={{
                marginLeft: theme.scaleSizeObj(0),
                bgcolor,
                // bgcolor:theme.palette.divider
                boxShadow: 0,
                marginBottom: "4px",
                paddingLeft: "4px",
                paddingRight: "4px",
              }}>
                {toHtml(content, { theme })}

              </Paper>

              <Paper sx={{
                marginLeft: theme.scaleSizeObj(1.2),
                bgcolor,
                // bgcolor:theme.palette.divider
                boxShadow: 0,
                marginBottom: "4px",
                paddingLeft: "4px",
                paddingRight: "4px",
              }}>


                <AvatarChip name={"Fssd"} avatarScale={1.2} textScale={0.8} boxShadow={0} title={true} />
                <Divider />
                {toHtml(content, { theme })}
              </Paper>

              <Paper sx={{
                marginLeft: theme.scaleSizeObj(1.2),
                bgcolor,
                // bgcolor:theme.palette.divider
                boxShadow: 0,
                marginBottom: "4px",
                paddingLeft: "4px",
                paddingRight: "4px",
              }}>


                <AvatarChip name={"Fssd"} avatarScale={1.2} textScale={0.8} boxShadow={0} title={true} />
                <Divider />
                {toHtml(content, { theme })}
              </Paper>

              <Paper sx={{
                marginLeft: theme.scaleSizeObj(1.2),
                bgcolor,
                // bgcolor:theme.palette.divider
                boxShadow: 0,
                marginBottom: "4px",
                paddingLeft: "4px",
                paddingRight: "4px",
              }}>


                <AvatarChip name={"Fsffsd"} avatarScale={1.2} textScale={0.8} boxShadow={0} title={true} />
                <Divider />
                {toHtml(content, { theme })}
              </Paper>

              <Button variant='clear' fullWidth={true} sx={{
                color: theme.palette.text.secondary,
                //   bgcolor,
                textTransform: "none"
              }}
                onClick={function () { }}
              ><MoreHoriz fontSize='medium'/>{commentArr.length}/{commentCount}
              </Button>

            </React.Fragment>

          )

        })

        }

        <Button variant='clear' fullWidth={true} sx={{ color: theme.palette.text.secondary }}
          onClick={loadComments}
        >Comments {commentArr.length}/{commentCount}</Button>

      </Box>


    </Box>
  )
}


function uniqByKeepFirst(a, key) {
  let seen = new Set();
  return a.filter(item => {
    let k = key(item);
    return seen.has(k) ? false : seen.add(k);
  });
}
