import React, { useState, useRef, useEffect, useLayoutEffect, useContext, useCallback, createContext, useMemo } from 'react';

import logo from './logo.svg';
import './App.css';


import ThemeContextProvider from "./ThemeContextProvider";
import { ContextProvider as EditorCtx, useEditorState } from "./ContextProvider";
import Content from "./Content";

import useResizeObserver from '@react-hook/resize-observer';

//import multiavatar from '@multiavatar/multiavatar/esm'
//import multiavatar from '@multiavatar/multiavatar';
//import multiavatar from "@emitapp/multiavatar";

import { Container, Grid, Paper, IconButton, ButtonGroup, Stack, Box, Chip, Avatar } from '@mui/material';


function App() {


  //const sxObj = { backgroundColor: "orange", "&:hover": { backgroundColor: "blue" } }

  const [editorState, setEditorState] = useEditorState()



  // return (
  //   <>
  //     <h1>ssss</h1>

  //     <img src={"data:image/svg+xml;base64," + btoa(multiavatar("assdfe"))} style={{ width: 200, height: 200 }} />
  //   </>
  // )




  return (
    <ThemeContextProvider>
      <Container disableGutters={true} fixed={false} maxWidth={window.innerWidth >= 3000 ? false : "lg"}
      // sx={{ backgroundColor: { xs: "pink", sm: "yellow", md: "skyblue", lg: "orange", xl: "wheat" } }}

      >



        <Grid container
          direction="row"
          justifyContent="space-around"
          alignItems="flex-start"
          spacing={0}

        >
          <Grid item xs={10} sm={10} md={10} lg={6} xl={6} >
            <EditorCtx editorState={editorState} setEditorState={setEditorState} />
          </Grid>


        </Grid>


        <Content editorState={editorState} />


      </Container >



    </ThemeContextProvider>



  );
}

export default App;
