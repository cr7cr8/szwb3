

import { useContext } from 'react';
import { EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, AtomicBlockUtils } from 'draft-js';
import { Container, Grid, Paper, Typography, Box, Avatar } from '@mui/material';
import PeopleList from './PeopleList';

import multiavatar from '@multiavatar/multiavatar';
import { Context } from "./ContextProvider"
import { useTheme } from '@mui/private-theming';

import { AvatarChip } from "./PeopleList";


export default function createLinkPlugin() {

  let editorState = null
  let setEditorState = null
  let newContent = null
  const entityKeyObj = {}

  function linkStrategy(contentBlock, callback, contentState) {
    contentBlock.findEntityRanges(
      function (character) {
        const entityKey = character.getEntity();
        return entityKey !== null && contentState.getEntity(entityKey).getType().indexOf("linkTag") >= 0
      },
      callback
    );
  }

  //  function LinkComp() { return <h1>aaa</h1> }

  function conditionWrap({ editorState, searchAllBlock = true }) {

    return searchAllBlock
      ? editorState.getCurrentContent().getBlockMap()
      : [editorState.getCurrentContent().getBlockForKey(editorState.getSelection().getStartKey())]

  }

  function taggingLink() {
    const [anchorKey, anchorOffset, focusKey, focusOffset, isBackward, hasfocus] = editorState.getSelection().toArray()
    const [anchorStartKey, anchorStartOffset, anchorFocusKey, anchorFocusOffset, isAnchorBackward, isAnchorFocused]
      = [!isBackward ? anchorKey : focusKey, !isBackward ? anchorOffset : focusOffset, isBackward ? anchorKey : focusKey, isBackward ? anchorOffset : focusOffset,]
    const regx = /\s([a-zA-Z]{1,10}:\/\/)(([a-zA-Z0-9-_]+\.?)+(:\d{0,6})?)(\/[^\s\r\n\/]+){0,7}(\/)?/g

    const oldSelection = editorState.getSelection();
    let newContent = editorState.getCurrentContent();
    let newSelection = editorState.getSelection();

    conditionWrap({ editorState, searchAllBlock: true }).forEach(function (block) {

      const blockKey = block.getKey()
      const blockText = block.getText()
      const metaArr = block.getCharacterList()

      metaArr.forEach(function (item, index) {
        const styleArr = item.getStyle().toArray()
        console.log(styleArr)
    
       // const itemEntityKey = item.getEntity()
        // if (styleArr&&styleArr.length>0) {
        //   const entityType = newContent.getEntity(itemEntityKey).getType()

        //   if (entityType.indexOf("mention") >= 0) {

        //     newSelection = newSelection.merge({
        //       anchorKey: blockKey,
        //       anchorOffset: index,
        //       focusKey: blockKey,
        //       focusOffset: index + 1,
        //       isBackward: false,
        //       hasFocus: false,
        //     })
        //     newContent = Modifier.removeInlineStyle(newContent, newSelection, "linkTagOn")
        //     newContent = Modifier.removeInlineStyle(newContent, newSelection, "linkTagOff")
        //   }
        // }
      })

      // let matchArr;
      // while ((matchArr = regx.exec(blockText)) !== null) {

      //   const start = matchArr.index;
      //   const end = matchArr.index + matchArr[0].length;
      //   const contentLenth = end - start;
      //   const contentFocusAt = anchorFocusOffset - start;

      //   const mentionOn = hasfocus && (blockKey === anchorFocusKey) && (contentFocusAt > 0) && (contentFocusAt <= contentLenth)
      //   const mentionOff = !mentionOn

      //   if (mentionOn) {

      //     tagStartPos = start
      //     tagEndPos = end

      //     newSelection = newSelection.merge({
      //       anchorKey: blockKey,
      //       focusKey: blockKey,
      //       anchorOffset: start + 1,
      //       focusOffset: end,//  start + 2,
      //       isBackward: false,
      //       hasFocus: false,
      //     })
      //     newContent = Modifier.applyInlineStyle(newContent, newSelection, "linkTagOn")
      //   }
      //   else if (mentionOff) {
      //     tagStartPos = start
      //     tagEndPos = end

      //     newSelection = newSelection.merge({
      //       anchorKey: blockKey,
      //       focusKey: blockKey,
      //       anchorOffset: start + 1,
      //       focusOffset: end,//start + 2,
      //       isBackward: false,
      //       hasFocus: false,
      //     })
      //     newContent = Modifier.applyInlineStyle(newContent, newSelection, "linkTagOff")
      //   }
      // }
    })

    editorState = EditorState.push(editorState, newContent, "change-inline-style");
    editorState = EditorState.acceptSelection(editorState, oldSelection);
    return editorState






  }


  return {


    linkPlugin: {

      onChange: function (newState, { setEditorState: setEditorState_ }) {
        //   alert("Ff")
        editorState = newState
        setEditorState = setEditorState_
        newContent = newState.getCurrentContent()



        editorState = taggingLink()

        return editorState

      },


      // decorators: [
      //   {
      //     strategy: linkStrategy,
      //     component: LinkComp,
      //   }
      // ],

    }
  }
}



