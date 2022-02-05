import React, { useState, useRef, useEffect, useContext, useCallback, createContext, useMemo } from 'react';

import { genKey, EditorBlock, EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, AtomicBlockUtils } from 'draft-js';
import Editor from "draft-js-plugins-editor";
import Immutable from 'immutable';


import {
  isMobile,
  isFirefox,
  isChrome,
  browserName,
  engineName,
} from "react-device-detect";
import { Context } from './ContextProvider';
import { Container, Grid, Paper, IconButton, ButtonGroup, Stack, Box } from '@mui/material';
import { ImageOutlined, StackedBarChart } from '@mui/icons-material';
import { Scale } from '@mui/icons-material';

import { ThemeProvider, useTheme, createTheme } from '@mui/material/styles';

export default function EditingBlock({ VoteBlock, readOnly, setReadOnly, markingImageBlock, markingVoteBlock, children, ...props }) {

  //const arr = [[props.children[0]]]

  const { currentBlockKey, editorState, imageBlockNum } = useContext(Context)


  const hasVoteBlock = Boolean(editorState.getCurrentContent().getBlocksAsArray().filter(block => {
    return block.getType() === "voteBlock"
  }).length);




  const selection = editorState.getSelection()
  const [anchorKey, anchorOffset, focusKey, focusOffset, isBackward, hasfocus] = editorState.getSelection().toArray()
  const isCollapsed = selection.isCollapsed()

  const block = editorState.getCurrentContent().getBlockForKey(currentBlockKey)//.getText();

  const currentBlockText = block && block.getText()
  const currentBlockType = block && block.getType()


  // console.log(block&&block.getText())
  // console.log(">>>", currentBlockKey)


  const theme = useTheme()

  return (
    < >
      {children.map(block => {

        const blockKey = block.key
        const blockType = editorState.getCurrentContent().getBlockForKey(block.key).getType()
        const blockData = editorState.getCurrentContent().getBlockForKey(block.key).getData().toObject()



        //  console.log(blockData.toObject())

        //   console.log(alignPos)

        const isCurrentRow = (blockKey === currentBlockKey) && (hasfocus) && (isCollapsed)

        if (blockType === "imageBlock") {
          //  return <div className="image-block">{block}</div>
          return <Box key={blockKey} sx={{ "& + &": { paddingTop: "2px" } }}>{block}</Box>
        }
        else if (blockType === "voteBlock") {
          //   return <VoteBlock readOnly={readOnly} setReadOnly={setReadOnly} />
          return <Box key={blockKey} sx={{ "& + &": { paddingTop: "2px" } }}>{block}</Box>


        }
        return (
          <Box

            key={blockKey}
            style={{
              // transition: "box-shadow transform 300ms",
              //  WebkitTransition: "background-color box-shadow transform 300ms",
              // backgroundColor:"yellow"
            }}

            sx={{
              //     boxSizing: "border-box",
              ...(blockData.isSmallFont) && { fontSize: theme.scaleSizeObj(0.8) },
              ...(blockType === "unstyled") && { "& > div": { textAlign: "left", width: "100%" } },
              ...(blockType === "centerBlock") && { "& > div": { textAlign: "center", width: "100%" } },
              ...(blockType === "rightBlock") && { "& > div": { textAlign: "right", width: "100%" } },

              // ...(blockType === "centerBlock") && { display: "flex", justifyContent: "center" },
              // ...(blockType === "rightBlock") && { display: "flex", justifyContent: "flex-end" },

              // bgcolor: "yellow",
              paddingLeft: "2px",
              paddingRight: "2px",
              boxShadow: isCurrentRow ? 3 : 0,
              transform: isCurrentRow ? `scale(1.03)` : `scale(1)`,
              ...isCurrentRow && { backgroundColor: theme.palette.background.default },

              ...isCurrentRow && (currentBlockType !== "unstyled") && { transform: `scale(1)` },
              //backgroundColor: isCurrentRow ? "wheat" : "transparent",
              transition: "box-shadow, background-color, transform, 300ms",

              position: "relative",
              zIndex: isCurrentRow ? 100 : 0,
              display: "flex",
              alignItems: "center",
              ...(theme.palette.mode === "dark") && isCurrentRow && {
                //   backgroundColor:""
                backgroundColor: "rgba(80, 80, 80, 1)"
                //   borderWidth: 1,
                //   borderStyle: "solid",
                //    boxSizing: "border-box",
              }


            }}
          >
            <IconButton sx={{
              fontSize: "2rem", width: "2.5rem", height: "2.5rem", position: "absolute",
              ...(blockType === "rightBlock") ? { left: 0 } : { right: 0 },
              opacity: (isCurrentRow && !Boolean(currentBlockText) && (imageBlockNum < 3) && (blockType !== "imageBlock") && (blockType !== "voteBlock")) ? 1 : 0,
              transform: (isCurrentRow && !Boolean(currentBlockText) && (imageBlockNum < 3) && (blockType !== "imageBlock") && (blockType !== "voteBlock")) ? "scale(1)" : "scale(0)",
              transition: "opacity, 300ms"
              // backgroundColor: "pink"

            }}
              size="small"

              contentEditable={false} suppressContentEditableWarning={true}
              onClick={function () {
                // setEmojiIndex(index)
                markingImageBlock(blockKey)
              }}
            >
              <ImageOutlined fontSize="large" />
            </IconButton>

            <IconButton sx={{
              fontSize: "2rem", width: "2.5rem", height: "2.5rem", position: "absolute",
              ...(blockType === "rightBlock") ? { left: 0 } : { right: 0 },
              opacity: (isCurrentRow && !Boolean(currentBlockText) && (blockType !== "imageBlock") && (blockType !== "voteBlock")) ? 1 : 0,
              transform: (isCurrentRow && !Boolean(currentBlockText) && (blockType !== "imageBlock") && (blockType !== "voteBlock"))
                ? `scale(1) translateX(${blockType === "rightBlock" ? "100%" : "-100%"})`
                : `scale(0)`,
              transition: "opacity, 300ms",
              ...hasVoteBlock && { transform: "scale(0)" }

              // backgroundColor: "pink"

            }}
              size="small"

              contentEditable={false} suppressContentEditableWarning={true}
              onClick={function () {
                // setEmojiIndex(index)
                //markingImageBlock(blockKey)
                markingVoteBlock(blockKey)
              }}
            >
              <StackedBarChart fontSize="large" sx={{ transform: "rotate(90deg) scaleX(-1)" }} />
            </IconButton>


            {block}
          </Box>
        )

      })}

    </>
  )

}


