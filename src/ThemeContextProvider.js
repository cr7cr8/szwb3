import React, { createContext, useEffect, useState, useReducer, useRef, useMemo, useCallback, useLayoutEffect, useContext, Component } from 'react';
import {
  EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw,
  RichUtils, Modifier, convertFromHTML, AtomicBlockUtils
} from 'draft-js';

import { ThemeProvider, useTheme, createTheme, experimental_sx as sx } from '@mui/material/styles';

import { Button, CssBaseline, Switch, Typography } from '@mui/material';
import { arrowFunctionExpression } from '@babel/types';






export default function ThemeContextProvider(props) {


  const [sizeObj, setSizeObj] = useState(props.sizeObj || { xs: "2rem", sm: "5rem", md: "2rem", lg: "1.5rem", xl: "1.5rem" })


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
        mode,
        isLight: mode === "light",
        isDark: mode === "dark",
        components: {
          MuiTypography: {
            styleOverrides: {
              root: ({ ownerState, theme, ...props }) => {
               //alert(JSON.stringify(props))
                return [
                  ownerState.variant === 'body2' &&
                  sx({
                    fontSize: theme.sizeObj,
                  }),

                ]
              }
            }
          },
          MuiButton:{
            defaultProps:{
              variant:"contained",
              disableRipple:false,
            }
          },
          MuiPaper:{
            defaultProps:{

            },

            styleOverrides: {
              root: ({ ownerState, theme, ...props }) => {
             
                return [
                //  ownerState.variant === 'body2' &&
                  sx({
                    fontSize: theme.sizeObj,
                  }),

                ]
              }
            }
          }

        }
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