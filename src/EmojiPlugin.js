import React, { useState, useRef, useEffect } from 'react';

import { EditorState, KeyBindingUtil, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, SelectionState, CharacterMetadata } from 'draft-js';

import EmojiPanel from "./EmojiPanel";



export default function createImagePlugin() {

  let editorState = null
  let setEditorState = null
  let newContent = null


  function emojiStrategy(contentBlock, callback, contentState) {

    contentBlock.findEntityRanges(
      function (character) {
        const entityKey = character.getEntity();
        return (
          entityKey !== null &&
          contentState.getEntity(entityKey).getType() === "EMOJI"

        );
      },
      callback
    );
  };

  function taggingEmoji() {



    const oldSelection = editorState.getSelection();
    newContent = editorState.getCurrentContent();
    let newSelection = editorState.getSelection();



    editorState = EditorState.push(editorState, newContent, "apply-entity");
    editorState = EditorState.acceptSelection(editorState, oldSelection);
    return editorState
  }

  function Emoji(props) {

    return props.children
  }

  function insertEmoji(text) {

    const [anchorKey, anchorOffset, focusKey, focusOffset, isBackward, hasfocus] = editorState.getSelection().toArray()
    const [anchorStartKey, anchorStartOffset, anchorFocusKey, anchorFocusOffset, isAnchorBackward, isAnchorFocused]
      = [!isBackward ? anchorKey : focusKey, !isBackward ? anchorOffset : focusOffset, isBackward ? anchorKey : focusKey, isBackward ? anchorOffset : focusOffset,]


    let newContent = Modifier.replaceText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      text,
    )


    let newSelection = editorState.getSelection().merge({

      anchorKey: anchorStartKey,
      anchorOffset: anchorStartOffset + text.length,
      focusKey: anchorStartKey,
      focusOffset: anchorStartOffset + text.length,
      isBackward: false,
      hasFocus: true,
    })

    editorState = EditorState.push(editorState, newContent, "insert-characters");
    editorState = EditorState.acceptSelection(editorState, newSelection)

    setEditorState(editorState)

    // setTimeout(() => {
    //   editorState = EditorState.push(editorState, newContent, "insert-characters");
    //   editorState = EditorState.forceSelection(editorState, newSelection)
    //   setEditorState(editorState)
    // }, 0);

  }

  function setFocus(editorState) {



    setTimeout(() => {

      editorState = EditorState.forceSelection(editorState, editorState.getSelection())
      setEditorState(editorState)
    }, 0);
  }



  function EmojiComp({ editorRef, typeName, ...props }) {

    return <EmojiPanel insertEmoji={insertEmoji} editorRef={editorRef} setFocus={setFocus} typeName={typeName} />


  }



  return {

    emojiPlugin: {

      onChange: function (newState, { setEditorState: setEditorState_ }) {
        editorState = newState
        setEditorState = setEditorState_
        newContent = newState.getCurrentContent()

        //  editorState = taggingEmoji()

        return editorState
      },
      decorators: [{

        strategy: emojiStrategy,
        component: Emoji
      }],

    },
    EmojiComp,



  }
}