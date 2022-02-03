import React, { useEffect, useState, useRef, useMemo, useContext, useCallback } from 'react';
import { EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, AtomicBlockUtils } from 'draft-js';

import { ThemeProvider, useTheme, createTheme } from '@mui/material/styles';

import { Container, Grid, Paper, IconButton, ButtonGroup, Stack, Box, Button, Typography, Slider } from '@mui/material';
import { KeyboardArrowUpIcon } from "@mui/icons-material"

import { Context } from "./ContextProvider";
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage';

import { Crop, DoneRounded, Close, AddCircleOutline } from '@mui/icons-material';


import useResizeObserver from '@react-hook/resize-observer';


export default function VoteBlock() {


  return (
    <h1>
voteBlock
    </h1>

  )


}