import React, { createContext, useEffect, useState, useReducer, useRef, useMemo, useCallback, useLayoutEffect, useContext, Component } from 'react';

import { EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, AtomicBlockUtils } from 'draft-js';

import { stateToHTML } from 'draft-js-export-html';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2, } from 'react-html-parser';
import reactElementToJSXString from 'react-element-to-jsx-string';


import { ThemeProvider, useTheme, createTheme, styled, } from '@mui/material/styles';

import Immutable from "immutable"

import { AvatarChip } from "./PeopleList"

import { Container, Grid, Paper, Typography, Box, Chip, Avatar, Link, Button, LinearProgress, Stack, IconButton } from '@mui/material';
import {
  EmojiEmotions, FormatSize, FormatAlignLeft, FormatAlignCenter, FormatAlignRight, StackedBarChart, HorizontalSplitOutlined,
  ChatBubbleOutline
} from '@mui/icons-material';



import useResizeObserver from '@react-hook/resize-observer';


import { blue, red, grey } from '@mui/material/colors';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';


import axios from "axios";
import { url, toPreHtml, hexToRGB, hexToRGB2, useScreenState } from "./config";
import { compareAsc, format, formatDistanceToNow } from 'date-fns';
import { zhCN } from "date-fns/locale";
import Countdown from "react-countdown";
import multiavatar from "@multiavatar/multiavatar";
import useAppContext from './useAppContext';

import CommentSector from './CommentSector';
import Masonry from '@mui/lab/Masonry';
//import Masonry from 'react-masonry-css';

function toHtml(preHtml, { theme, target, size, setSize, avatarColor, postID }) {

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
          return <Images key={index} imgDataArr={data.imgDataArr} allImageArr={allImageArr} target={target} size={size} setSize={setSize} postID={postID} />
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
        return <VoteFrame data={data} blockKey={blockKey} avatarColor={avatarColor} postID={postID} key={index} />
      }

      //  return null
    }
  })


}




export default function Content({ postArr, setPostArr, ...props }) {

  const theme = useTheme()
  const { userName } = useAppContext()

  const [size, setSize] = useState()

  const screenState = useScreenState()

  const col = { xs: 1, sm: 1, md: 2, lg: 3, xl: 4 }[screenState]

  const finalCol = Math.min(col, postArr.length)


  useEffect(function () {

    axios.get(`${url}/api/article`).then(response => {
      setPostArr(response.data.sort((itemA, itemB) => {
        return Date.parse(itemA.postingTime) >= Date.parse(itemB.postingTime) ? -1 : 1
      }))
    })

  }, [])


  return (
    <Box sx={{
      display: "flex", justifyContent: "center", fontSize: theme.sizeObj,
      // backgroundColor: ["pink", "orange", "skyblue", "yellow", "green"][col],
      //  bgcolor: theme.palette.mode === "light" ? "lightgray" : "darkgray",
      // bgcolor:  theme.isLight?"rgba(255,255,255,1)":"rgba(18,18,18,1)",  //theme.palette.background.default,  //"rgba(100,123,254,0.8)",

      overflow: "hidden",
      "& p": { fontSize: theme.sizeObj }
    }}
    // ref={target}
    >
      <Masonry columns={finalCol} spacing={finalCol === 1 ? 1 : 1} >
        {postArr.map((item, index) => {

          const { content, postID, ownerName } = item
          return (
            <PostFrame
              key={postID}
              postID={postID}
              item={item}
              size={size}
              setSize={setSize}
              isFirstOne={index === 0}
            />
          )
        })}
      </Masonry>
    </Box >
  )


}



export function PostFrame({ preHtml, item, size, setSize, isFirstOne, ...props }) {
  const theme = useTheme()
  const target = useRef(null)

  const { content, postID, ownerName, postingTime } = item



  const avatarString = multiavatar(ownerName)


  let avatarColor = avatarString.match(/#[a-zA-z0-9]*/)[0]

  if (avatarColor.length < 7) {
    avatarColor = "#" + avatarColor[1] + avatarColor[1] + avatarColor[2] + avatarColor[2] + avatarColor[3] + avatarColor[3]
    //  avatarColor = "#fffaf6"
  }


  useEffect(function () {
    if (isFirstOne) {
      const resizeObserver = new ResizeObserver(entries => {
        setSize(entries[0].contentRect)
      })

      resizeObserver.observe(target.current)

      return function () { resizeObserver.disconnect() }
    }


  }, [])


  const [height, setHeight] = useState("auto")

  const [position, setPosition] = useState("relative")

  return (
    <Box
      id={postID}
      sx={{
        bgcolor: theme.isLight ? hexToRGB(avatarColor, 0.2) : hexToRGB2(avatarColor, 0.6),// randomBgcolor,//theme.palette.background.paper,// randomBgcolor,
        boxShadow: 3,
        "& > div:not(.image-frame):not(.vote-frame):not(.title-line)": {
          paddingLeft: "4px",
          paddingRight: "4px",
        },

        // "&:hover": { bgcolor: hexToRGB(avatarColor, 0.2) },
        transition: "all, 300ms",


        //  "&:hover": { boxShadow: 7 },
        //  transition: "box-shadow, 300ms",
        wordWrap: "break-word",
        height,
        overflow: "hidden",
        position,
        //position: "relative",
        //transition:"height, 1000ms"

        //transform: `rotate(${Math.random() * 90}deg)`,

      }}

      onClick={function () {

        //  setHeight(pre => { return Number(100 + Math.random() * 600).toFixed(0) + "px" })

      }}

      ref={target}>
      {/* <Box className="title-line" sx={{ padding: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}> */}
      <Stack className="title-line" direction="row" sx={{ padding: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}    >


        <AvatarChip name={ownerName} avatarScale={1.2} textScale={0.8} boxShadow={0} title={true} />
        <Countdown date={Date.parse(postingTime)} intervalDelay={1 * 1000}
          renderer={function ({ days, hours, minutes, seconds, completed, ...props }) {
            return <PostTimeRender  {...{ days, hours, minutes, seconds, completed, ...props }} />
          }}
          overtime={true}
        />

      </Stack>

      {toHtml(content, { theme, target, size, setSize, avatarColor, postID })}


      <CommentSector item={item} position={position} setPosition={setPosition} />

    </Box>
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


export function Images({ imgDataArr, allImageArr, target, size, setSize, postID, ...props }) {

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
      onCloseRequest={() => { setIsOpen(false); }}
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


export function VoteFrame({ data, avatarColor, postID, ...props }) {

  const theme = useTheme()
  const { userName } = useAppContext()

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
      setIsVotting((!whoVoted.includes(userName)) && (Date.parse(expireTime) - Date.now()) > 0)


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



  return (
    <Box className="vote-frame" sx={{ "& p": { fontSize: theme.scaleSizeObj(1) }, "& .count-down": { fontSize: "1rem" } }} >
      {voteTopic && <Typography variant='body2' sx={{ textAlign: "center" }} >{voteTopic || "no"}</Typography>}

      {voteArr.map((choice, index) => {


        return (
          <Box sx={{
            position: "relative",


            ...isVotting && {
              "& > span": { bgcolor: theme.palette.action.disabledBackground },
              "& > span > span": { bgcolor: hexToRGB(avatarColor, 0.5), transition: "all, 300ms" },


              "&:hover": {
                cursor: "pointer", transition: "all, 300ms",
                "& > span": { bgcolor: theme.palette.action.disabled },
                "& > span > span": { bgcolor: hexToRGB(avatarColor, 1), transition: "all, 300ms" },
              }
            },

            ...!isVotting && {
              "& > span": { bgcolor: "rgba(0,0,0,0)" },
              "& > span > span": { bgcolor: hexToRGB(avatarColor, 0.5), transition: "all, 300ms" },
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
                position: "absolute", top: "50%", left: 0, zIndex: 100, transform: "translateY(-50%)", display: "block", width: "calc(100% - 64px )",
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
              <Typography variant='body2' sx={{ position: "absolute", top: "50%", right: 0, zIndex: 100, transform: "translateY(-50%)" }}>
                {totalVotes} Votes
              </Typography>
            }
            {
              voteArr.length > 1 &&
              <Typography variant='body2' sx={{ position: "absolute", top: "50%", right: 0, zIndex: 100, transform: "translateY(-50%)" }}>
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


function PostTimeRender({ days, hours, minutes, seconds, completed, ...props }) {

  const theme = useTheme()



  const message = completed

    ? days > 0
      ? `${days} days ago`
      : hours > 0
        ? `${hours} hours ago`
        : minutes > 0
          ? `${minutes} min ago`
          : `${seconds} sec ago`
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
          ? `${minutes}+ minu Left`
          : `${seconds} sec Left`

  return <Box sx={{ display: "flex", justifyContent: "space-between" }}>
    <Typography variant='body2' className="count-down" sx={{ color: theme.palette.text.secondary }}>{message} </Typography>
    <Typography variant='body2' className="count-down" sx={{ color: theme.palette.text.secondary }}>Total {totalVotes} </Typography>
    {/* <Typography variant='body2' className="count-down" sx={{ color: theme.palette.text.secondary }}>{days} {hours} {minutes} {seconds}</Typography>
    <Typography variant='body2' className="count-down">{intervalDelay}</Typography> */}
  </Box>




}








