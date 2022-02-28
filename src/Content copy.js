import React, { createContext, useEffect, useState, useReducer, useRef, useMemo, useCallback, useLayoutEffect, useContext, Component } from 'react';

import { EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, AtomicBlockUtils } from 'draft-js';

import { stateToHTML } from 'draft-js-export-html';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2, } from 'react-html-parser';
import reactElementToJSXString from 'react-element-to-jsx-string';


import { ThemeProvider, useTheme, createTheme, styled, } from '@mui/material/styles';

import Immutable from "immutable"

import { AvatarChip } from "./PeopleList"

import {
  Container, Grid, Paper, Typography, Box, Chip, Avatar, Link, Button, LinearProgress, Stack, IconButton, Divider, Collapse, Badge,

  CircularProgress, Hidden
} from '@mui/material';
import {
  EmojiEmotions, FormatSize, FormatAlignLeft, FormatAlignCenter, FormatAlignRight, StackedBarChart, HorizontalSplitOutlined,
  ChatBubbleOutline, Edit, DeleteOutline, OpenInFullOutlined, AspectRatioOutlined,
} from '@mui/icons-material';



import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import useResizeObserver from '@react-hook/resize-observer';


import { blue, red, grey } from '@mui/material/colors';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';


import axios from "axios";
import { url, toPreHtml, hexToRGB, hexToRGB2, useScreenState, uniqByKeepFirst, colorArr, colorIndexArr, getColor, getColor3 } from "./config";
import { compareAsc, format, formatDistanceToNow } from 'date-fns';
import { zhCN } from "date-fns/locale";
import Countdown from "react-countdown";
import multiavatar from "@multiavatar/multiavatar";
import useAppContext from './useAppContext';

import CommentSector from './CommentSector';

import Masonry from 'react-masonry-css';
import { SimpleDraftProvider } from './ContextProvider';

import { useInView } from 'react-intersection-observer';



export const ContentContext = createContext()
function useContentContext() {

  return useContext(ContentContext)


}



function toHtml(preHtml, { theme, target, size, setSize, avatarColor, postID, setLightBoxOn, ownerName }) {

  // console.log(preHtml)

  const allImageArr = []

  return ReactHtmlParser(preHtml, {
    transform: function transformFn(node, index) {

      if (node.name === "div" && node.attribs["small-font"]) {

        const element = node.children.map((child, index) => {

          if (child.name === "object" && child.attribs["data-type"] === "person-tag") {

            const avatarElement = convertNodeToElement(child)
            const personName = reactElementToJSXString(<>{avatarElement}</>).replace(/(<([^>]*)>)/ig, '').replace(/\s/g, '')

            return <AvatarChip name={personName} key={index} avatarScale={0.8} textScale={0.8} boxShadow={0} />
          }
          else if (child.name === "span" && child.attribs["data-type"] === "link") {
            const element = convertNodeToElement(child)
            const linkAdd = reactElementToJSXString(<>{element}</>).replace(/(<([^>]*)>)/ig, '').replace(/\s/g, '')

            // return <a href={linkAdd} style={{ color: blue[800], textDecoration:"none" }} >{linkAdd}</a >
            return <LinkTag linkAdd={linkAdd} key={index} />
          }

          return convertNodeToElement(child, index, transformFn)
        })

        //  toHtml(reactElementToJSXString(<>{element}</>),theme,target)

        //  console.log(reactElementToJSXString(<>{element}</>))


        return <Box
          key={index}
          sx={{
            fontSize: theme.scaleSizeObj(0.8),

            ...(node.attribs["text-align"]) && { textAlign: node.attribs["text-align"] }
          }} >
          {/* {toHtml(reactElementToJSXString(<div>{element}</div>), theme, target)} */}
          {element}
        </Box>

      }
      else if (node.name === "span" && node.attribs["data-type"] === "link") {
        const element = convertNodeToElement(node)
        const linkAdd = reactElementToJSXString(<>{element}</>).replace(/(<([^>]*)>)/ig, '').replace(/\s/g, '')

        // return <a href={linkAdd} style={{ color: blue[800], textDecoration:"none" }} >{linkAdd}</a >
        return <LinkTag linkAdd={linkAdd} key={index} />
      }
      else if (node.name === "object" && node.attribs["data-type"] === "image-block") {
        // console.log(node.attribs["data-bgiamge"], index)



        const data = JSON.parse(unescape(node.attribs["data-block_data"]))


        if (data.imgDataArr) {
          data.imgDataArr.forEach(img => {
            //     console.log(img)
            allImageArr.push(img)
          })
        }

        // console.log(data)
        // arr.push({ bg: node.attribs["data-bgiamge"], row: index, node })
        //  console.log(data)

        if (Array.isArray(data.imgDataArr) && data.imgDataArr.length > 0) {
          return <Images key={index} imgDataArr={data.imgDataArr} allImageArr={allImageArr} target={target} size={size} setSize={setSize} postID={postID}
            setLightBoxOn={setLightBoxOn}

          />
        }
        else {
          return null
        }

      }
      else if (node.name === "object" && node.attribs["data-type"] === "mention-tag") {

        const element = convertNodeToElement(node)
        const personName = reactElementToJSXString(<>{element}</>).replace(/(<([^>]*)>)/ig, '').replace(/\s/g, '')

        return <Typography variant="body2" key={index}
          sx={{ display: "inline", }}
        >{personName}</Typography>
      }
      else if (node.name === "object" && node.attribs["data-type"] === "person-tag") {

        const element = convertNodeToElement(node)
        const personName = reactElementToJSXString(<>{element}</>).replace(/(<([^>]*)>)/ig, '').replace(/\s/g, '')
        return <AvatarChip name={personName} key={index} avatarScale={1.2} textScale={0.8} boxShadow={0} />
      }
      else if (node.name === "object" && node.attribs["data-type"] === "vote-block") {

        const data = node.attribs["data-block_data"] ? JSON.parse(unescape(node.attribs["data-block_data"])) : null
        const blockKey = node.attribs["data-block_key"]


        //  console.log(data, blockKey)
        return <VoteFrame data={data} blockKey={blockKey} avatarColor={avatarColor} postID={postID} key={index} ownerName={ownerName} />
      }

      //  return null
    }
  })


}




export default function Content({ ...props }) {

  const theme = useTheme()
  const { userName, savedPostArr, setSavedPostArr, postArr, setPostArr, } = useAppContext()

  const [size, setSize] = useState()
  const [dialogSize, setDialogSize] = useState()

  const breakpointColumnsObj = {
    [theme.breakpoints.values.xs]: 1,
    [theme.breakpoints.values.sm]: 1,
    [theme.breakpoints.values.md]: 2,
    [theme.breakpoints.values.lg]: 3,
    [theme.breakpoints.values.xl]: 4,
    2000: 4, 3000: 5, 4000: 6, 5000: 7, 6000: 8, 7000: 9, 9999999: 10,
  };

  const [isFull, setIsFull] = useState(false)
  const { ref, inView, entry } = useInView({
    /* Optional options */
    threshold: 0.8,
    triggerOnce: false,
    initialInView: true,
    rootMargin: "0px 0px 0px 0px"
  });




  function getSinglePost() {

    if (inView) {
      const beforeTime = postArr.length > 0 ? postArr[postArr.length - 1].postingTime : ""


      axios.get(`${url}/api/article/getOne/${beforeTime}`).then(response => {

        response.data.length === 0
          ? setIsFull(true)
          : setPostArr(pre => { return uniqByKeepFirst([...pre, ...response.data], item => item.postID) })



      })
    }
  }





  useEffect(function () {


    if (inView && (!isFull)) {
      getSinglePost()
    }


  }, [isFull, inView, postArr])


  const [openIndex, setOpenIndex] = useState(-1);
  const [lightBoxOn, setLightBoxOn] = useState(false)



  return (
    <ContentContext.Provider value={{ /*votedArr, setVotedArr, commentChangeArr, setCommentChangeArr*/ }}>
      <Box sx={{
        display: "flex",
        justifyContent: "center",
        fontSize: theme.sizeObj,
        "& p": { fontSize: theme.sizeObj }
      }}

      >


        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >

          {postArr.map((item, index) => {

            const { content, postID, ownerName, newKey } = item
            return (
              <PostFrame
                key={newKey || postID}
                postID={postID}
                item={item}
                size={size}
                setSize={setSize}
                isFirstOne={index === 0}

                index={index}
                setOpen={setOpenIndex}
                setLightBoxOn={setLightBoxOn}

                userName={userName}
                setPostArr={setPostArr}
              />
            )
          })}
        </Masonry>




      </Box >

      <Box
        ref={ref}
        style={{
          padding: theme.spacing(1), margin: "auto", backgroundColor: theme.palette.background.default, width: "100%",
          opacity: Boolean(!isFull) && inView ? 1 : 0,
          display: "flex", justifyContent: "center", alignItems: "center",
          ...(isFull) && { display: "none" }
        }}>
        <CircularProgress size="3rem" sx={{ color: theme.palette.text.secondary }} />
      </Box>

      <Dialog


        onBackdropClick={function () {
          setOpenIndex(-1);
        }}
        fullWidth={true}
        //  fullScreen={true}
        open={openIndex >= 0}
        onClose={function () {

          if (postArr[openIndex].postID) {
            axios.get(`${url}/api/article/findOne/${postArr[openIndex].postID}`).then((response) => {

              setPostArr(pre => {
                return pre.map((post, index) => {
                  if (index !== openIndex) { return post }
                  else {
                    console.log(response.data)
                    return { ...response.data, newKey: Math.random() }
                  }
                })

              })
            })
          }



        }}
        scroll={lightBoxOn ? "paper" : "body"}
        sx={{
          bgcolor: "rgba(0,0,0,0.7)",
          ...lightBoxOn && { bgcolor: "transparent", display: `none` },
          "& > div > div > div": { marginBottom: 0 }
        }}
      >

        {postArr[openIndex] && <PostFrame
          key={postArr[openIndex].newKey || postArr[openIndex].postID}
          postID={postArr[openIndex].postID}
          item={postArr[openIndex]}
          size={dialogSize}
          setSize={setDialogSize}
          isFirstOne={true}

          setOpen={setOpenIndex}

          setLightBoxOn={setLightBoxOn}
          userName={userName}
          setPostArr={setPostArr}

        />}
      </Dialog>


    </ContentContext.Provider>
  )


}



export function PostFrame({ preHtml, item, size, setSize, isFirstOne, userName, setPostArr, setOpen, index = -1, setLightBoxOn, ...props }) {
  const theme = useTheme()
  const target = useRef(null)
  const currentSize = useRef(0)

  const { content, postID, ownerName, postingTime, commentNum, newKey } = item

  const [commentCount, setCommentCount] = useState(commentNum)

  const avatarString = multiavatar(ownerName)


  let avatarColor = avatarString.match(/#[a-zA-z0-9]*/)[0]

  if (avatarColor.length < 7) {
    avatarColor = "#" + avatarColor[1] + avatarColor[1] + avatarColor[2] + avatarColor[2] + avatarColor[3] + avatarColor[3]
    //  avatarColor = "#fffaf6"
  }
  // const bgcolor = theme.isLight ? hexToRGB(avatarColor, 0.2) : hexToRGB2(avatarColor, 0.6)



  const { needUpdateArr, setNeedUpdateArr, needReduceArr, setNeedReduceArr, userInfoArr, userColor } = useAppContext()


  const bgcolor = getColor({ name: ownerName, userName, userInfoArr, userColor, theme })

  useEffect(function () {

    if (needUpdateArr.includes(postID)) {

      let count = 0;
      needUpdateArr.forEach(item => {
        if (item === postID) {
          count++
        }
      })

      needReduceArr.forEach(item => {
        if (item === postID) {
          count--
        }
      })


      // setNeedUpdateArr( needUpdateArr.filter(item => item !== postID))

      setCommentCount(pre => pre + count)




    }

  }, [])

  useEffect(function () {
    if (isFirstOne) {
      const resizeObserver = new ResizeObserver(entries => {
        if (currentSize.current !== entries[0].contentRect.width) {
          currentSize.current = entries[0].contentRect.width
          setSize(entries[0].contentRect)
        }
      })

      resizeObserver.observe(target.current)
      return function () { resizeObserver.disconnect() }
    }


  }, [])


  const [height, setHeight] = useState("auto")


  const [preHtmlEditor, setPreHtmlEditor] = useState()
  const [openEditor, setOpenEditor] = useState(false)
  const [unmountEditor, setUnmountEditor] = useState(true)

  const [openComment, setOpenComment] = useState(false)
  const [unmountComment, setUnmountComment] = useState(true)

  return (
    <Box
      id={postID}

      sx={{

        boxShadow: 3,
        "& > div > div:not(.image-frame):not(.vote-frame):not(.title-line):not(.comment-sector):not(.MuiCollapse-wrapper.MuiCollapse-vertical)": {
          paddingLeft: "4px",
          paddingRight: "4px",
        },

        transition: "all, 300ms",
        wordWrap: "break-word",
        height,
        overflow: "visible",
        position: "relative",

        marginBottom: "8px",
      }}

      onClick={function () { //  setHeight(pre => { return Number(100 + Math.random() * 600).toFixed(0) + "px" })



      }}

      ref={target}>

      <Box sx={{
        bgcolor,
      }}>
        <Stack className="title-line" direction="row" sx={{ padding: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >


          <AvatarChip name={ownerName} avatarScale={1.2} textScale={0.8} boxShadow={0} title={true} />

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Countdown date={Date.parse(postingTime)} intervalDelay={1 * 1000}
              renderer={function ({ days, hours, minutes, seconds, completed, ...props }) {
                return <PostTimeRender  {...{ days, hours, minutes, seconds, completed, ...props }} />
              }}
              overtime={true}
            />
            <IconButton size="small" sx={{ ...(userName !== ownerName) && { display: "none" } }}


              onClick={function () {
                axios.post(`${url}/api/article/delete`, { postID }).then(response => {

                  setPostArr(pre => {

                    return pre.filter(post => post.postID !== postID)

                  })

                })
              }}
            >
              <DeleteOutline fontSize='medium' sx={{ color: theme.palette.text.secondary }} />
            </IconButton>


          </Box>

        </Stack>

        {toHtml(content, { theme, target, size, setSize, avatarColor, postID, setLightBoxOn, ownerName })}


        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>


          <Hidden smDown={true}>
            <IconButton size="small" onClick={function (e) {
              e.preventDefault()
              e.stopPropagation()
              if (index >= 0) {
                setOpen(index)
              }
            }}>
              <AspectRatioOutlined fontSize='medium' sx={{ transform: "scaleX(-1)" }} />
            </IconButton>
          </Hidden>

          <Hidden mdUp={true}>
            <Box></Box>
          </Hidden>

          <Box>
            <IconButton size="small" onClick={function (e) {
              e.preventDefault()
              e.stopPropagation()
              setOpenEditor(pre => !pre)
              setUnmountEditor(false)
            }}>
              <Edit fontSize='medium' />
            </IconButton>

            <IconButton size="small" onClick={function (e) {
              e.preventDefault()
              e.stopPropagation()
              setOpenComment(pre => !pre)
              setUnmountComment(false)
            }}>

              {/* <Badge badgeContent={commentCount}  sx={{ "& > span":{bgcolor:theme.palette.text.secondary,color:"white"}}}> */}
              <ChatBubbleOutline fontSize='medium' />
              {/* </Badge> */}

              <Typography sx={{ fontSize: "1rem !important", color: theme.palette.text.secondary }}>&nbsp;{commentCount}</Typography>
            </IconButton>
          </Box>

        </Box>

      </Box>

      {
        (!unmountEditor) && <Collapse unmountOnExit={unmountEditor} in={openEditor} className="collapse" sx={{ bgcolor, }}  >


          <Box sx={{ width: "calc(100% - 8px)", marginRight: "4px", marginBottom: "4px", marginLeft: "4px", borderRadius: "4px", overflow: "visible", }}>

            <SimpleDraftProvider openEditor={openEditor} postID={postID} userName={userName} bgcolor={bgcolor}
              onSubmit={function (preHtml) {
                //   alert(JSON.stringify(preHtml))
                setPreHtmlEditor(preHtml)
                setCommentCount(pre => pre + 1)

                setOpenEditor(false)
                setUnmountEditor(false)

                setOpenComment(true)
                setUnmountComment(false)

              }}
            />
          </Box>



        </Collapse>
      }

      {
        (!unmountComment) && <Collapse unmountOnExit={unmountComment} in={openComment} className="collapse">
          <CommentSector item={item} avatarColor={bgcolor} toHtml={toHtml} PostingTime={PostingTime} commentCount={commentCount} setCommentCount={setCommentCount}
            preHtmlEditor={preHtmlEditor}
            setCommentCount={setCommentCount}
          />
        </Collapse>
      }
    </Box >
  )

}

export function LinkTag({ linkAdd }) {

  const theme = useTheme()

  // console.log(linkAdd.match(/(\/\/)([a-z0-9\-._~%]+)/))




  const [content, setContent] = useState("")


  return (
    <Box
      component="span"
      target="_blank"
      //  key={index}
      sx={{
        color: theme.isLight ? blue[600] : blue[800],
        cursor: "pointer",
        textDecoration: "none",
        "&:hover": { textDecoration: "underline" }
      }}

      onClick={function (e) {
        setContent(
          <Link href={linkAdd} target="_blank" rel="noopener"
            sx={{
              color: theme.isLight ? blue[600] : blue[800],
              cursor: "pointer",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" }
            }}
          >
            {linkAdd}
          </Link>
        )
      }}
    >
      {content || linkAdd.match(/(\/\/)([a-z0-9\-._~%]+)/)[2]}
    </Box >
  )
}

export function Images({ imgDataArr, allImageArr, target, size, setSize, postID, setLightBoxOn, ...props }) {

  const theme = useTheme()
  const numOfImage = imgDataArr ? imgDataArr.length : 0

  const width = size ? size.width : 0
  const height = [width / 16 * 9, width / 16 * 9, width / 2, width / 3, width / 16 * 9][numOfImage]



  const baseGrid = [
    {
      gridTemplateColumns: "1fr",
      gridTemplateRows: "1fr",
    },
    {
      gridTemplateColumns: "1fr",
      gridTemplateRows: "1fr",
    },
    {
      gridTemplateColumns: "1fr 1fr",
      gridTemplateRows: "1fr",
    },
    {
      gridTemplateColumns: "1fr 1fr 1fr",
      gridTemplateRows: "1fr 1fr",
    },
    {
      gridTemplateColumns: "1fr 1fr",
      gridTemplateRows: "1fr 1fr",
    },
  ][numOfImage]

  const arr = [
    [
      { gridColumn: "1/3", gridRow: "1/3" }
    ],
    [
      { gridColumn: "1/2", gridRow: "1/3" },
      { gridColumn: "2/3", gridRow: "1/3" },
    ],
    [
      { gridColumn: "1/2", gridRow: "1/2" },
      { gridColumn: "2/3", gridRow: "1/2" },
      { gridColumn: "3/4", gridRow: "1/2" },

    ],
    [
      { gridColumn: "1/2", gridRow: "1/2" },
      { gridColumn: "2/3", gridRow: "1/2" },
      { gridColumn: "1/2", gridRow: "2/3" },
      { gridColumn: "2/3", gridRow: "2/3" },
    ]
  ]

  const imageHeight = size
    ? [{ height: 0 }, { height: size.width / 16 * 9 }, { height: size.width / 2 }, { height: size.width / 3 }, { height: size.width / 16 * 9 / 2 }][numOfImage]
    : { height: 0 }

  const cssObj = {
    display: 'grid',
    ...baseGrid,
    // gridTemplateColumns: "1fr 1fr",
    // gridTemplateRows: "1fr 1fr",
    gridGap: "2px",
    position: "relative",

    //   marginTop: "2px",
    //  marginBottom: "2px",
    justifyContent: 'space-around',
    overflow: 'hidden',

    width: "100%",
    height,
    // bgcolor: "pink",

    ...numOfImage > 0 && {
      "& > *:nth-type(1)": {
        position: "relative",
        ...arr[numOfImage - 1][0],
      }
    },
    ...numOfImage > 1 && {
      "& > *:nth-type(2)": {
        position: "relative",
        backgroundColor: "#ffa",
        ...arr[numOfImage - 1][1]
      }
    },
    ...numOfImage > 2 && {
      "& > *:nth-type(3)": {
        position: "relative",
        backgroundColor: "#afa",
        ...arr[numOfImage - 1][2]
      }
    },
    ...numOfImage > 3 && {
      "& > *:nth-type(4)": {
        position: "relative",
        backgroundColor: "#aaf",
        ...arr[numOfImage - 1][3]
      }
    },
    ...numOfImage > 4 && {
      "& > *:nth-type( n + 5 )": {
        display: "none",
      }
    },

  }


  const [photoIndex, setPhotoIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  // useEffect(function () {

  //   console.log(setLightBoxOn)
  //   setTimeout(function () {
  //     setLightBoxOn(isOpen)
  //   }, 0)
  //   // 
  // }, [isOpen])


  const images = allImageArr.length > 0
    ? allImageArr.map(img => {
      return {
        ...img,
        imgSnap: `${url}/api/picture/downloadPicture/` + (String(img.imgSnap).substr(String(img.imgSnap).lastIndexOf("/") + 1)) + "-snap",
        imgUrl: `${url}/api/picture/downloadPicture/` + (String(img.imgUrl).substr(String(img.imgUrl).lastIndexOf("/") + 1)) + ""
      }
    })
    : []



  const lightBox = images.length > 0
    ? <Lightbox
      mainSrc={images[photoIndex]?.imgUrl}
      nextSrc={images[(photoIndex + 1) % images.length]?.imgUrl}
      prevSrc={images[(photoIndex + images.length - 1) % images.length]?.imgUrl}
      onCloseRequest={() => {
        setIsOpen(false);

        setLightBoxOn(false)
      }}
      onMovePrevRequest={() =>
        setPhotoIndex(
          pre => (pre + images.length - 1) % images.length,
        )
      }
      onMoveNextRequest={() =>
        setPhotoIndex(
          pre => (pre + images.length + 1) % images.length,
        )
      }
      onAfterOpen={() => {


        setLightBoxOn(true)
      }
      }

    />
    : <></>


  return (

    <Box className="image-frame" sx={cssObj}>

      {isOpen && lightBox}
      {imgDataArr.map((pic, index) => {

        //   const imageSnap = pic.imgSnap
        const imageSnap = `${url}/api/picture/downloadPicture/` + (String(pic.imgSnap).substr(String(pic.imgSnap).lastIndexOf("/") + 1)) + "-snap"


        return (

          <Box style={{
            // backgroundColor: "pink",
            width: "100%",
            ...imageHeight,
            display: "block",
            position: "relative"
          }}

            key={index}
          >


            <img src={imageSnap} style={{ objectFit: "cover", width: "100%", height: "100%" }}
              onClick={function (e) {

                alert("aa")
                const pos = images.findIndex(function (img) {
                  return img.imgSnap === e.target.src
                })

                if (pos >= 0) {
                  setIsOpen(true)
                  setPhotoIndex(pos)
                }
              }}
            />
          </Box>
        )

      })}

    </Box>


  )

}


export function VoteFrame({ data, avatarColor, postID, ownerName, ...props }) {

  const theme = useTheme()
  const { userName, setUserName,

    needUpdateArr, setNeedUpdateArr, needReduceArr, setNeedReduceArr, userInfoArr, userColor
  } = useAppContext()
  //const { votedArr, setVotedArr } = useContentContext()

  const { voteArr = [], voteTopic = null, pollDuration = null, } = data?.voteDataObj || {}

  const [percentageArr, setPercentageArr] = useState([])
  const [expireTime, setExpireTime] = useState("")

  const [isVotting, setIsVotting] = useState(false)
  const [totalVotes, setTotalVotes] = useState(0)

  //const [intervalDelay, setIntervalDelay] = useState(1 * 1000)

  const voteCountRef = useRef()

  useEffect(function () {


    axios.get(`${url}/api/voteBlock/${postID}`).then(response => {

      const { voteCountArr, expireTime, whoVoted } = response.data

      voteCountRef.current = voteCountArr

      setExpireTime(expireTime)
      //  setIsVotting(((!whoVoted.includes(userName)) && (Date.parse(expireTime) - Date.now()) > 0) && (!votedArr.includes(postID)))
      setIsVotting(((!whoVoted.includes(userName)) && (Date.parse(expireTime) - Date.now()) > 0))

      const totalVotes = voteCountArr.reduce((current, next) => {

        return current + next

      })

      setPercentageArr(
        voteCountArr.map(item => {
          return totalVotes === 0 ? 0 : Number(Number((item / totalVotes) * 100).toFixed(0))
        })
      )
      setTotalVotes(totalVotes)

    })

  }, [])

  // useEffect(function () {
  //   setIsVotting(pre => pre && (!votedArr.includes(postID)))
  // }, [votedArr])



  const bgcolor = getColor3({ name: ownerName, userName, userInfoArr, userColor, theme })


  return (
    <Box className="vote-frame" sx={{ "& p": { fontSize: theme.scaleSizeObj(1) }, "& .count-down": { fontSize: "1rem" } }} >
      {voteTopic && <Typography variant='body2' sx={{ textAlign: "center" }} >{voteTopic || "no"}</Typography>}

      {voteArr.map((choice, index) => {


        return (
          <Box sx={{
            position: "relative",


            ...isVotting && {
              "& > span": { bgcolor: theme.palette.action.disabledBackground },
              "& > span > span": {
                bgcolor,
                //bgcolor: hexToRGB(avatarColor, 0.5),
              //  transition: "all, 300ms",
              //  opacity:0.6,
              },
              "&:hover": {
                cursor: "pointer", transition: "all, 300ms",
                "& > span": { bgcolor: theme.palette.action.disabled },
                "& > span > span": {
                  bgcolor,
                //  bgcolor: hexToRGB(avatarColor, 1),
              //    transition: "all, 300ms",
              //    opacity:1,
                },
              }
            },

            ...!isVotting && {
              "& > span": { bgcolor: "rgba(0,0,0,0)" },
              "& > span > span": {
                bgcolor:
                  bgcolor,
                // hexToRGB(avatarColor, 0.5), transition: "all, 300ms"
              },
            }





          }} key={index}
            onClick={function () {
              //   isVotting && alert("fsdf")
              if (isVotting && voteCountRef.current) {

                voteCountRef.current[index]++;
                let totalVotes_ = totalVotes + 1

                setPercentageArr(voteCountRef.current.map(item => {
                  return Number(Number((item / totalVotes_) * 100).toFixed(0))
                })
                )
                setTotalVotes(totalVotes_)
                setIsVotting(false)
                axios.put(`${url}/api/voteBlock`, { choicePos: index, userName, postID, })
                //   setVotedArr(pre => [...pre, postID])
              }

            }}>
            <LinearProgress key={index} variant="determinate" value={percentageArr.length === 0 ? 0 : percentageArr[index]}  // value={Math.min(100, index * 15 + 20)}             //value={Number(Math.random() * 100).toFixed(0)}
              sx={{
                height: theme.scaleSizeObj(1.5), marginBottom: "2px",
              }}
            />

            <Typography variant='body2'
              alt="sdfsddf"
              sx={{
                position: "absolute", top: "50%", left: 4, zIndex: 100, transform: "translateY(-50%)", display: "block", width: "calc(100% - 64px )",
                //bgcolor: "yellow", 
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
              {(choice.length >= 25 ? choice.substring(0, 25) : choice)}
            </Typography>
            {/* <Typography variant='body2' sx={{ position: "absolute", top: "50%", right: 0, zIndex: 100, transform: "translateY(-50%)" }}>{Math.min(100, (index * 15 + 20)) + "%"}</Typography> */}
            {
              voteArr.length === 1 &&
              <Typography variant='body2' sx={{ position: "absolute", top: "50%", right: 4, zIndex: 100, transform: "translateY(-50%)" }}>
                {totalVotes} Votes
              </Typography>
            }
            {
              voteArr.length > 1 &&
              <Typography variant='body2' sx={{ position: "absolute", top: "50%", right: 4, zIndex: 100, transform: "translateY(-50%)" }}>
                {percentageArr.length === 0 ? 0 : percentageArr[index] + "%"}
              </Typography>
            }

          </Box>
        )

      })}
      {
        expireTime && <Countdown date={Date.parse(expireTime)} intervalDelay={1 * 1000}
          renderer={function ({ days, hours, minutes, seconds, completed, ...props }) {
            return <TimeRender  {...{ days, hours, minutes, seconds, completed, expireTime, totalVotes, ...props }} />
          }}

          onComplete={function () {
            setIsVotting(false)
          }}
          overtime={true}

        />
      }

    </ Box >

  )

}

function PostingTime({ postingTime }) {


  return (

    <Countdown date={Date.parse(postingTime)} intervalDelay={1 * 1000}
      renderer={function ({ days, hours, minutes, seconds, completed, ...props }) {
        return <PostTimeRender  {...{ days, hours, minutes, seconds, completed, ...props }} />
      }}
      overtime={true}
    />

  )

}



function PostTimeRender({ days, hours, minutes, seconds, completed, ...props }) {

  const theme = useTheme()



  const message = completed

    ? days > 0
      ? `${days}d`
      : hours > 0
        ? `${hours}h`
        : minutes > 0
          ? `${minutes}m`
          : `0m`//`${seconds}s`//`Just now` //`${seconds} sec ago`
    : days > 0
      ? `Remaining ${days}+ days`
      : hours > 0
        ? `Remaining ${hours}+ hours`
        : minutes > 0
          ? `Remaining ${minutes}+ minutes`
          : `Remaining ${seconds} seconds`

  return <Typography variant='body2' className="count-down" style={{ fontSize: "1rem" }} sx={{ color: theme.palette.text.secondary }}>{message} </Typography>

}

function TimeRender({ days, hours, minutes, seconds, completed, expireTime, totalVotes, ...props }) {

  const theme = useTheme()



  const message = completed
    //  ? `Finished on ${format(Date.parse(expireTime), "yyyy-MM-dd hh:mm")}`
    ? days > 0
      ? `Closed ${days} days ago`
      : hours > 0
        ? `Closed ${hours} hours ago`
        : minutes > 0
          ? `Closed ${minutes} min ago`
          : `Closed ${seconds} sec ago`
    : days > 0
      ? `${days}+ days Left`
      : hours > 0
        ? `${hours}+ hours Left`
        : minutes > 0
          ? `${minutes}+ min Left`
          : `${seconds} sec Left`

  return <Box sx={{ display: "flex", justifyContent: "space-between", paddingLeft: "4px", paddingRight: "4px" }}>
    <Typography variant='body2' className="count-down" sx={{ color: theme.palette.text.secondary }}>{message} </Typography>
    <Typography variant='body2' className="count-down" sx={{ color: theme.palette.text.secondary }}>Total {totalVotes} </Typography>
    {/* <Typography variant='body2' className="count-down" sx={{ color: theme.palette.text.secondary }}>{days} {hours} {minutes} {seconds}</Typography>
    <Typography variant='body2' className="count-down">{intervalDelay}</Typography> */}
  </Box>




}


