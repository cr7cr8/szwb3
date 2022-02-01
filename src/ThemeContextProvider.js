import React, { createContext, useEffect, useState, useReducer, useRef, useMemo, useCallback, useLayoutEffect, useContext, Component } from 'react';
import {
  EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw,
  RichUtils, Modifier, convertFromHTML, AtomicBlockUtils
} from 'draft-js';

import { ThemeProvider, useTheme, createTheme,  } from '@mui/material/styles';

import { Button, CssBaseline, Switch } from '@mui/material';
import { arrowFunctionExpression } from '@babel/types';






export default function ThemeContextProvider(props) {

  const [sizeObj, setSizeObj] = useState(props.sizeObj || { xs: "5rem", sm: "4rem", md: "3rem", lg: "1.5rem", xl: "1.5rem" })


  const scaleSizeObj = useCallback((factor = 1) => {
    const obj = {}
    Object.keys(sizeObj).forEach(itemKey => {

      const num = Number(sizeObj[itemKey].replace(/[^\d\.]/g, '')) * factor
      const unit = String(sizeObj[itemKey].replace(/[\d\.]/g, ''))
      obj[itemKey] = num + unit

    })

    return obj
  }, [])


  const addingSizeObj = useCallback((numOfPix = 0) => {
    const obj = {}
    Object.keys(sizeObj).forEach(itemKey => {

      //  const num = Number(sizeObj[itemKey].replace(/[^\d\.]/g, '')) * factor
      //  const unit = String(sizeObj[itemKey].replace(/[\d\.]/g, ''))
      obj[itemKey] = `calc(${sizeObj[itemKey]} ${numOfPix >= 0 ? "+" : "-"} ${Math.abs(numOfPix)}px)`

    })

    return obj
  }, [])



  const [mode, setMode] = React.useState('light');
  const myTheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          panelColor: mode === "light" ? "lightgray" : "darkgray",
          mentionBg: mode === "light" ? "aliceblue" : "skyblue",
        },
        sizeObj,
        setMode,
        scaleSizeObj,
        addingSizeObj,


      }),
    [mode],
  );

  return (

    <ThemeProvider theme={myTheme}>
      <CssBaseline />
      {props.children}
    </ThemeProvider>


  )


}