import React, { createContext, useEffect, useState, useReducer, useRef, useMemo, useCallback, useLayoutEffect, useContext, Component } from 'react';

import { EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, AtomicBlockUtils } from 'draft-js';

import { stateToHTML } from 'draft-js-export-html';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2, } from 'react-html-parser';
import reactElementToJSXString from 'react-element-to-jsx-string';
import multiavatar from '@multiavatar/multiavatar';

import { ThemeProvider, useTheme, createTheme, styled } from '@mui/material/styles';

import Immutable from "immutable"

import { AvatarChip } from "./PeopleList"

import { Container, Grid, Paper, Typography, Box, Chip, Avatar } from '@mui/material';

import useMediaQuery from '@mui/material/useMediaQuery';


import useResizeObserver from '@react-hook/resize-observer';
import Masonry from '@mui/lab/Masonry';



const useSize = (target) => {
  const [size, setSize] = React.useState()
  React.useLayoutEffect(() => {


    setSize(target.current.getBoundingClientRect())
  }, [target])
  // Where the magic happens



  useResizeObserver(target, (entry) => setSize(entry.contentRect))
  console.log(size)
  return size
}



function toPreHtml(editorState, theme) {



  const preHtml = stateToHTML(
    editorState.getCurrentContent(),
    {
      defaultBlockTag: "div",

      // blockStyleFn: function (block) {
      //   const styleObj = block.getData().toObject()
      //   return {
      //     style: {

      //     },
      //     attributes: {
      //       ...styleObj.centerBlock && { className: "text-center" },
      //       ...styleObj.rightBlock && { className: "text-right" }
      //     }
      //   } 
      // },

      entityStyleFn: function (entity) {
        const { type, data, mutablity } = entity.toObject()

        //  console.log(type, data, mutablity)

        if (type.indexOf("mention") >= 0) {
          return {
            element: 'object',
            attributes: {
              "data-type": "mention-tag"
            },

          }
        }
        else if (type.indexOf("personTag") >= 0) {
          return {
            element: 'object',
            attributes: {
              "data-type": "person-tag"
            },

          }

        }

      },

      blockStyleFn: function (block) {

        const text = block.getText()
        const data = block.getData().toObject()
        const type = block.getType()
        const key = block.getKey()

        return {
          style: {
            ...(type === "centerBlock") && { textAlign: "center" },  // style will be a string not an object during toHtmll call
            ...(type === "rightBlock") && { textAlign: "right" },


            // ...(data.isSmallFont&&type==="rightBlock")&&{transform:"translateX(10%) scale(0.8) ",backgroundColor:"pink",lineHeight:1},
            // ...(data.isSmallFont&&type==="unstyled")&&{transform:"translateX(-10%) scale(0.8) ",backgroundColor:"pink",lineHeight:1},
            // ...(data.isSmallFont&&type==="centerBlock")&&{transform:"scale(0.8) ",backgroundColor:"pink",lineHeight:1},

            // ...styleObj.centerBlock && { textAlign: "center" },
            // ...styleObj.rightBlock && { textAlign: "right" }

          },
          attributes: {
            ...data.isSmallFont && { "small-font": "small-font" },
            ...(type === "centerBlock") && { "text-align": "center" },
            ...(type === "rightBlock") && { "text-align": "right" },

            // ...styleObj.centerBlock && { className: "text-center" },
            // ...styleObj.rightBlock && { className: "text-right" }
          }
        }


      },


      blockRenderers: {




        imageBlock: function (block) {
          const text = block.getText()
          const data = escape(JSON.stringify(block.getData().toObject()))
          //  console.log(JSON.stringify(block.getData().toObject()))

          //const data = block.getData().toObject()

          const type = block.getType()
          const key = block.getKey()
          return `<object  data-type="image-block"  data-block_key="${key}" data-block_data="${data}" >` + escape(block.getText()) + '</object>'
        },





      },

    }
  )
  return preHtml
}

function toHtml(preHtml, theme, target) {

  // console.log(preHtml)

  return ReactHtmlParser(preHtml, {
    transform: function transformFn(node, index) {

      if (node.name === "div" && node.attribs["small-font"]) {

        const element = node.children.map((child, index) => {

          if (child.name === "object" && child.attribs["data-type"] === "person-tag") {

            const avatarElement = convertNodeToElement(child)
            const personName = reactElementToJSXString(<>{avatarElement}</>).replace(/(<([^>]*)>)/ig, '').replace(/\s/g, '')

            return <AvatarChip name={personName} key={index} isSmall={true} />
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
      else if (node.name === "object" && node.attribs["data-type"] === "image-block") {
        // console.log(node.attribs["data-bgiamge"], index)

        const data = JSON.parse(unescape(node.attribs["data-block_data"]))
        // console.log(data)
        // arr.push({ bg: node.attribs["data-bgiamge"], row: index, node })
        //  console.log(data)

        if (Array.isArray(data.imgDataArr) && data.imgDataArr.length > 0) {
          return <Images imgDataArr={data.imgDataArr} target={target} key={index} />
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

      //  return null
    }
  })


}



const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.palette.text.secondary,
  border: '1px solid black',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));


export default function Content({ editorState, ...props }) {

  const theme = useTheme()
  const target = useRef(null)


  // const size = useSize(target)
  // const [col,setCol] = useState(0)
  // console.log(size&&size.width)

  const xs = useMediaQuery(theme.breakpoints.only("xs"))
  const sm = useMediaQuery(theme.breakpoints.only("sm"))
  const md = useMediaQuery(theme.breakpoints.only("md"))
  const lg = useMediaQuery(theme.breakpoints.only("lg"))
  const xl = useMediaQuery(theme.breakpoints.only("xl"))

  const col = [1, 1, 2, 3, 4][[xs, sm, md, lg, xl].indexOf(true)]
  //const col = col_ ? col_ : 1




  const preHtml = toPreHtml(editorState)

  // console.log(preHtml)

   const postArr = [preHtml, preHtml, preHtml, preHtml, preHtml, preHtml, preHtml, preHtml, preHtml];
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
      ref={target}>
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

  const random1 = Number.parseFloat(Math.random() * 255).toFixed(0)
  const random2 = Number.parseFloat(Math.random() * 255).toFixed(0)
  const random3 = Number.parseFloat(Math.random() * 255).toFixed(0)

  const [height, setHeight] = useState("auto")





  return (
    <Box sx={{
      bgcolor,
      boxShadow: 3,
      "& > div:not(.image-frame)":{
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
        //     setHeight(pre => { return pre === "auto" ? 100 + Math.random() * 500 : "auto" })
        setHeight(pre => { return Number(100 + Math.random() * 600).toFixed(0) + "px" })
        // setHeight(pre => { return "0px" })
      }}

      ref={target}>
      {/* <Typography>{num}</Typography> */}
      {toHtml(preHtml, theme, target)}
    </Box>
  )

}



export function Images({ imgDataArr, target, ...props }) {

  const theme = useTheme()
  const size = useSize(target)



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

  return (

    <Box className="image-frame" sx={cssObj}>

      {imgDataArr.map((pic, index) => {
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


            <img src={pic.imgSnap} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
          </Box>
        )

      })}


    </Box>


    // imageArr.map((img, index) => {

    //   return <img src={img.imgSnap} key={index} style={{ objectFit: "cover" }} key={index} />

    // })
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
