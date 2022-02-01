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
import { ThemeProvider, useTheme, createTheme } from '@mui/material/styles';


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

        return <AvatarChip name={name} insertMention={insertMention.bind(null, name)} inTab={inTab} index={index} key={index} />

    

      })
      }
    </Stack>

  )

}

export function AvatarChip({ name, inTab = 0, index = 0, isSmall = false, insertMention = () => { }, ...props }) {

  const theme = useTheme()

  return <Chip
    //  key={index}
    clickable={true}
    avatar={
      <Avatar alt={name}
        {...{ src: "data:image/svg+xml;base64," + btoa(multiavatar(name)) }}
        sx={{
          "&.MuiAvatar-root.MuiChip-avatar": {
            width: theme.scaleSizeObj(isSmall ? 0.8 : 1),
            height: theme.scaleSizeObj(isSmall ? 0.8 : 1),
            marginLeft: 0,
            marginRight: theme.scaleSizeObj(-0.3),
            transform: "scale(0.9)",

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
          ? hexify(hexToRgbA(multiavatar(name).match(/#[a-zA-z0-9]*/)[0]))
          : hexify(hexToRgbA2(multiavatar(name).match(/#[a-zA-z0-9]*/)[0]))

        : theme.palette.panelColor,

      height: theme.scaleSizeObj(isSmall?0.8:1),
      fontSize: theme.scaleSizeObj(isSmall?0.8:1),

      "&:hover": {
        boxShadow: 5,
        backgroundColor: hexify(hexToRgbA2(multiavatar(name).match(/#[a-zA-z0-9]*/)[0])),
      },
      "& .MuiChip-label": {
        transform: "translateY(0px)",
      }
    }}
    onClick={function () {

    }}
    onMouseDown={function () {

      insertMention(name)
    }}


  />


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
