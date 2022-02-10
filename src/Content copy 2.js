import React, { createContext, useEffect, useState, useReducer, useRef, useMemo, useCallback, useLayoutEffect, useContext, Component } from 'react';

import { EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, AtomicBlockUtils } from 'draft-js';

import { stateToHTML } from 'draft-js-export-html';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2, } from 'react-html-parser';
import reactElementToJSXString from 'react-element-to-jsx-string';


import { ThemeProvider, useTheme, createTheme, styled } from '@mui/material/styles';

import Immutable from "immutable"

import { AvatarChip } from "./PeopleList"

import { Container, Grid, Paper, Typography, Box, Chip, Avatar, Link, Button, LinearProgress } from '@mui/material';

import useMediaQuery from '@mui/material/useMediaQuery';


import useResizeObserver from '@react-hook/resize-observer';
import Masonry from '@mui/lab/Masonry';

import { blue, red } from '@mui/material/colors';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';


import axios from "axios";
import { url, toPreHtml } from "./config";


const useSize = (target) => {


  const [size, setSize] = React.useState()
  React.useEffect(() => {

    if (target.current) {
      setSize(target.current.getBoundingClientRect())
    }
  }, [target])
  // Where the magic happens
  useResizeObserver(target, (entry) => setSize(entry.contentRect))
  //console.log(size)
  return size



}



function toHtml(preHtml, theme, target) {

  // console.log(preHtml)

  const allImageArr = []

  return ReactHtmlParser(preHtml, {
    transform: function transformFn(node, index) {

      if (node.name === "div" && node.attribs["small-font"]) {

        const element = node.children.map((child, index) => {

          if (child.name === "object" && child.attribs["data-type"] === "person-tag") {

            const avatarElement = convertNodeToElement(child)
            const personName = reactElementToJSXString(<>{avatarElement}</>).replace(/(<([^>]*)>)/ig, '').replace(/\s/g, '')

            return <AvatarChip name={personName} key={index} isSmall={true} />
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


        return <Box sx={{
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
            allImageArr.push(img)
          })
        }

        // console.log(data)
        // arr.push({ bg: node.attribs["data-bgiamge"], row: index, node })
        //  console.log(data)

        if (Array.isArray(data.imgDataArr) && data.imgDataArr.length > 0) {
          return <Images imgDataArr={data.imgDataArr} target={target} key={index} allImageArr={allImageArr} />
        }
        else {
          return null
        }

      }
      else if (node.name === "object" && node.attribs["data-type"] === "mention-tag") {


        const element = convertNodeToElement(node)
        const personName = reactElementToJSXString(<>{element}</>).replace(/(<([^>]*)>)/ig, '').replace(/\s/g, '')

        return <Typography variant="body2" key={index}
          sx={{

            display: "inline",
          }}

        >{personName}</Typography>
      }
      else if (node.name === "object" && node.attribs["data-type"] === "person-tag") {

        const element = convertNodeToElement(node)
        const personName = reactElementToJSXString(<>{element}</>).replace(/(<([^>]*)>)/ig, '').replace(/\s/g, '')
        return <AvatarChip name={personName} key={index} />
      }
      else if (node.name === "object" && node.attribs["data-type"] === "vote-block") {

        const data = node.attribs["data-block_data"] ? JSON.parse(unescape(node.attribs["data-block_data"])) : null
        const blockKey = node.attribs["data-block_key"]
        //     console.log(data, blockKey)
        return <VoteFrame data={data} blockKey={blockKey} key={index} />
      }

      //  return null
    }
  })


}



export default function Content({ ...props }) {

  const theme = useTheme()
  const xs = useMediaQuery(theme.breakpoints.only("xs"))
  const sm = useMediaQuery(theme.breakpoints.only("sm"))
  const md = useMediaQuery(theme.breakpoints.only("md"))
  const lg = useMediaQuery(theme.breakpoints.only("lg"))
  const xl = useMediaQuery(theme.breakpoints.only("xl"))

  const col = [1, 1, 2, 3, 4][[xs, sm, md, lg, xl].indexOf(true)]

  const [postArr, setPostArr] = useState([])
  const finalCol = Math.min(col, postArr.length)


  useEffect(function () {

    axios.get(`${url}/api/article`).then(response => {

      console.log(response.data)

      setPostArr(response.data.map(item => item.content))

    })

  }, [])


  return (
    <Box sx={{
      display: "flex", justifyContent: "center", fontSize: theme.sizeObj,
      // backgroundColor: ["pink", "orange", "skyblue", "yellow", "green"][col],
      bgcolor: theme.palette.mode === "light" ? "lightgray" : "darkgray",
      overflow: "hidden",
      "& p": { fontSize: theme.sizeObj }
    }}
    // ref={target}
    >
      <Masonry columns={finalCol} spacing={finalCol === 1 ? 1 : 1} >
        {postArr.map((item, index) => {
          const num = Number(Math.random() * 100).toFixed(0)
          const random1 = Number.parseFloat(Math.random() * 255).toFixed(0)
          const random2 = Number.parseFloat(Math.random() * 255).toFixed(0)
          const random3 = Number.parseFloat(Math.random() * 255).toFixed(0)
          const bgcolor = `rgba(${random1},${random2},${random3},0.2)`

          return (
            <PostFrame preHtml={item} key={index} num={index + 1} bgcolor={bgcolor} />
          )
        })}
      </Masonry>
    </Box >
  )


}


export function InstantContent({ editorState, ...props }) {

  const theme = useTheme()


  const xs = useMediaQuery(theme.breakpoints.only("xs"))
  const sm = useMediaQuery(theme.breakpoints.only("sm"))
  const md = useMediaQuery(theme.breakpoints.only("md"))
  const lg = useMediaQuery(theme.breakpoints.only("lg"))
  const xl = useMediaQuery(theme.breakpoints.only("xl"))

  const col = [1, 1, 2, 3, 4][[xs, sm, md, lg, xl].indexOf(true)]





  const preHtml = toPreHtml(editorState, theme)



  const postArr = [preHtml, preHtml, preHtml, preHtml, preHtml];
  //const postArr = [preHtml, preHtml];
  const finalCol = Math.min(col, postArr.length)




  return (
    <Box sx={{
      display: "flex", justifyContent: "center", fontSize: theme.sizeObj,
      // backgroundColor: ["pink", "orange", "skyblue", "yellow", "green"][col],
      bgcolor: theme.palette.mode === "light" ? "lightgray" : "darkgray",
      overflow: "hidden",
      "& p": { fontSize: theme.sizeObj }
    }}
    // ref={target}
    >
      <Masonry columns={finalCol} spacing={finalCol === 1 ? 1 : 1} >
        {postArr.map((item, index) => {
          const num = Number(Math.random() * 100).toFixed(0)
          const random1 = Number.parseFloat(Math.random() * 255).toFixed(0)
          const random2 = Number.parseFloat(Math.random() * 255).toFixed(0)
          const random3 = Number.parseFloat(Math.random() * 255).toFixed(0)
          const bgcolor = `rgba(${random1},${random2},${random3},0.2)`

          return (
            // <Box sx={{ bgcolor: '#' + (Math.random() * 0xFFFFFF << 0).toString(16) }}>
            //   {toHtml(toPreHtml(editorState), theme, target)}
            // </Box>
            <PostFrame preHtml={item} key={index} num={index + 1} bgcolor={bgcolor} />
          )
        })}
      </Masonry>
    </Box >
  )


}

export function PostFrame({ preHtml, bgcolor, num, ...props }) {
  const theme = useTheme()
  const target = useRef(null)

  const [height, setHeight] = useState("auto")

  return (
    <Box sx={{
      bgcolor,
      boxShadow: 3,
      "& > div:not(.image-frame):not(.vote-frame)": {
        paddingLeft: "4px",
        paddingRight: "4px",
      },



      // "& .image-frame":{
      //   paddingLeft: "0px",
      //   paddingRight: "0px",
      // },
      "&:hover": { boxShadow: 7 },
      transition: "box-shadow, 300ms",
      wordWrap: "break-word",
      height,
      overflow: "hidden",
      position: "relative",
      //  transition:"height, 1000ms"

    }}

      onClick={function () {

        //  setHeight(pre => { return Number(100 + Math.random() * 600).toFixed(0) + "px" })

      }}

      ref={target}>
      {/* <Typography>{num}</Typography> */}
      {toHtml(preHtml, theme, target)}
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
          <Link href={linkAdd} target="_blank" rel="noopener" s
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



export function Images({ imgDataArr, allImageArr, target, ...props }) {

  const theme = useTheme()
  const size = useSize(target)

  // console.log(allImageArr)

  // const imageArr = data.imgDataArr
  const numOfImage = imgDataArr ? imgDataArr.length : 0

  // console.log(numOfImage)

  const height = useMemo(function () {
    const width = size ? size.width : 0
    return [width / 16 * 9, width / 16 * 9, width / 2, width / 3, width / 16 * 9][numOfImage]
  }, [size, numOfImage])



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
  const images = allImageArr.length > 0 ? allImageArr : []

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

  // return (

  //   imgDataArr.map((pic, index) => {
  //     const imageSnap = `${url}/api/picture/downloadPicture/` + (String(pic.imgSnap).substr(String(pic.imgSnap).lastIndexOf("/") + 1)) + ".jpg"
  //     return (<img src={imageSnap} style={{ objectFit: "cover", width: "100%", height: "100%" }} key={index} />)

  //   })

  // )


  return (

    <Box className="image-frame" sx={cssObj}>

      {isOpen && lightBox}
      {imgDataArr.map((pic, index) => {

        //   const imageSnap = pic.imgSnap
        const imageSnap = `${url}/api/picture/downloadPicture/` + (String(pic.imgSnap).substr(String(pic.imgSnap).lastIndexOf("/") + 1)) + ".jpg"


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


    // imageArr.map((img, index) => {

    //   return <img src={img.imgSnap} key={index} style={{ objectFit: "cover" }} key={index} />

    // })
  )

}


export function VoteFrame({ data, ...props }) {

  const theme = useTheme()

  const { voteArr = [], voteTopic = null, pollDuration = null } = data?.voteDataObj || {}


  //console.log(voteArr)

  return (
    <Box className="vote-frame" sx={{ "& p": { fontSize: theme.scaleSizeObj(0.8) } }}>
      {voteTopic && <Typography variant='body2' sx={{ textAlign: "center" }} >{voteTopic || "no"}</Typography>}

      {voteArr.map((choice, index) => {


        return (
          <Box sx={{ position: "relative", "&:hover": { cursor: "pointer", boxShadow: 3, transition: "all, 300ms", opacity: 0.8 } }} key={index} onClick={function () {
            alert("fsdf")
          }}>
            <LinearProgress key={index} variant="determinate" value={Math.min(100, index * 15 + 20)}             //value={Number(Math.random() * 100).toFixed(0)}
              sx={{
                height: theme.scaleSizeObj(1.5), marginBottom: "2px",
                // "& > span":{bgcolor:'orange'},
                // "& >span::after":`{content:'adfsdf'; font-size:'5rem'}`
              }}
            />


            <Typography variant='body2' sx={{ position: "absolute", top: "50%", left: 0, zIndex: 100, transform: "translateY(-50%)" }}>{(choice.length >= 25 ? choice.substring(0, 25) : choice)}</Typography>
            <Typography variant='body2' sx={{ position: "absolute", top: "50%", right: 0, zIndex: 100, transform: "translateY(-50%)" }}>{Math.min(100, (index * 15 + 20)) + "%"}</Typography>


          </Box>
        )




        //  return <Button key={index}>{choice}</Button>

      })}


    </Box>

  )

}







function hexify(color) {
  var values = color
    .replace(/rgba?\(/, '')
    .replace(/\)/, '')
    .replace(/[\s+]/g, '')
    .split(',');
  var a = parseFloat(values[3] || 1),
    r = Math.floor(a * parseInt(values[0]) + (1 - a) * 255),
    g = Math.floor(a * parseInt(values[1]) + (1 - a) * 255),
    b = Math.floor(a * parseInt(values[2]) + (1 - a) * 255);
  return "#" +
    ("0" + r.toString(16)).slice(-2) +
    ("0" + g.toString(16)).slice(-2) +
    ("0" + b.toString(16)).slice(-2);
}

function hexToRgbA(hex) {
  var c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',0.2)';
  }
  throw new Error('Bad Hex');
}

function hexToRgbA2(hex) {
  var c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',0.5)';
  }
  throw new Error('Bad Hex');
}
