import React, { useState, useRef, useEffect, useLayoutEffect, useContext, useCallback, createContext, useMemo } from 'react';

import logo from './logo.svg';
import './App.css';


import ThemeContextProvider from "./ThemeContextProvider";
import { ContextProvider as EditorCtx } from "./ContextProvider";
import Content, { InstantContent } from "./Content";





import { Container, Grid, Paper, IconButton, ButtonGroup, Stack, Box, Chip, Avatar } from '@mui/material';


export const AppContext = createContext()


function App() {


  //  const [editorState, setEditorState] = useEditorState()

  const [userName, setUserName] = useState("User" + String(Math.random()).substring(3, 6))

  //const [userName, setUserName] = useState("Useraaa")
  const [postArr, setPostArr] = useState([])



  return (
    <ThemeContextProvider>
      <AppContext.Provider value={{ userName, setUserName }}>

        <Container disableGutters={true} fixed={false} maxWidth={window.innerWidth >= 3000 ? false : "lg"}
        //     sx={{ backgroundColor: { xs: "pink", sm: "yellow", md: "skyblue", lg: "orange", xl: "wheat" } }}

        >



          <Grid container
            direction="row"
            justifyContent="space-around"
            alignItems="flex-start"
            spacing={0}

          >
            <Grid item xs={10} sm={10} md={10} lg={6} xl={6} >
              {/* <EditorCtx editorState={editorState} setEditorState={setEditorState} /> */}
              <EditorCtx

                userName={userName}
                onSubmit={function (preHtml) {
                  setPostArr(pre => { return [preHtml, ...pre] })
                }} />
            </Grid>


          </Grid>

          <Content postArr={postArr} setPostArr={setPostArr} userName={userName} />
          {/* <InstantContent editorState={editorState} /> */}


        </Container >

      </AppContext.Provider>
    </ThemeContextProvider>



  );
}

export default App;
