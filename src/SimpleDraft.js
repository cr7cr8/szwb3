import React, { useState, useRef, useEffect, useLayoutEffect, useContext, useCallback, createContext, useMemo } from 'react';

import { Context } from "./ContextProvider"

import {
  EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw,
  RichUtils, Modifier, convertFromHTML, AtomicBlockUtils, getDefaultKeyBinding, KeyBindingUtil
} from 'draft-js';

import EditingBlock from "./EditingBlock"


import { Container, Grid, Paper, IconButton, ButtonGroup, Stack, Button, Box } from '@mui/material';
import { ThemeProvider, useTheme, createTheme } from '@mui/material/styles';

import { EmojiEmotions, FormatSize, FormatAlignLeft, FormatAlignCenter, FormatAlignRight, StackedBarChart, HorizontalSplitOutlined } from '@mui/icons-material';

import { blue, red } from '@mui/material/colors';

import Editor from "draft-js-plugins-editor";
import Immutable from 'immutable';

import createMentionPlugin from './MentionPlugin';
import createPersonPlugin from './PersonPlugin';

import createEmojiPlugin from './EmojiPlugin';
//import createImagePlugin from './ImagePlugin';
import createLinkPlugin from './LinkPlugin';
//import createVotePlugin from './VotePlugin';

import axios from "axios";
import { url, toPreHtml } from "./config";

//console.log(createVotePlugin())

const { hasCommandModifier } = KeyBindingUtil;

const { mentionPlugin, taggingMention, checkShowing } = createMentionPlugin()
const { personPlugin } = createPersonPlugin()
const { emojiPlugin, EmojiComp } = createEmojiPlugin()
//const { imagePlugin, markingImageBlock, ImageBlock } = createImagePlugin()
const { linkPlugin } = createLinkPlugin()
//const { votePlugin, markingVoteBlock, VoteBlock } = createVotePlugin()


export default function SimpleDraft({ userName, typeName, ...props }) {

  const theme = useTheme()
  const { editorState, setEditorState, currentBlockKey, setCurrentBlockKey, imageObj, setImageObj, onSubmit } = useContext(Context)


  //const [editorState, setEditorState] = useState(EditorState.createEmpty())

  const editorRef = useRef()

  const [shadowValue, setShadowValue] = useState(0)

  // const [currentBlockKey, setCurrentBlockKey] = useState(null)
  const specialBakcSpace = useRef(false)

  // console.log(theme.isLight)

  const [readOnly, setReadOnly] = useState(false)

  const [postDisable, setPostDisable] = useState(false)

  const [isOnFocus, setIsOnFocus] = useState(false)

  return (
    <>
      <Box style={{
        position: "relative", wordBreak: "break-all", //top: "5vh"
        //   boxShadow: theme.shadows[shadowValue]
      }}

        sx={{
          //  fontSize: theme.sizeObj, 
          bgcolor: 'background.default',
          boxShadow: shadowValue,
          // bgcolor: "transparent",

        }}
      >

        <Editor

          ref={function (element) { editorRef.current = element; }}
          readOnly={readOnly}
          editorState={editorState}
          onChange={(newState) => {

            //  newState = taggingMention(showHint, newState)
            newState.getCurrentContent()

            const selection = newState.getSelection()
            const isCollapsed = selection.isCollapsed()
            const startKey = selection.getStartKey()

            if (specialBakcSpace.current) {
              const newContentState = Modifier.replaceText(newState.getCurrentContent(), newState.getSelection(), "")
              newState = EditorState.push(newState, newContentState, "insert-characters")
              specialBakcSpace.current = false
            }



            isCollapsed && setCurrentBlockKey(startKey)
            //   isCollapsed && tabValue === 3 && setTabValue(false)


            //    setShowFontBar(!newState.getSelection().isCollapsed())



            setEditorState(newState)



          }}
          onFocus={function () {
            setIsOnFocus(true)
            setShadowValue(0)
          }}
          onBlur={function () {
            setIsOnFocus(false)
            setShadowValue(0)


          }}
          plugins={[
            mentionPlugin,
            personPlugin,
            emojiPlugin,
            // imagePlugin,
            linkPlugin,
            // votePlugin,


          ]}

          customStyleFn={function (style, block) {
            const styleNameArr = style.toArray();
            const styleObj = {}

            styleNameArr.forEach(item => {
              if (item === "linkTagOn") {
                styleObj.color = blue[500]
                styleObj.textDecoration = "underline"
              }
              if (item === "linkTagOff") {
                styleObj.color = blue[500]
              }
            })
            if (styleNameArr.length > 0) {
              return styleObj
            }

          }}

          blockRendererFn={function (block) {

            const text = block.getText()
            const data = block.getData().toObject()
            const type = block.getType()
            const blockKey = block.getKey()
            const selection = editorState.getSelection()

            // if (type === "imageBlock") {
            //   return {
            //     component: ImageBlock,
            //     editable: false,
            //     props: {
            //       blockKey,
            //       markingImageBlock,
            //     },
            //   }
            // }
            // else if (type === "voteBlock") {
            //   return {
            //     component: VoteBlock,
            //     editable: false,
            //     props: {
            //       blockKey,
            //       markingVoteBlock,
            //       readOnly,
            //       setReadOnly,
            //     },
            //   }
            // }


          }}



          // blockRenderMap={
          //   Immutable.Map({

          //     "unstyled": {
          //       element: "div",
          //       wrapper: <EditingBlock
          //         editorRef={editorRef}
          //         markingImageBlock={markingImageBlock}
          //         markingVoteBlock={markingVoteBlock}
          //         VoteBlock={VoteBlock}
          //         readOnly={readOnly}
          //         setReadOnly={setReadOnly}
          //       />
          //     },
          //   })
          // }

          blockStyleFn={function (block) {
            const blockText = block.getText()
            const blockData = block.getData().toObject()
            const blockType = block.getType()
            const blockKey = block.getKey()
            const startKey = editorState.getSelection().getStartKey()

            if (blockType === "unstyled") {
              return "unstyled-block"
            }
            // else if (blockType === "smallFontBlock") {
            //   return "small-font-block"
            // }

          }}



          keyBindingFn={function (e, { getEditorState, setEditorState, ...obj }) {
            //return undefined to carry on
            const editorState = getEditorState()
            const selection = editorState.getSelection();

            const startKey = selection.getStartKey()
            const startOffset = selection.getStartOffset()

            const endKey = selection.getEndKey()
            const endOffset = selection.getEndOffset()

            const anchorKey = selection.getAnchorKey()
            const anchorOffset = selection.getAnchorOffset()
            const focusKey = selection.getFocusKey()
            const focusOffset = selection.getFocusOffset()

            const isCollapsed = selection.isCollapsed()
            const isInOrder = !selection.getIsBackward()
            const hasFocus = selection.getHasFocus()

            // console.log(startKey, startOffset, endKey, endOffset, anchorKey, anchorOffset, focusKey, focusOffset, isCollapsed, isInOrder, hasFocus)


            const contentState = editorState.getCurrentContent();
            const allBlocks = contentState.getBlockMap()

            const block = contentState.getBlockForKey(startKey);
            const blockText = block.getText()

            const keyBefore = contentState.getKeyBefore(startKey)
            const blockBefore = contentState.getBlockBefore(startKey)

            const firstBlockKey = allBlocks.slice(0, 1).toArray().shift().getKey()


            if ((e.keyCode === 8) && (isCollapsed) && (blockText.length === 0) && (startOffset === 0) && (startKey !== firstBlockKey)) {

              let newContentState = Modifier.replaceText(contentState, selection, "#")
              let es = EditorState.push(editorState, newContentState, "insert-characters")


              es = deleteBlock2(es, startKey, setEditorState)
              let newSelection = es.getSelection()

              newSelection = newSelection.merge({

                anchorOffset: newSelection.getAnchorOffset() + 0,  //hilight +0   ,not hilight +1
                focusOffset: newSelection.getFocusOffset() + 1
              })

              es = EditorState.forceSelection(es, newSelection)

              specialBakcSpace.current = true

              setCurrentBlockKey(es.getSelection().getStartKey())
              setEditorState(es)

              return "dummy"
            }
            else if ((e.keyCode === 8) && (isCollapsed) && (startOffset === 0) && (startKey !== firstBlockKey)) {
              deleteBlock1(editorState, startKey, setEditorState)
              return ("done")
            }
            else if (checkShowing() && e.keyCode === 38) {
              return undefined
            }
            else if (checkShowing() && e.keyCode === 40) {
              return undefined
            }

            // if ((block.getType() === "imageBlock")) {
            //   return "cancel-delete"
            // }

            else if (e.shiftKey || hasCommandModifier(e) || e.altKey) {
              return getDefaultKeyBinding(e);
            }
            return undefined

          }}

          handleKeyCommand={function (command, editorState, evenTimeStamp, { getEditorState }) {
            // return undefiend and return not-handled will be igonred in handleKeyCommand

            //  const newState = RichUtils.handleKeyCommand(editorState, command);

            if (command === "deletemore") {
              alert("fff")
              //RichUtils.handleKeyCommand(editorState, "deletemore")
              return editorState
              //  alert("dfdf")
            }

            // if (command === "backspace") {    //builtin command when hit backspace if not binded in keypress
            //   //   RichUtils.handleKeyCommand(editorState, "deletemore")
            // }


            if (command === "moveUp" || command === "moveDown") {
              const selection = editorState.getSelection();
              const startKey = selection.getStartKey();
              const endKey = selection.getEndKey();
              const isCollapsed = selection.isCollapsed()


              const upperBlockKey = editorState.getCurrentContent().getKeyBefore(startKey)
              const block = editorState.getCurrentContent().getBlockForKey(command === "moveUp" ? startKey : endKey)
              const lowerBlockKey = editorState.getCurrentContent().getKeyAfter(endKey)

              if ((command === "moveUp" && upperBlockKey) || ((command === "moveDown" && lowerBlockKey))) {

                const adjacentBlock = command === "moveUp"
                  ? editorState.getCurrentContent().getBlockBefore(startKey)
                  : editorState.getCurrentContent().getBlockAfter(endKey)
                const text = adjacentBlock.getText()

                let newSelection = selection.merge({

                  ...isCollapsed && { anchorKey: adjacentBlock.getKey() },
                  ...isCollapsed && { anchorOffset: text ? text.length : 0 },

                  focusKey: adjacentBlock.getKey(),
                  focusOffset: adjacentBlock.getKey() ? text.length : 0,

                  isBackward: false,
                  hasFocus: true,
                })
                //  externalES = EditorState.push(externalES, newContent, "insert-characters");
                let es = EditorState.forceSelection(editorState, newSelection)
                setEditorState(es)
              }
              else if ((command === "moveUp" && !upperBlockKey) || ((command === "moveDown" && !lowerBlockKey))) {

                const text = block.getText()

                let newSelection = selection.merge({
                  anchorKey: block.getKey(),
                  anchorOffset: command === "moveUp" ? 0 : text ? text.length : 0,
                  focusKey: block.getKey(),
                  focusOffset: command === "moveUp" ? 0 : text ? text.length : 0,
                  isBackward: false,
                  hasFocus: true,
                })
                let es = EditorState.forceSelection(editorState, newSelection)
                setEditorState(es)
              }
            }


            if (command === "bold") {

              setEditorState(RichUtils.handleKeyCommand(editorState, command))
            }
            if (command === "italic") {

              setEditorState(RichUtils.handleKeyCommand(editorState, command))
            }
            if (command === "underline") {

              setEditorState(RichUtils.handleKeyCommand(editorState, command))
            }
            return 'not-handled';

          }}

          handleBeforeInput={function (aaa, editorState) {


          }}

          handleReturn={function (e, newState, { getEditorState, setEditorState }) {
            const editorState = newState;// getEditorState()
            const selectionState = editorState.getSelection();
            let contentState = newState.getCurrentContent();
            const block = contentState.getBlockForKey(selectionState.getStartKey());
            //    console.log(block.getType())
            // if (block.getType() === "imageBlock") {
            //   return "handled"
            // }
            // else if (block.getType() === "voteBlock") {
            //   return "handled"
            // }
            // else if (checkShowing()) {
            //   return "handled"
            // }

          }}

        />
       <EmojiComp editorRef={editorRef} typeName="SimpleDraft" />

        {/* <Stack direction="row" sx={{ backgroundColor: theme.isLight ? "rgba(167, 202, 237,1)" : "rgba(72, 101, 124,1)",
         position: "sticky", bottom: 0, justifyContent: "space-between" }}>

          <Stack direction="row" sx={{ width: "10px", flexGrow: 1, }}>

            <IconButton size="small" onClick={function (e) {
              e.preventDefault()
              e.stopPropagation()


              const blockType = editorState.getCurrentContent().getBlockForKey(currentBlockKey).getType()
              if (blockType === "imageBlock") { return }


              const data = editorState.getCurrentContent().getBlockForKey(currentBlockKey).getData().toObject()



              const newContent = Modifier.setBlockData(
                editorState.getCurrentContent(),
                SelectionState.createEmpty(currentBlockKey),
                Immutable.Map({ isSmallFont: !Boolean(data.isSmallFont) })
              )


              const es = EditorState.push(editorState, newContent, 'change-block-data');
              setEditorState(es)

            }} >
              <FormatSize fontSize="large" />
            </IconButton>


            <IconButton size="small" onClick={function () {
              const es = RichUtils.toggleBlockType(
                editorState, 
                "unstyled"
              )
              setTimeout(() => {
                setEditorState(EditorState.forceSelection(es, es.getSelection()))
              }, 0);

            }}>
              <FormatAlignLeft fontSize="large" />
            </IconButton>

            <IconButton size="small" onClick={function () {
              const es = RichUtils.toggleBlockType(
                editorState, 
                "centerBlock"
              )
              setTimeout(() => {
                setEditorState(EditorState.forceSelection(es, es.getSelection()))
              }, 0);
            }}>
              <FormatAlignCenter fontSize="large" />
            </IconButton>

            <IconButton size="small" onClick={function () {
              const es = RichUtils.toggleBlockType(
                editorState, 
                "rightBlock"
              )
              setTimeout(() => {
                setEditorState(EditorState.forceSelection(es, es.getSelection()))
              }, 0);
            }}>
              <FormatAlignRight fontSize="large" />
            </IconButton>

            <IconButton size="small" onClick={function () {
              setEditorState(addEmptyBlock(editorState))
            
            }}>
              <HorizontalSplitOutlined fontSize="large" />
            </IconButton>
          </Stack>

          <EmojiComp editorRef={editorRef} />


        </Stack>


        <Button sx={{ width: "100%", borderRadius: 0 }} disabled={postDisable}

          onClick={function () {
            setPostDisable(true)


            const ownerName = userName || ("User" + String(Math.random()).substring(3, 6))
            const postID = "post" + ownerName + "-" + Date.now()

            const blockTypeArr = []
            const stepPromiseArr = []
            let voteBlockKey = null
            let voteBlockData = null


            editorState.getCurrentContent().getBlocksAsArray().forEach(block => {
              blockTypeArr.push(block.getType())
              if (block.getType() === "voteBlock") {
                voteBlockKey = block.getKey()
                voteBlockData = block.getData().toObject()
              }
            })

            if (blockTypeArr.includes("imageBlock")) {
              const data = new FormData();
              const data2 = new FormData();
              const promiseArr = [];
              const promiseArr2 = [];

              const fileNameArr = []
              const fileNameArr2 = []


              Object.keys(imageObj).forEach(itemKey => {
                imageObj[itemKey].forEach(img => {

                  promiseArr.push(fetch(img.imgSnap)
                    .then(res => {
                      const filename = (String(img.imgSnap).substr(String(img.imgSnap).lastIndexOf("/") + 1)) + "-snap"
                      fileNameArr.push({ filename })
                      return res.blob()
                    })
                  )
                  promiseArr2.push(fetch(img.imgUrl)
                    .then(res => {
                      const filename = (String(img.imgUrl).substr(String(img.imgUrl).lastIndexOf("/") + 1))
                      console.log(filename)
                      fileNameArr2.push({ filename })
                      return res.blob()
                    })
                  )
                })
              })

              const promise = Promise.all(promiseArr)
                .then(blobArr => {
                  blobArr.forEach((file, index) => {
                    data.append("file", new File([file], fileNameArr[index].filename, { type: "image/jpeg" }))
                  })
                  const obj = { ownerName, postID };
                  data.append('obj', JSON.stringify(obj));

                  return axios.post(`${url}/api/picture/uploadPicture`, data, {
                    headers: { 'content-type': 'multipart/form-data' },
                  })
                })
                .then(response => {
                  console.log(response.data)
                  return Promise.all(promiseArr2)
                })
                .then(blobArr => {
                  blobArr.forEach((file, index) => {
                    data2.append("file", new File([file], fileNameArr2[index].filename, { type: "image/jpeg" }))
                  })
                  const obj = { ownerName, postID };
                  data2.append('obj', JSON.stringify(obj));

                  return axios.post(`${url}/api/picture/uploadPicture2`, data2, {
                    headers: { 'content-type': 'multipart/form-data' },
                  })
                })

              stepPromiseArr.push(promise)




            }

            if (blockTypeArr.includes("voteBlock")) {


              const promise = axios.post(`${url}/api/voteBlock`, { ...voteBlockData.voteDataObj, postID, ownerName, }).then(response => {

           


              })
              stepPromiseArr.push(promise)

            }


            Promise.all(stepPromiseArr).then(function () {
              setPostDisable(false)
              const preHtml = toPreHtml(editorState, theme)
              axios.post(`${url}/api/article`,
                {
                  ownerName,

                  content: preHtml,
                  postID,
                  postingTime: Date.now(),
                }).then(response => {
                  setPostDisable(false)

                  setImageObj({})
                  setEditorState(EditorState.createEmpty())

                  onSubmit(response.data)

           


                })


            })

          }}


        > Post</Button> */}

      </Box>


      {/* <div style={{ whiteSpace: "pre-wrap", display: "flex", fontSize: 15 }}>
        <div>{JSON.stringify(editorState.getCurrentContent(), null, 2)}</div>
        <hr />
        <div>{JSON.stringify(convertToRaw(editorState.getCurrentContent()), null, 2)}</div>
      </div> */}
    </>

  )



}



function markingBlockType({ blockKey, blockTypeName, editorState, setEditorState }) {

  let newSelection = SelectionState.createEmpty(blockKey)
  newSelection = newSelection.merge({
    focusKey: blockKey,
    focusOffset: 0,
    anchorOffset: blockKey,
    anchorOffset: 0,
    hasFocus: false
  });



  const newContent = Modifier.setBlockType(
    editorState.getCurrentContent(),
    newSelection,
    blockTypeName,
  );

  editorState = EditorState.push(editorState, newContent, 'change-block-type');

  // if (isDeleting) {
  //   setTimeout(() => {
  //     setEditorState(EditorState.forceSelection(editorState, editorState.getSelection()))
  //   }, 0);

  // }
  //else {
  return setEditorState(editorState)
  //}

};












function deleteBlock1(store, blockKey, setEditorState) {
  // const editorState = store.getEditorState();

  const editorState = store;
  let content = editorState.getCurrentContent();

  const beforeKey = content.getKeyBefore(blockKey);
  const beforeBlock = content.getBlockForKey(beforeKey);
  const beforeBlockText = beforeBlock && beforeBlock.getText();
  // Note: if the focused block is the first block then it is reduced to an
  // unstyled block with no character
  if (beforeBlock === undefined) {
    const targetRange = new SelectionState({
      anchorKey: blockKey,
      anchorOffset: 0,
      focusKey: blockKey,
      focusOffset: 1,
    });
    // change the blocktype and remove the characterList entry with the sticker
    content = Modifier.removeRange(content, targetRange, 'backward');
    content = Modifier.setBlockType(
      content,
      targetRange,
      'unstyled'
    );
    const newState = EditorState.push(editorState, content, 'remove-block');

    // force to new selection
    const newSelection = new SelectionState({
      anchorKey: blockKey,
      anchorOffset: 0,
      focusKey: blockKey,
      focusOffset: 0,
    });
    return EditorState.forceSelection(newState, newSelection);
  }


  //alert(`beforeTextLength ${beforeBlock.getText().length}  anchorKey ${beforeKey}  anchorOffset: ${beforeBlock.getLength()}   focusKey ${blockKey}  `)

  const targetRange = new SelectionState({
    anchorKey: beforeKey,
    anchorOffset: beforeBlock.getLength(),//beforeBlockText && beforeBlockText.length || 0,// beforeBlock.getLength(),
    focusKey: blockKey,
    focusOffset: 0,   // one in colorblock or editingBlock
  });

  content = Modifier.removeRange(content, targetRange, 'backward');
  const newState = EditorState.push(editorState, content, 'remove-block');



  // force to new selection

  const newSelection = new SelectionState({
    anchorKey: beforeKey,
    anchorOffset: beforeBlock.getLength(),
    focusKey: beforeKey,
    focusOffset: beforeBlock.getLength(),
  });


  setEditorState(EditorState.forceSelection(newState, newSelection))



  // return EditorState.acceptSelection(newState, newSelection);
}


function deleteBlock2(store, blockKey) {
  // const editorState = store.getEditorState();

  const editorState = store;
  let content = editorState.getCurrentContent();

  const beforeKey = content.getKeyBefore(blockKey);
  const beforeBlock = content.getBlockForKey(beforeKey);
  const beforeBlockText = beforeBlock && beforeBlock.getText();
  // Note: if the focused block is the first block then it is reduced to an
  // unstyled block with no character
  if (beforeBlock === undefined) {
    const targetRange = new SelectionState({
      anchorKey: blockKey,
      anchorOffset: 0,
      focusKey: blockKey,
      focusOffset: 1,
    });
    // change the blocktype and remove the characterList entry with the sticker
    content = Modifier.removeRange(content, targetRange, 'backward');
    content = Modifier.setBlockType(
      content,
      targetRange,
      'unstyled'
    );
    const newState = EditorState.push(editorState, content, 'remove-block');

    // force to new selection
    const newSelection = new SelectionState({
      anchorKey: blockKey,
      anchorOffset: 0,
      focusKey: blockKey,
      focusOffset: 0,
    });
    return EditorState.forceSelection(newState, newSelection);
  }


  //alert(`beforeTextLength ${beforeBlock.getText().length}  anchorKey ${beforeKey}  anchorOffset: ${beforeBlock.getLength()}   focusKey ${blockKey}  `)

  const targetRange = new SelectionState({
    anchorKey: beforeKey,
    anchorOffset: beforeBlock.getLength(),//beforeBlockText && beforeBlockText.length || 0,// beforeBlock.getLength(),
    focusKey: blockKey,
    focusOffset: 0,   // one in colorblock or editingBlock
  });

  content = Modifier.removeRange(content, targetRange, 'backward');
  const newState = EditorState.push(editorState, content, 'remove-block');



  // force to new selection

  const newSelection = new SelectionState({
    anchorKey: beforeKey,
    anchorOffset: beforeBlock.getLength(),
    focusKey: beforeKey,
    focusOffset: beforeBlock.getLength(),
  });


  //setEditorState(EditorState.forceSelection(newState, newSelection))



  return EditorState.forceSelection(newState, newSelection);
}





const addEmptyBlock = (editorState) => {
  const newBlock = new ContentBlock({
    key: "m" + String(Math.random()).substring(2, 6),
    type: 'unstyled',
    text: '',
    characterList: Immutable.List()
  })

  // console.log(newBlock.key)
  const contentState = editorState.getCurrentContent()
  const newBlockMap = contentState.getBlockMap().set(newBlock.key, newBlock)

  return EditorState.push(
    editorState,
    ContentState
      .createFromBlockArray(newBlockMap.toArray())
      .set('selectionBefore', contentState.getSelectionBefore())
      .set('selectionAfter', contentState.getSelectionAfter())
  )
}