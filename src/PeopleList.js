import { useContext, useEffect } from 'react';
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

import { ThemeProvider, useTheme, createTheme } from '@mui/material/styles';


//import multiavatar from '@multiavatar/multiavatar';

import multiavatar from '@multiavatar/multiavatar';

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


  return (

    <Stack direction="column" spacing={0.2} sx={{
      width: "fit-content", position: "absolute",  // bgcolor: theme.palette.action.disabledBackground,
      boxShadow: 3,
      //  position: "absolute",
      //  index: 200
      ...(blockType === "rightBlock") && { transform: "translateX(calc(-100% + 2rem) )" },
      ...(blockType === "centerBlock") && { transform: "translateX(calc(-50% + 2rem) )" },
    }}

      component={function (props) {
        return (
          <div {...props} contentEditable={false} suppressContentEditableWarning={true}
            style={{ backgroundColor: theme.palette.action.disabledBackground, }} />
        )
      }}
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
  const avatarColor = avatarString.match(/#[a-zA-z0-9]*/)[0]


  const bgcolor = hexToRGB(avatarColor, 0.2)

  return (<Chip
    key={index}
    clickable={true}
    avatar={
      <Avatar alt={name}
        {...{ src: "data:image/svg+xml;base64," + btoa(avatarString) }}
        sx={{
          "&.MuiAvatar-root.MuiChip-avatar": {
            width: theme.scaleSizeObj(avatarScale),
            height: theme.scaleSizeObj(avatarScale),
            marginLeft: 0,
            marginRight: "-8px",// theme.scaleSizeObj(-0.3),
            //transform: "scale(0.9)",

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

      height: theme.scaleSizeObj(avatarScale),
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



function hexToRGB(hex, alpha) {
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return hexify("rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")");
  } else {
    return hexify("rgb(" + r + ", " + g + ", " + b + ")");
  }
}

function hexToRGB2(hex, alpha) {
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  } else {
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }
}