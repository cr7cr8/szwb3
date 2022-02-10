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



export function ContextProvider({ editorState:editorStateProp, setEditorState:setEditorStateProp, ...props }) {

  let [editorState, setEditorState] = useEditorState()

  if (editorStateProp && setEditorStateProp) {
    editorState = editorStateProp
    setEditorState = setEditorStateProp
  }


  const [peopleList, setPeopleList] = useState(["TonyCerl", "JimWil", "大发发", "Jimberg", "m大Gsd哈"])


  const [currentBlockKey, setCurrentBlockKey] = useState("ddd")

  const theme = useTheme()


  const [imageObj, setImageObj] = useState({})


  const [voteArr, setVoteArr] = useState([])
  const [voteTopic, setVoteTopic] = useState("")
  const [pollDuration, setPollDuration] = useState({ d: 3, h: 0, m: 0 })


  const imageBlockNum = editorState.getCurrentContent().getBlocksAsArray().filter(block => block.getType() === "imageBlock").length

  useEffect(function () {


    editorState.getCurrentContent().getBlocksAsArray().forEach(block => {



      if (block.getType() === "voteBlock") {
        const blockKey = block.getKey()



        let es = null

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
          Immutable.Map({ voteDataObj: { voteArr, voteTopic, pollDuration } })
        )

        es = EditorState.push(es || editorState, newContent, 'change-block-data');
        if (es) {
          setEditorState(es)
        }
      }

    })





  }, [voteArr, voteTopic, pollDuration])




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


      voteArr, setVoteArr,
      voteTopic, setVoteTopic,
      pollDuration, setPollDuration,
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