import React, { createContext, useEffect, useState, useReducer, useRef, useMemo, useCallback, useLayoutEffect, useContext, Component } from 'react';
import {
  EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw,
  RichUtils, Modifier, convertFromHTML, AtomicBlockUtils
} from 'draft-js';

import { ThemeProvider, useTheme, createTheme } from '@mui/material/styles';

import { Button, CssBaseline, Switch } from '@mui/material';
import DraftEditor from './DraftEditor';

import Immutable from "immutable";



export const Context = createContext();




export function useEditorState() {
  const [editorState, setEditorState] = useState(EditorState.createEmpty())


  return [editorState, setEditorState]
}



export function ContextProvider({ editorState, setEditorState, ...props }) {





  const [currentBlockKey, setCurrentBlockKey] = useState("ddd")

  const theme = useTheme()

  
  const [peopleList, setPeopleList] = useState(["TonyCerl", "JimWil", "大发发", "Jimberg","m大Gsd哈"])

  


  const [imageObj, setImageObj] = useState({})
  const imageBlockNum = editorState.getCurrentContent().getBlocksAsArray().filter(block => block.getType() === "imageBlock").length

  useEffect(function () {
    let es = null

    Object.keys(imageObj).forEach(blockKey => {

      if (imageObj[blockKey]) {
        //  console.log(editorState.getCurrentContent().getBlockForKey(blockKey))

        const contentState = editorState.getCurrentContent();
        const currentBlock = contentState.getBlockForKey(blockKey);
        let newSelection = SelectionState.createEmpty(blockKey)
        newSelection = newSelection.merge({
          focusKey: blockKey,
          focusOffset: 0,
          anchorOffset: blockKey,
          anchorOffset: 0,
          hasFocus: false
        });


        const newContent = Modifier.setBlockData(
          editorState.getCurrentContent(),
          newSelection,//  SelectionState.createEmpty(newKey),
          Immutable.Map({ imgDataArr: imageObj[blockKey] })
        )

        es = EditorState.push(es || editorState, newContent, 'change-block-data');
      }
    })
    if (es) {
      setEditorState(es)
    }


  }, [imageObj])


  return (

    <Context.Provider value={{
      editorState, setEditorState,
      // sizeObj, setSizeObj,
      peopleList, setPeopleList,
      currentBlockKey, setCurrentBlockKey,
      imageObj, setImageObj,
      imageBlockNum,
    }}>
      <Switch
        sx={{ left: "92%" }}
        onChange={function (event) {
          event.target.checked
            ? theme.setMode("dark")
            : theme.setMode("light")
        }}
      />

      <DraftEditor />

    </Context.Provider>

  )



}