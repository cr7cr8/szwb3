import React, { useState, useRef, useEffect, useLayoutEffect, useContext, useCallback, createContext, useMemo } from 'react';

import logo from './logo.svg';
import './App.css';


import ThemeContextProvider from "./ThemeContextProvider";
import { ContextProvider as EditorCtx } from "./ContextProvider";
import Content, { InstantContent } from "./Content";


import { BrowserRouter, Route, Routes, useRoutes } from "react-router-dom";


import { Container, Grid, Paper, IconButton, ButtonGroup, Stack, Box, Chip, Avatar } from '@mui/material';


export const AppContext = createContext()


function App() {


  //  const [editorState, setEditorState] = useEditorState()

  const [userName, setUserName] = useState("User" + String(Math.random()).substring(3, 6))

  const [postArr, setPostArr] = useState([])


  const mainElement = <Container disableGutters={true} fixed={false} maxWidth={window.innerWidth >= 3000 ? false : "lg"} >
    <Grid container
      direction="row"
      justifyContent="space-around"
      alignItems="flex-start"
      spacing={0}
    >
      <Grid item xs={10} sm={10} md={10} lg={6} xl={6} >
        <EditorCtx
          userName={userName}
          onSubmit={function (preHtml) {
            // console.log(preHtml)
            setPostArr(pre => {

              pre.unshift(preHtml)
              return [...pre]
              //  return [preHtml, ...pre] 
            })
          }} />
      </Grid>

    </Grid>

    <Content postArr={postArr} setPostArr={setPostArr} userName={userName} />

  </Container >



  return (
    <ThemeContextProvider>
      <AppContext.Provider value={{ userName, setUserName }}>

        <Routes>
          <Route path="/" element={mainElement} />



          <Route path="/person"

            element={

                <h3>{JSON.stringify({a:"aaa"})}</h3>


            }

          />



        </Routes>
      </AppContext.Provider>
    </ThemeContextProvider>



  );
}

export default App;
