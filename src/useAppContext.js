import React, { useState, useRef, useEffect, useLayoutEffect, useContext, useCallback, createContext, useMemo } from 'react';

import logo from './logo.svg';
import './App.css';


import ThemeContextProvider from "./ThemeContextProvider";
import { DraftProvider as EditorCtx, useEditorState } from "./ContextProvider";
import Content, { InstantContent } from "./Content";


import { AppContext } from "./App"


import { Container, Grid, Paper, IconButton, ButtonGroup, Stack, Box, Chip, Avatar } from '@mui/material';

export default function useAppContext() {
  return useContext(AppContext)
}