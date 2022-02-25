

import { useContext } from 'react';
import { EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, AtomicBlockUtils } from 'draft-js';
import { Container, Grid, Paper, Typography, Box, Avatar } from '@mui/material';
import PeopleList from './PeopleList';

import multiavatar from '@multiavatar/multiavatar';
import { Context } from "./ContextProvider"
import { useTheme } from '@mui/private-theming';

import { AvatarChip } from "./PeopleList";

import useAppContext from './useAppContext';
import { url, toPreHtml, hexToRGB, hexToRGB2, colorArr, colorIndexArr } from "./config";


export default function createPersonPlugin() {

  function personStrategy(contentBlock, callback, contentState) {

    contentBlock.findEntityRanges(
      function (character) {
        const entityKey = character.getEntity();
        return entityKey !== null && contentState.getEntity(entityKey).getType().indexOf("personTag") >= 0
      },
      callback
    );
  }

  function Person({ ...props }) {

    const theme = useTheme()
    const { userName, clickFn, userAvatarUrl, setUserAvatarUrl, avatarNameArr, userColor, userInfoArr, random } = useAppContext()


    const { contentState, entityKey, blockKey, offsetKey, start, end, decoratedText, children, } = props;
    const { mentionHeadKey, mentionBodyKey, person, imgurl, mentionType } = contentState.getEntity(entityKey).getData()

    const blockData = contentState.getBlockForKey(blockKey).getData().toObject()

    const backgroundImage = userName === decoratedText
      ? `url(${userAvatarUrl})`
      : avatarNameArr.includes(decoratedText)
        ? `url(${url}/api/user/downloadAvatar/${decoratedText}/${random})`
        : `url(${"data:image/svg+xml;base64," + btoa(multiavatar(decoratedText))})`


    const cssObj = {
      // backgroundColor: theme.palette.mode === "light"
      //   ? hexify(hexToRgbA(multiavatar(decoratedText).match(/#[a-zA-z0-9]*/)[0]))
      //   : hexify(hexToRgbA2(multiavatar(decoratedText).match(/#[a-zA-z0-9]*/)[0])),//       "gold",
      display: "inline-block",
      "& span": {

        fontSize: theme.scaleSizeObj(blockData.isSmallFont ? 0.8 : 1),

        wordWrap: "normal",
        transition: "font-size, 300ms"
      },

    }

    const name = decoratedText
    const avatarString = multiavatar(name)
    let avatarColor = ""
    let colorItem = ""

    if (!userColor && (userName === name)) {

      let colorItem = avatarString.match(/#[a-zA-z0-9]*/)[0]
      if (colorItem.length < 7) {
        colorItem = "#" + colorItem[1] + colorItem[1] + colorItem[2] + colorItem[2] + colorItem[3] + colorItem[3]
      }
      avatarColor = theme.isLight ? hexToRGB(colorItem, 0.4) : hexToRGB2(colorItem, 0.6)
    }
    else if (userColor && (userName === name)) {
      const colorItem = colorArr[colorIndexArr.findIndex(item => item === userColor)]
      avatarColor = theme.isLight ? colorItem[200] : colorItem[800]
    }
    else if (userName !== name) {

      const colorName = userInfoArr.find(userItem => userItem.userName === name)?.colorName
      let colorItem = ""
      if (colorName) {
        colorItem = colorArr[colorIndexArr.findIndex(item => item === colorName)]
        avatarColor = theme.isLight ? colorItem[200] : colorItem[800]
      }
      else {
        let colorItem = avatarString.match(/#[a-zA-z0-9]*/)[0]
        if (colorItem.length < 7) {
          colorItem = "#" + colorItem[1] + colorItem[1] + colorItem[2] + colorItem[2] + colorItem[3] + colorItem[3]
        }
        avatarColor = theme.isLight ? hexToRGB(colorItem, 0.4) : hexToRGB2(colorItem, 0.6)
      }
    }



    return (

      <Box //contentEditable={false} suppressContentEditableWarning={true}
        sx={{
          // bgcolor: theme.palette.mode === "light"
          //   ? hexify(hexToRgbA(multiavatar(decoratedText).match(/#[a-zA-z0-9]*/)[0]))
          //   : hexify(hexToRgbA2(multiavatar(decoratedText).match(/#[a-zA-z0-9]*/)[0])),


          bgcolor: avatarColor,
          verticalAlign: "sub",
          backgroundImage,
          // backgroundImage: `url(${"data:image/svg+xml;base64," + btoa(multiavatar(decoratedText))})`,
          backgroundSize: "contain",
          paddingLeft: theme.scaleSizeObj(blockData.isSmallFont ? 1 : 1.2),
          paddingRight: theme.scaleSizeObj(blockData.isSmallFont ? 0.4 : 0.5),
          borderRadius: "1000px",
          backgroundRepeat: "no-repeat",
          display: "inline-block",
          //   backgroundSize: theme.sizeObj,
          backgroundPositionX: "left",
          backgroundPositionY: "center",
          height: theme.scaleSizeObj(blockData.isSmallFont ? 0.8 : 1),
          "& p": {
            verticalAlign: "top",
            lineHeight: 1,
          },
          transition: "height, padding-left, padding-right, 300ms",
        }}
      >

        <Typography sx={cssObj} variant="body2">
          {children}
        </Typography>
      </Box>


    )





    return <Typography sx={cssObj} variant="body2">
      {children}
    </Typography>

  }

  return {

    personPlugin: {

      decorators: [
        {
          strategy: personStrategy,
          component: Person,
        }
      ],

    }
  }

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
