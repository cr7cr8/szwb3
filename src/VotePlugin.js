import { useContext } from 'react';
import { EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, AtomicBlockUtils } from 'draft-js';
import { Container, Grid, Paper, Typography, Box } from '@mui/material';
import PeopleList from './PeopleList';


import { Context } from "./ContextProvider"
import { useTheme } from '@mui/private-theming';
import VoteBlock from "./VoteBlock";


export default function votePlugin() {

  let editorState = null
  let setEditorState = null
  let newContent = null

  function markingVoteBlock(blockKey, isDeleting = false) {

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
      isDeleting ? "unstyled" : "voteBlock"
    );

    editorState = EditorState.push(editorState, newContent, 'change-block-type');
    // EditorState.forceSelection(externalES, newSelection)
    if (isDeleting) {
      setTimeout(() => {
        setEditorState(EditorState.forceSelection(editorState, editorState.getSelection()))
      }, 0);

    }
    else {
      return setEditorState(editorState)
    }

  };

  return {

    votePlugin: {
      onChange: function (newState, { setEditorState: setEditorState_ }) {

        editorState = newState
        setEditorState = setEditorState_
        newContent = newState.getCurrentContent()
        return editorState

      }
    },
    VoteBlock,
    markingVoteBlock,
  }


}