import React, { createContext, useEffect, useState, useReducer, useRef, useMemo, useCallback, useLayoutEffect, useContext, Component } from 'react';

import { EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, AtomicBlockUtils } from 'draft-js';

import { stateToHTML } from 'draft-js-export-html';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2, } from 'react-html-parser';
import reactElementToJSXString from 'react-element-to-jsx-string';


import { ThemeProvider, useTheme, createTheme, styled, } from '@mui/material/styles';

import Immutable from "immutable"

import { AvatarChip } from "./PeopleList"

import { Container, Grid, Paper, Typography, Box, Chip, Avatar, Link, Button, LinearProgress, Stack, IconButton, Divider, Collapse } from '@mui/material';
import {
  EmojiEmotions, FormatSize, FormatAlignLeft, FormatAlignCenter, FormatAlignRight, StackedBarChart, HorizontalSplitOutlined,
  ChatBubbleOutline, Reply, MoreHoriz, Edit, BubbleChart, DeleteOutline
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
  const { userName, } = useAppContext()


  const bgcolor = hexToRGB2(avatarColor, 0.2)

  const [commentArr, setCommentArr] = useState([])

  const loadComments = useCallback(function () {
    const beforeTime = commentArr.length > 0 ? commentArr[commentArr.length - 1].postingTime : ""

    axios.get(`${url}/api/comment/${postID}/${beforeTime}`)
      .then(response => {

        // console.log(response.data)
        setCommentArr(pre => {
          return uniqByKeepFirst([...pre, ...response.data], function (item) { return item.commentID })
        })
      })

  }, [commentArr])


  // useEffect(function () {
  //  alert(newKey)
  // }, [newKey])



  useEffect(function () {
    loadComments()
  }, [])

  const addOneSubComment = useCallback(function (commentID) {
    setCommentArr(pre => {
      const comment = pre.find(item => item.commentID === commentID)
      comment.subCommentNum = comment.subCommentNum ? (comment.subCommentNum + 1) : 1
      return [...pre]
    })
  }, [commentArr])


  const minusOneSubComment = useCallback(function (commentID) {
    setCommentArr(pre => {
      const comment = pre.find(item => item.commentID === commentID)
      comment.subCommentNum = comment.subCommentNum ? (comment.subCommentNum - 1) : 0
      return [...pre]
    })
  }, [commentArr])

  const deleteComment = function (commentID) {


    setCommentArr(pre => {
      return pre.filter(comment => comment.commentID !== commentID)
    })

  }



  const [incomingSubComment, setIncomingSubComment] = useState("")

  useEffect(function () {

    if (preHtmlEditor?.content) {
      setCommentArr(pre => {
        return uniqByKeepFirst([preHtmlEditor, ...pre], function (item) { return item.commentID })
      })
    }

  }, [preHtmlEditor])



  const [tabIndex, setTabIndex] = useState(999)
  const [unmountEditor, setUnmountEditor] = useState(true)


  const [commentIDSet, setCommentIDSet] = useState(new Set())



  return (
    <Box className="comment-sector"
      sx={{
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
          const { commentID, content, ownerName, postingTime, subCommentNum } = comment



          return (
            <React.Fragment key={commentID}>
              <Divider sx={{ marginBottom: "4px", ...(index === 0) && { display: "none" } }} />
              <Box className="bar" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0px" }}>


                <Box sx={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
                  <AvatarChip name={ownerName} avatarScale={1.2} textScale={0.8} boxShadow={0} title={true} />
                  <PostingTime postingTime={postingTime} />

                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <IconButton size="small" onClick={function () {
                    setTabIndex(pre => { return pre === index ? 999 : index })
                    setUnmountEditor(false)
                  }}>
                    <Reply fontSize='medium' />
                  </IconButton>

                  <IconButton size="small"
                    sx={{ ...(userName !== ownerName) && { display: "none" } }}

                    onClick={function () {
                      axios.post(`${url}/api/comment/delete`, { commentID }).then(response => {
                        console.log(response.data)
                        deleteComment(commentID)
                        setCommentCount(pre => { return Math.max(0, pre - 1) })

                      })
                    }}>
                    <DeleteOutline fontSize='medium' />
                  </IconButton>

                  <IconButton size="small"
                    onClick={function () {

                      setCommentIDSet(pre => {

                        pre.has(commentID)
                          ? pre.delete(commentID)
                          : pre.add(commentID)

                        return new Set([...pre])
                      })

                    }}
                  >
                    <ChatBubbleOutline fontSize='medium' />
                    <Typography sx={{ fontSize: "1rem !important", color: theme.palette.text.secondary }}>&nbsp;{subCommentNum || 0}</Typography>
                  </IconButton>




                </Box>
              </Box>



              <Box sx={{
                marginLeft: theme.scaleSizeObj(0),
                //  bgcolor,
                bgcolor: "transparent",
                // bgcolor:theme.palette.divider
                boxShadow: 0,
                marginBottom: "4px",
                paddingLeft: "4px",
                paddingRight: "4px",
                flexGrow: 1,
              }}>
                {toHtml(content, { theme })}
              </Box>




              <Collapse in={tabIndex === index} unmountOnExit={unmountEditor}>
                <Box sx={{
                  borderRadius: "4px", overflow: "visible", marginTop: "0px", marginBottom: "4px",
                  //    marginLeft: theme.scaleSizeObj(1.2),
                }}>
                  <SimpleDraftProvider postID={postID} userName={userName} subCommentEditor={true} commentID={commentID}
                    openEditor={tabIndex === index}
                    onSubmit={function (newSubComment) {

                      console.log(newSubComment)

                      setTabIndex(999)

                      setIncomingSubComment(newSubComment)

                      setCommentIDSet(pre => {
                        pre.add(commentID)
                        return new Set([...pre])
                      })

                      addOneSubComment(commentID)
                    }}

                  />
                </Box>
              </Collapse>



              <Collapse unmountOnExit={false} in={commentIDSet.has(commentID)}>
                <SubCommentSector commentID={commentID} PostingTime={PostingTime} toHtml={toHtml} bgcolor={bgcolor}
                  incomingSubComment={incomingSubComment}
                  setIncomingSubComment={setIncomingSubComment}
                  subCommentNum={subCommentNum}
                  minusOneSubComment={minusOneSubComment}
                  userName={userName}
                />
              </Collapse>






            </React.Fragment>

          )

        })

        }

        {(commentArr.length < commentCount) && <Button variant='clear' fullWidth={true} sx={{ color: theme.palette.text.secondary }} onClick={loadComments} >
          Comments {commentArr.length}/{commentCount}
        </Button>
        }
      </Box>


    </Box>
  )
}

function SubCommentSector({ commentID, userName, PostingTime, toHtml, bgcolor, incomingSubComment, setIncomingSubComment, subCommentNum, minusOneSubComment, ...props }) {

  const theme = useTheme()
  const [subCommentArr, setSubCommentArr] = useState([])

  const loadSubComments = useCallback(function () {
    const beforeTime = subCommentArr.length > 0 ? subCommentArr[subCommentArr.length - 1].postingTime : ""

    axios.get(`${url}/api/subComment/${commentID}/${beforeTime}`)
      .then(response => {

        //   console.log(response.data)
        setSubCommentArr(pre => {
          return uniqByKeepFirst([...pre, ...response.data], function (item) { return item.subCommentID })
        })
      })

  }, [subCommentArr])

  function deleteSubComment(subCommentID) {


    setSubCommentArr(pre => {
      return pre.filter((item) => item.subCommentID !== subCommentID)
    })

  }


  useEffect(function () {
    loadSubComments()
  }, [])


  useEffect(function () {
    if ((incomingSubComment) && (incomingSubComment?.commentID === commentID)) {
      setSubCommentArr(pre => {
        return uniqByKeepFirst([incomingSubComment, ...pre], function (item) { return item.subCommentID })
      })
      setIncomingSubComment("")
    }
  }, [incomingSubComment])


  return (
    <>
      {subCommentArr.map(subComment => {
        const { subCommentID, content, ownerName, postingTime, commentID } = subComment;


        return (
          <Paper
            key={subCommentID}
            sx={{
              //   marginLeft: theme.scaleSizeObj(1.2),
              bgcolor,
              boxShadow: 0,
              marginBottom: "4px",
              paddingLeft: "4px",
              paddingRight: "4px",
            }}>
            <Box sx={{ display: "flex", alignItems: "center", paddingTop: "2px", paddingBottom: "2px" }}>
              <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
                <AvatarChip name={ownerName} avatarScale={1.2} textScale={0.8} boxShadow={0} title={true} />
                <PostingTime postingTime={postingTime} />
              </Box>
              <IconButton size="small" sx={{
                ...(ownerName !== userName) && { display: "none" }

              }} onClick={function () {
                axios.post(`${url}/api/subComment/delete`, { subCommentID }).then(response => {
                  //console.log(response.data)
                  deleteSubComment(subCommentID)
                  minusOneSubComment(commentID)
                  //    setCommentCount(pre => Math.max(0, pre - 1))
                })
              }}>
                <DeleteOutline fontSize='medium' />
              </IconButton>



            </Box>
            {/* <Divider /> */}
            {toHtml(content, { theme })}
          </Paper>
        )


      })}
      <Button variant='clear' fullWidth={true} sx={{
        color: theme.palette.text.secondary,
        textTransform: "none",
        ...(subCommentArr.length >= (subCommentNum)) && { display: "none" }
      }}
        onClick={function () {

          loadSubComments()

        }}
      >
        <MoreHoriz fontSize='medium' />{subCommentArr.length}/{subCommentNum}
      </Button>



    </>





  )


}



function uniqByKeepFirst(a, key) {
  let seen = new Set();
  return a.filter(item => {
    let k = key(item);
    return seen.has(k) ? false : seen.add(k);
  });
}
