import React, { useState, useRef, useEffect, useLayoutEffect, useContext, useCallback, createContext, useMemo } from 'react';

import logo from './logo.svg';
import './App.css';


import ThemeContextProvider from "./ThemeContextProvider";
import { ContextProvider as EditorCtx } from "./ContextProvider";
import Content, { InstantContent } from "./Content";
import MainPage from "./MainPage";

import { BrowserRouter, Route, Routes, useRoutes, Link } from "react-router-dom";


import { Container, Grid, Paper, IconButton, ButtonGroup, Stack, Box, Chip, Avatar, CssBaseline } from '@mui/material';
import Dialog from '@mui/material/Dialog';

export const AppContext = createContext()




function App() {


  //  const [editorState, setEditorState] = useEditorState()

  const [userName, setUserName] = useState("User" + String(Math.random()).substring(3, 6))

  const [postArr, setPostArr] = useState([])

  //let [editorState, setEditorState] = useEditorState()


  return (
    <ThemeContextProvider>
      <AppContext.Provider value={{ userName, setUserName }}>

        <Container disableGutters={true} fixed={false} maxWidth={window.innerWidth >= 3000 ? false : "lg"} >
          <CssBaseline />
          {/* <Paper sx={{ bgcolor: "pink", height:"8rem",mx:"4px", my:"8px"  ,boxShadow:3 }} /> */}
          <Routes>
            <Route path="/" element={<MainPage postArr={postArr} setPostArr={setPostArr} userName={userName} />} />






            <Route path="/person"

              element={

                <h3>{JSON.stringify({ a: "aaa" })}</h3>


              }

            />



          </Routes>

        </Container>
      </AppContext.Provider>
    </ThemeContextProvider>



  );
}

export default App;
