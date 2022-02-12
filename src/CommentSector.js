import React, { createContext, useEffect, useState, useReducer, useRef, useMemo, useCallback, useLayoutEffect, useContext, Component } from 'react';

import { EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, AtomicBlockUtils } from 'draft-js';

import { stateToHTML } from 'draft-js-export-html';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2, } from 'react-html-parser';
import reactElementToJSXString from 'react-element-to-jsx-string';


import { ThemeProvider, useTheme, createTheme, styled, } from '@mui/material/styles';

import Immutable from "immutable"

import { AvatarChip } from "./PeopleList"

import { Container, Grid, Paper, Typography, Box, Chip, Avatar, Link, Button, LinearProgress, Stack, IconButton, Divider } from '@mui/material';
import {
  EmojiEmotions, FormatSize, FormatAlignLeft, FormatAlignCenter, FormatAlignRight, StackedBarChart, HorizontalSplitOutlined,
  ChatBubbleOutline
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



export default function CommentSector({ item, avatarColor, ...props }) {
  const theme = useTheme()
  const { content, postID, ownerName, postingTime } = item
  const { userName } = useAppContext()
  const editorRef = useRef("a")

  const bgcolor = hexToRGB2(avatarColor, 0.1)

  return (
    <Box className="comment-sector" sx={{

      bgcolor: theme.isLight ? hexToRGB2(avatarColor, 0.1) : hexToRGB2(avatarColor, 0.4),
    }}>


      {/* <Divider /> */}

      <Box sx={{
        //   bgcolor,
        paddingLeft: "4px", paddingRight: "4px",
        paddingBottom: "4px"
      }}>
        <AvatarChip name={userName} avatarScale={1.2} textScale={0.8} boxShadow={0} title={true} />

        <SimpleDraftProvider />
        {/* <SimpleEditor ref={editorRef} postID={postID} /> */}


      </Box>


    </Box>
  )
}
