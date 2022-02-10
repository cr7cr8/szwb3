import React, { useEffect, useState, useRef, useMemo, useContext, useCallback } from 'react';
import { EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, AtomicBlockUtils } from 'draft-js';

import { ThemeProvider, useTheme, createTheme } from '@mui/material/styles';

import { Container, Grid, Paper, IconButton, ButtonGroup, Stack, Box, Button, Typography, Slider, TextField, Select, Popover, MenuItem, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { HourglassBottomRounded, KeyboardArrowUpIcon } from "@mui/icons-material"

import { Context } from "./ContextProvider";
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage';

import { Crop, DoneRounded, Close, AddCircleOutline, RemoveCircleOutline, } from '@mui/icons-material';


import useResizeObserver from '@react-hook/resize-observer';

// Array.prototype.insert = function (index, item) {
//   this.splice(index, 0, item);
//   return this
// };  //NEVER declear or USE IT , CONFLICT WITH mulitavatar !!!


export default function VoteBlock(props) {


  const theme = useTheme()
  const { editorState, setEditorState, voteArr, setVoteArr, voteTopic, setVoteTopic } = useContext(Context)

  const { readOnly, setReadOnly, markingVoteBlock } = props.blockProps

  useEffect(function () {
    if (voteArr.length === 0) {
      setVoteArr([""])
    }


  }, [])


  return (
    <Box sx={{
      // bgcolor: "pink", 
      display: "flex", justifyContent: "flex-start", flexDirection: "column",
      alignItems: "flex-start",
      gap: "8px",


      backgroundColor: theme.palette.action.disabledBackground,

      position: "relative",

      "& label": { fontSize: theme.scaleSizeObj(0.8) },
      "& input": { fontSize: theme.sizeObj },
      "& textarea": { fontSize: theme.sizeObj },
    }} >

      <IconButton sx={{
        fontSize: "2rem", width: "2.5rem", height: "2.5rem",
        position: "absolute",
        right: 0,
        zIndex: 100,
      }}
        size="small"
        contentEditable={false} suppressContentEditableWarning={true}
        onClick={function () {
          markingVoteBlock(props.block.getKey(), true)
        }}
      >
        <Close fontSize="large" sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.5)", borderRadius: "1000px" } }} />
      </IconButton>

      <TextField contentEditable={false} suppressContentEditableWarning={true}
        id="outlined-textarea"
        label={voteTopic ? "" : "Eneter Topic"}
        multiline={true}
        value={voteTopic}
        onChange={function (e) {
          setVoteTopic(e.target.value)
        }}
        placeholder="Enter Topic"
        sx={{
          width: "100%",
          bgcolor: theme.palette.background.default,
          alignItems: "center",
          "& > div": { width: "100%" },
        }}
        variant="filled"
        onFocus={function (e) {
          setReadOnly(true)
          const newSelection = editorState.getSelection().merge({
            hasFocus: false,
          })
          setTimeout(function () {
            setEditorState(EditorState.acceptSelection(editorState, newSelection))
          }, 0)

        }}
        onBlur={function (e) {
          setReadOnly(false)
        }}
      />

      {voteArr.map(function (item, index, arr) {

        return (
          <Box sx={{
            width: "100%", //bgcolor: "orange",
            display: "flex", alignItems: "center",
          }} key={index}>
            <TextField contentEditable={false} suppressContentEditableWarning={true}
              id={"outlined-textarea" + index}
              label={"Choice " + (index + 1)}
              onKeyDown={function (e) {

                if (e.code === "Enter" || e.code === "NumpadEnter") {
                  voteArr.splice(index + 1, 0, "")
                  setVoteArr(pre => {
                    return [...voteArr]
                  })
                  setTimeout(() => {
                    document.getElementById("outlined-textarea" + (index + 1)).focus()
                  }, 0);
                }
                else if (e.code === "ArrowUp") {
                  setTimeout(() => {
                    document.getElementById("outlined-textarea" + (Math.max(0, index - 1))).focus()
                  }, 0);
                }
                else if (e.code === "ArrowDown") {
                  setTimeout(() => {
                    document.getElementById("outlined-textarea" + (Math.min(voteArr.length - 1, index + 1))).focus()
                  }, 0);
                }
                else if (e.code === "Backspace") {

                  if ((!e.target.value) && (voteArr.length > 1)) {
                    voteArr.splice(index, 1)
                    setVoteArr(voteArr)
                    setTimeout(() => {
                      document.getElementById("outlined-textarea" + (Math.max(0, index - 1))).focus()
                    }, 0);
                  }

                }
              }}
              sx={{
                width: "90%",
                transform: "translateX(8px)",
                //   bgcolor: "skyblue", 
                bgcolor: theme.palette.background.default,
                alignItems: "center",
                "& > div": { width: "100%" },


              }}
              placeholder={"Choice " + (index + 1)}
              value={voteArr[index]}
              onFocus={function (e) {
                setReadOnly(true)
                const newSelection = editorState.getSelection().merge({
                  hasFocus: false,
                })
                setTimeout(function () {
                  setEditorState(EditorState.acceptSelection(editorState, newSelection))
                }, 0)

              }}
              onBlur={function (e) {
                setReadOnly(false)
              }}
              onChange={function (e) {

            
                setVoteArr(pre => {
                  pre[index] = e.target.value
                  return [...pre]
                })
              }}
            />

            {voteArr.length !== 1 && <IconButton sx={{
              fontSize: "2rem", width: "2.5rem", height: "2.5rem",
              position: "absolute",
              right: 0,
            }}
              disabled={voteArr.length <= 1}
              size="small"
              contentEditable={false} suppressContentEditableWarning={true}
              onClick={function () {

                setVoteArr(pre => {
                  return pre.filter((item, pos) => {
                    return pos !== index
                  })
                })



              }}
            >

              <RemoveCircleOutline fontSize="large" sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.5)", borderRadius: "1000px" } }} />


            </IconButton>
            }

            {voteArr.length - 1 === index &&
              <IconButton sx={{
                fontSize: "2rem", width: "2.5rem", height: "2.5rem",
                //margin:"auto auto",

                position: "absolute", right: 0,

                transform: `translateX(${voteArr.length === 1 ? "0" : "100%"})`,


              }}
                size="small"
                contentEditable={false} suppressContentEditableWarning={true}
                onClick={function () {
                  setVoteArr(pre => {
                    return [...pre, ""]
                  })

                }}
              >
                <AddCircleOutline fontSize="large" sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.5)", borderRadius: "1000px" } }} />



              </IconButton>
            }

          </Box>
        )
      })}

      <TimeBar />



    </Box >
  )


}


function TimeBar() {

  // const theme = useTheme()
  const { pollDuration, setPollDuration } = useContext(Context)




  return (




    <Box sx={{
      width: "100%", height: "5rem",
      display: "flex",
      justifyContent: "space-around", alignItems: "center",
      overflow: "hidden",
      transition: "height, 300ms",
      // bgcolor: "yellow",
      position: "relative",
    }}>
      <Typography variant='h6' sx={{
        position: "absolute", transform: "translateY(-50%)",
        right: 10, color: "text.secondary",

      }}>Poll duration {`${pollDuration.d}d${pollDuration.h}h${pollDuration.m}m`}</Typography>
      <Slider
        size="medium"
        valueLabelDisplay="auto"
        //       value={zoom}
        valueLabelFormat={function (numOfMins_) {
          return numOfMins_ + "days"
        }}
        onChange={(e, value) => { setPollDuration(pre => { return { ...pre, d: value } }) }}
        min={0}
        max={7}
        step={1}
        marks={true}
        value={pollDuration.d}
        //   value={200}
        aria-labelledby="Zoom"
        //  classes={{ root: classes.slider }}
        //  onChange={(e, zoom) => setZoom(zoom)}
        sx={{

          m: "auto, auto",
          width: "20%",
          color: "skyblue",
          transform: "translateY(10px)"

        }}
      />


      <Slider
        size="medium"
        valueLabelDisplay="auto"
        //       value={zoom}
        valueLabelFormat={function (numOfMins_) {
          return numOfMins_ + " hours"
        }}
        onChange={(e, value) => { setPollDuration(pre => { return { ...pre, h: value } }) }}
        min={0}
        max={23}
        step={1}
        marks={true}
        value={pollDuration.h}
        //   value={200}
        aria-labelledby="Zoom"
        //  classes={{ root: classes.slider }}
        //  onChange={(e, zoom) => setZoom(zoom)}
        sx={{

          m: "auto, auto",
          width: "30%",
          color: "skyblue",
          transform: "translateY(10px)"

        }}
      />

      <Slider
        size="medium"
        valueLabelDisplay="auto"
        //       value={zoom}
        valueLabelFormat={function (numOfMins_) {
          return numOfMins_ + "mins"
        }}
        onChange={(e, value) => { setPollDuration(pre => { return { ...pre, m: value } }) }}
        min={0}
        max={59}
        step={1}
        marks={true}
        value={pollDuration.m}
        //   value={200}
        aria-labelledby="Zoom"
        //  classes={{ root: classes.slider }}
        //  onChange={(e, zoom) => setZoom(zoom)}
        sx={{

          m: "auto, auto",
          width: "40%",
          color: "skyblue",
          transform: "translateY(10px)"

        }}
      />



    </Box>
  )



}


function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}