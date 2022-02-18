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


//import multiavatar from '@multiavatar/multiavatar';

import multiavatar from '@multiavatar/multiavatar';
import { url, toPreHtml, hexToRGB, hexToRGB2 } from "./config";
import { Context } from "./ContextProvider"


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

export function AvatarChip({ name = "aaa", inTab = 0, index = 0, avatarScale = 1.2, textScale = 0.8, title = false, inList = false, boxShadow = 0, insertMention = () => { }, ...props }) {

  const theme = useTheme()

  const avatarString = multiavatar(name)
  let avatarColor = avatarString.match(/#[a-zA-z0-9]*/)[0]
  if (avatarColor.length < 7) {
    avatarColor = "#" + avatarColor[1] + avatarColor[1] + avatarColor[2] + avatarColor[2] + avatarColor[3] + avatarColor[3]
  }

  const bgcolor = hexToRGB(avatarColor, 0.2)

  return (<Chip
    key={index}
    clickable={true}
    avatar={
      <Avatar alt={name}
        {...{ src: "data:image/svg+xml;base64," + btoa(avatarString) }}
        sx={{
          "&.MuiAvatar-root.MuiChip-avatar": {
            width:title?"2.4rem":theme.scaleSizeObj(avatarScale),
            height:title?"2.4rem":theme.scaleSizeObj(avatarScale),
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

      backgroundColor: inTab === index
        ? theme.palette.mode === "light"
          ? inList ? hexToRGB(avatarColor, 0.2) : hexToRGB2(avatarColor, title ? 0.0001 : 0.2)
          : inList ? hexToRGB(avatarColor, 0.6) : hexToRGB2(avatarColor, title ? 0.0001 : 0.6)

        : theme.palette.panelColor,

      height: title?"2.4rem":theme.scaleSizeObj(avatarScale),
      fontSize: theme.scaleSizeObj(textScale),
      boxShadow,
      "&:hover": {
        //    boxShadow: 5,
        backgroundColor: inList ? hexToRGB(avatarColor, 1) : hexToRGB2(avatarColor, 1),  //hexify(hexToRgbA3(multiavatar(name).match(/#[a-zA-z0-9]*/)[0])),
      },
      "& .MuiChip-label": {
        transform: "translateY(0px)",
        ...title && { color: theme.palette.text.secondary },
      }
    }}
    onClick={function () {

    }}
    onMouseDown={function () {

      insertMention(name)
    }}


  />
  )

}




