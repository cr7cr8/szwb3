import React, { useEffect, useState, useRef, useMemo, useContext, useCallback } from 'react';
import { EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, AtomicBlockUtils } from 'draft-js';

import { ThemeProvider, useTheme, createTheme } from '@mui/material/styles';

import { Container, Grid, Paper, IconButton, ButtonGroup, Stack, Box, Button, Typography, Slider, TextField, Select, Popover, MenuItem, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { KeyboardArrowUpIcon } from "@mui/icons-material"

import { Context } from "./ContextProvider";
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage';

import { Crop, DoneRounded, Close, AddCircleOutline, RemoveCircleOutline, } from '@mui/icons-material';


import useResizeObserver from '@react-hook/resize-observer';


export default function VoteBlock(props) {

  const theme = useTheme()
  const { editorState, setEditorState, voteArr, setVoteArr, voteTopic, setVoteTopic } = useContext(Context)

  const { readOnly, setReadOnly } = props.blockProps

  useEffect(function () {
    if (voteArr.length === 0) {
      setVoteArr(["Choice 0"])
    }


  }, [])


  return (
    <Box sx={{
      bgcolor: "pink", display: "flex", justifyContent: "flex-start", flexDirection: "column",
      alignItems: "flex-start",
      gap: "4px",
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

        }}
      >
        <Close fontSize="large" sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.5)", borderRadius: "1000px" } }} />
      </IconButton>

      <TextField contentEditable={false} suppressContentEditableWarning={true}
        id="outlined-textarea"
        label="Vote topic"
        multiline={true}
        value={voteTopic}
        onChange={function (e) {
          setVoteTopic(e.target.value)
        }}
        // placeholder="Placeholder"
        sx={{
          width: "100%", bgcolor: "skyblue", alignItems: "center",
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
          <Box sx={{ width: "100%", bgcolor: "orange", display: "flex", alignItems: "center" }} key={index}>
            <TextField contentEditable={false} suppressContentEditableWarning={true}
              id="outlined-textarea"
              label={"Choice " + (index + 1)}
              sx={{
                width: "100%",
                bgcolor: "skyblue", alignItems: "center",
                "& > div": { width: "100%" },

              }}
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
                    return [...pre, "Choice " + pre.length]
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

  const [days, setDays] = useState(7)
  const [hours, setHours] = useState(0)
  const [mins, setMins] = useState(0)



  const [height, setHeight] = useState(0)

  function handleClick() {

    setHeight(pre => {

      return pre === 0 ? "3rem" : 0

    })


  }


  return <Box sx={{ width: "100%", bgcolor: "orange", }}>

    <Box sx={{ width: "100%", display: "flex", justifyContent: "space-around" }}>
      <Button variant="contained" onClick={handleClick}>Aa</Button>
      <Button variant="contained" onClick={handleClick}>Aa</Button>
      <Button variant="contained" onClick={handleClick}>Aa</Button>
    </Box>


    <Box sx={{
      width: "600px", height,
      display: "flex",
      justifyContent: "center", alignItems: "center",
      overflow: "hidden",
      transition: "height, 300ms",
      bgcolor: "yellow"
    }}>
      <Slider
        size="medium"
        //       value={zoom}
        min={1}
        max={3}
        step={0.1}
        aria-labelledby="Zoom"
        //  classes={{ root: classes.slider }}
        //  onChange={(e, zoom) => setZoom(zoom)}
        sx={{
          //  padding: '22px 0px',
          //  marginLeft: "",
          //  marginLeft: "20px",
          //  marginRight: "20px",
          // position: "absolute",
          // bottom: 0,
          // left: 0,
          // right: 0,
          m: "auto, auto",
          width: "90%",
          color: "skyblue",

        }}
      />
    </Box>


    {/* <Button variant="contained"  onClick={handleClick}>Aa</Button>
    <Popover
   //   id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <Typography sx={{ p: 2 }}>The content of the Popover.</Typography>
    </Popover> */}


  </Box>




  return <Box sx={{ width: "100%", bgcolor: "orange", display: "flex", justifyContent: "space-around" }}>
    <Select
      //    onMouseOver={function(){alert("111")}}
      // onClick={function () { alert("ffff") }}
      labelId="demo-simple-select-readonly-label"
      id="demo-simple-select-readonly"
      value={days}

      onChange={function (e) {
        console.log(e.target.value)
        setDays(e.target.value)
      }}
    //      inputProps={{ readOnly: true }}
    >

      <MenuItem value={1}> 1 Day</MenuItem>
      <MenuItem value={2}> 2 Days</MenuItem>
      <MenuItem value={3}> 3 Days</MenuItem>
      <MenuItem value={4}> 4 Days</MenuItem>
      <MenuItem value={5}> 5 Days</MenuItem>
      <MenuItem value={6}> 6 Days</MenuItem>
      <MenuItem value={7}> 7 Days</MenuItem>
    </Select>

    <Select
      //   onMouseOver={function(){alert("222")}}
      // onClick={function () { alert("ffff") }}
      labelId="demo-simple-select-readonly-label"
      id="demo-simple-select-readonly"
      value={hours}

      onChange={function (e) {
        console.log(e.target.value)
        setHours(e.target.value)
      }}
    //      onChange={handleChange}
    //      inputProps={{ readOnly: true }}
    >
      {[...new Array(24)].map((item, index) => {
        return <MenuItem value={index} key={index}>{index} Hours</MenuItem>
      })}
    </Select>

    <Select
      //   onMouseOver={function(){alert("222")}}
      // onClick={function () { alert("ffff") }}
      labelId="demo-simple-select-readonly-label"
      id="demo-simple-select-readonly"
      value={mins}

      onChange={function (e) {
        console.log(e.target.value)
        setMins(e.target.value)
      }}
    //      onChange={handleChange}
    //      inputProps={{ readOnly: true }}
    >
      {[...new Array(59)].map((item, index) => {

        return <MenuItem value={index} key={index}>{index} Mins</MenuItem>


      })}




    </Select>



  </Box>


}


function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}