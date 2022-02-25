import React, { createContext, useEffect, useState, useReducer, useRef, useMemo, useCallback, useLayoutEffect, useContext, Component } from 'react';
import {
  EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw,
  RichUtils, Modifier, convertFromHTML, AtomicBlockUtils
} from 'draft-js';

import { ThemeProvider, useTheme, createTheme } from '@mui/material/styles';

import { Button, CssBaseline, Switch, Slider } from '@mui/material';
import DraftEditor from './DraftEditor';
import SimpleDraft from './SimpleDraft';

import Immutable from "immutable";

import { url, toPreHtml, hexToRGB, hexToRGB2, colorArr, colorIndexArr } from "./config";
import axios from 'axios';

export const Context = createContext();




export function useEditorState(savedEditorState) {
  const [editorState, setEditorState] = useState(savedEditorState || EditorState.createEmpty())



  return [editorState, setEditorState]
}

function usePeopleListState() {

  const [peopleList, setPeopleList] = useState(["UweF23", "UweF22", "TonyCerl", "JimWil", "大发发", "Jimberg", "m大Gsd哈"])

  useEffect(function () {
    axios.get(`${url}/api/user/getAllUser`).then(response => {

      setPeopleList(response.data.map(item => item.userName))

    })

  }, [])


  return [peopleList, setPeopleList]
}



export function ContextProvider({ //editorState: editorStateProp, setEditorState: setEditorStateProp,
  userName,
  onSubmit = function (preHtml) { },
  open,

  savedImageObj,
  setSavedImageObj,
  savedEditorState,
  setSavedEditorState,

  savedVoteArr, setSavedVoteArr,
  savedVoteTopic, setSavedVoteTopic,
  savedPollDuration, setSavedPollDuration,

  ...props }) {


  let [editorState, setEditorState] = useEditorState(savedEditorState)

  const [imageObj, setImageObj] = useState(savedImageObj || {})


  const [voteArr, setVoteArr] = useState(savedVoteArr || [])
  const [voteTopic, setVoteTopic] = useState(savedVoteTopic || "")
  const [pollDuration, setPollDuration] = useState(savedPollDuration || { d: 3, h: 0, m: 0 })



  const [peopleList, setPeopleList] = usePeopleListState()                  //useState(["TonyCerl", "JimWil", "大发发", "Jimberg", "m大Gsd哈"])




  const [currentBlockKey, setCurrentBlockKey] = useState("ddd")




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

  useEffect(function () {
    if (!open) {
      setSavedImageObj(imageObj)
      setSavedEditorState(editorState)

      setSavedVoteArr(voteArr)
      setSavedVoteTopic(voteTopic)
      setSavedPollDuration(pollDuration)


    }


  }, [open])




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
      onSubmit,
    }}>
      {/* <Switch
        sx={{ left: "92%" }}
        onChange={function (event) {
          event.target.checked
            ? theme.setMode("dark")
            : theme.setMode("light")
        }}
      /> */}

      {/* <Slider
        valueLabelDisplay="auto"
        min={1}
        max={2}
        step={0.25}
        marks={true}
        value={scaleValue}
        onChange={(e, value) => {

          theme.setSizeObj({ xs: value + "rem", sm: value + "rem", md: value + "rem", lg: value + "rem", xl: value + "rem" })
          setScaleValue(value)
        }}
        valueLabelFormat={function (numOfMins_) {
          return numOfMins_ + "rem"
        }}
      /> */}

      <DraftEditor userName={userName} />


    </Context.Provider>

  )



}


export function SimpleDraftProvider({ postID, commentID, userName, openEditor, bgcolor, onSubmit, subCommentEditor }) {

  const [peopleList, setPeopleList] = usePeopleListState()
  const [editorState, setEditorState] = useEditorState()
  const [currentBlockKey, setCurrentBlockKey] = useState("ddd")

  return (
    <Context.Provider value={{
      peopleList, setPeopleList,
      editorState, setEditorState,
      currentBlockKey, setCurrentBlockKey
    }}>

      <SimpleDraft postID={postID} commentID={commentID} userName={userName} typeName="SimpleDraft"
        openEditor={openEditor} bgcolor={bgcolor} onSubmit={onSubmit} subCommentEditor={subCommentEditor} />


    </Context.Provider>


  )

}