import { useContext, useEffect, useState, useRef } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';

import Typography from '@mui/material/Typography';

import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';

import { ThemeProvider, useTheme, createTheme } from '@mui/material/styles';

import {
  BrowserRouter, Route, Routes, useRoutes, Link, useParams, matchPath, useLocation, useNavigate

} from "react-router-dom";

//import multiavatar from '@multiavatar/multiavatar';

import multiavatar from '@multiavatar/multiavatar';

import { url, toPreHtml, hexToRGB, hexToRGB2, colorArr, colorIndexArr } from "./config";
import { Context } from "./ContextProvider";
import useAppContext from "./useAppContext";

export default function PeopleList({ tabIndex, setShowing, setTabName, nameList, insertMention, blockType, ...props }) {




  //const { sizeObj, peopleList } = useContext(Context)




  const inTab = tabIndex % nameList.length


  const theme = useTheme()

  useEffect(function () {


    setShowing(true)

    return function () {
      setShowing(false)
    }

  }, [])

  const [right, setRight] = useState(false)
  const [opacity, setOpacity] = useState(0)
  const anchor = useRef()
  useEffect(function () {
    const { x, width } = anchor.current.getBoundingClientRect()
    if (x + width + 50 > window.innerWidth) {
      setRight(1)
    }

    //console.log(anchor.current.getBoundingClientRect().x, anchor.current.getBoundingClientRect().width, window.innerWidth)
    setOpacity(1)


  }, [])


  const { personName } = useParams()

  return (

    <Stack direction="column" spacing={0.2}
      ref={anchor}
      sx={{
        width: "fit-content", position: "absolute",  // bgcolor: theme.palette.action.disabledBackground,
        boxShadow: 3,
        zIndex: 5000,
        opacity,
        ...Boolean(right) && { right: 0 },

        backgroundColor: theme.palette.action.disabledBackground,//theme.isLight?"lightgray":"darkgray",//theme.palette.action.disabledBackground,
        // ...(blockType === "rightBlock") && { transform: "translateX(calc(-100% + 2rem) )" },
        // ...(blockType === "centerBlock") && { transform: "translateX(calc(-50% + 2rem) )" },
      }}

    // component={function (props) {
    //   return (
    //     <div {...props} contentEditable={false} suppressContentEditableWarning={true}
    //       style={{
    //         backgroundColor: theme.palette.action.disabledBackground,


    //       }} />
    //   )
    // }}
    >


      {nameList.map((name, index) => {

        if (inTab === index) { setTabName(name) }

        return <AvatarChip name={name} insertMention={insertMention.bind(null, name)} inTab={inTab} index={index} key={index} inList={true} />



      })}

    </Stack>

  )

}

export function AvatarChip({ name = "aaa", inTab = 0, index = 0, avatarScale = 1.2, textScale = 0.8, title = false,
  inList = false,
  boxShadow = 0,
  insertMention = () => { },
  ...props }) {

  const theme = useTheme()
  const { userName, clickFn, userAvatarUrl, setUserAvatarUrl, avatarNameArr, userColor, userInfoArr, random } = useAppContext()



  const avatarString = multiavatar(name)
  let avatarColor = ""
  let hoverColor = ""





  if (!userColor && (userName === name)) {

    let colorItem = avatarString.match(/#[a-zA-z0-9]*/)[0]
    if (colorItem.length < 7) {
      colorItem = "#" + colorItem[1] + colorItem[1] + colorItem[2] + colorItem[2] + colorItem[3] + colorItem[3]
    }

    console.log(name, colorItem)
    if (title) {
      avatarColor = "transparent"
      hoverColor = colorItem
    }
    else if (inList && (inTab !== index)) {
      avatarColor = theme.palette.panelColor
      hoverColor = colorItem
    }
    else if (inList && (inTab === index)) {
      avatarColor = theme.isLight ? hexToRGB(colorItem, 0.4) : hexToRGB(colorItem, 0.8)
      hoverColor = colorItem
    }
    else {
      avatarColor = theme.isLight ? hexToRGB(colorItem, 0.4) : hexToRGB2(colorItem, 0.6)
      hoverColor = colorItem
    }

  }
  else if (userColor && (userName === name)) {

    const colorItem = colorArr[colorIndexArr.findIndex(item => item === userColor)]

    if (title) {
      avatarColor = "transparent"
      hoverColor = colorItem[500]

    }
    else if (inList && (inTab !== index)) {
      avatarColor = theme.palette.panelColor
      hoverColor = colorItem[500]
    }
    else if (inList && (inTab === index)) {
      avatarColor = theme.isLight ? colorItem[200] : colorItem[800]
      hoverColor = colorItem[500]
    }
    else {
      avatarColor = theme.isLight ? colorItem[200] : colorItem[800]
      hoverColor = colorItem[500]
    }

  }
  else if (userName !== name) {

    const colorName = userInfoArr.find(userItem => userItem.userName === name)?.colorName
    let colorItem = ""
    if (colorName) {
      colorItem = colorArr[colorIndexArr.findIndex(item => item === colorName)]
      if (title) {
        avatarColor = "transparent"
        hoverColor = colorItem[500]
      }
      else if (inList && (inTab !== index)) {
        avatarColor = theme.palette.panelColor
        hoverColor = colorItem[500]
      }
      else if (inList && (inTab === index)) {
        avatarColor = theme.isLight ? colorItem[200] : colorItem[800]
        hoverColor = colorItem[500]
      }
      else {
        avatarColor = theme.isLight ? colorItem[200] : colorItem[800]
        hoverColor = colorItem[500]
      }
    }
    else{
      let colorItem = avatarString.match(/#[a-zA-z0-9]*/)[0]
      if (colorItem.length < 7) {
        colorItem = "#" + colorItem[1] + colorItem[1] + colorItem[2] + colorItem[2] + colorItem[3] + colorItem[3]
      }

      if (title) {
        avatarColor = "transparent"
        hoverColor = colorItem
      }
      else if (inList && (inTab !== index)) {
        avatarColor = theme.palette.panelColor
        hoverColor = colorItem
      }
      else if (inList && (inTab === index)) {
        avatarColor = theme.isLight ? hexToRGB(colorItem, 0.4) : hexToRGB(colorItem, 0.8)
        hoverColor = colorItem
      }
      else {
        avatarColor = theme.isLight ? hexToRGB(colorItem, 0.4) : hexToRGB2(colorItem, 0.6)
        hoverColor = colorItem
      }


    }

  }




  const avatarSrc = userName == name
    ? userAvatarUrl
    : avatarNameArr.includes(name)
      ? `${url}/api/user/downloadAvatar/${name}/${random}`
      : "data:image/svg+xml;base64," + btoa(avatarString)


  return (


    <ConditionalWrapper condition={!inList} wrapper={function (children) {

      return <Link to={`/person/${name}`} target="_self" style={{ textDecoration: "none" }}> {children}</Link>

    }} >


      <Chip
        key={index}
        clickable={true}
        avatar={
          <Avatar alt={name}
            {...{ src: avatarSrc }}
            sx={{
              "&.MuiAvatar-root.MuiChip-avatar": {
                width: title ? "2.4rem" : theme.scaleSizeObj(avatarScale),
                height: title ? "2.4rem" : theme.scaleSizeObj(avatarScale),
                marginLeft: 0,
                marginRight: "-8px",// theme.scaleSizeObj(-0.3),
                //transform: "scale(0.9)",
                //  minWidth:"2rem",
                //  minHeight:"2rem",
                // marginTop:"8px",
                // marginBottom:"8px",

              }
            }}
          />}
        label={name}
        variant="filled"
        sx={{
          justifyContent: "flex-start",
          borderRadius: "1000px",
          paddingRight: theme.scaleSizeObj(0.25 * 0.85),

          // backgroundColor: inTab === index
          //   ? theme.palette.mode === "light"
          //     ? inList ? hexToRGB(avatarColor, 0.2) : hexToRGB2(avatarColor, title ? 0.0001 : 0.2)
          //     : inList ? hexToRGB(avatarColor, 0.6) : hexToRGB2(avatarColor, title ? 0.0001 : 0.6)

          //   : theme.palette.panelColor,

          bgcolor: avatarColor,


          height: title ? "2.4rem" : theme.scaleSizeObj(avatarScale),
          fontSize: theme.scaleSizeObj(textScale),

          boxShadow,
          "&:hover": {

            //  backgroundColor: inList ? hexToRGB(avatarColor, 1) : hexToRGB2(avatarColor, 1),  //hexify(hexToRgbA3(multiavatar(name).match(/#[a-zA-z0-9]*/)[0])),

            bgcolor: hoverColor
          },
          "& .MuiChip-label": {
            transform: "translateY(0px)",
            ...title && { color: theme.palette.text.secondary },
          }
        }}
        onClick={function () {
          //  navigate(`/person/${name}`)
        }}
        onMouseDown={function () {

          insertMention(name)
        }}
      />

    </ConditionalWrapper >
  )

}


function ConditionalWrapper({ condition, wrapper, children }) {

  return condition ? wrapper(children) : children;
}



function getColor(){



  
}