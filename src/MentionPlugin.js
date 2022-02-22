

import { useContext, useState, useRef, useEffect } from 'react';
import { EditorState, ContentState, ContentBlock, CharacterMetadata, SelectionState, convertToRaw, convertFromRaw, RichUtils, Modifier, convertFromHTML, AtomicBlockUtils } from 'draft-js';
import { Container, Grid, Paper, Typography, Box, Popover, Popper } from '@mui/material';
import PeopleList from './PeopleList';


import { Context } from "./ContextProvider"
import { useTheme } from '@mui/private-theming';


//const fontSize = { xs: "5rem", sm: "4rem", md: "3rem", lg: "2rem", xl: "3rem" }




export default function createMentionPlugin() {

  let editorState = null
  let setEditorState = null
  let newContent = null
  const entityKeyObj = {}

  let tagStartPos = 0
  let tagEndPos = 0


  let tabIndex = 1006;
  let isShowing = false;

  let tabName = ""

  function checkShowing() {
    return isShowing
  }

  function setShowing(bool) {
    isShowing = bool
  }

  function setTabName(name) {
    tabName = name
  }


  function conditionWrap({ searchAllBlock = true, editorState }) {

    return searchAllBlock
      ? editorState.getCurrentContent().getBlockMap()
      : [editorState.getCurrentContent().getBlockForKey(editorState.getSelection().getStartKey())]

  }



  function taggingMention() {

    const [anchorKey, anchorOffset, focusKey, focusOffset, isBackward, hasfocus] = editorState.getSelection().toArray()
    const [anchorStartKey, anchorStartOffset, anchorFocusKey, anchorFocusOffset, isAnchorBackward, isAnchorFocused]
      = [!isBackward ? anchorKey : focusKey, !isBackward ? anchorOffset : focusOffset, isBackward ? anchorKey : focusKey, isBackward ? anchorOffset : focusOffset,]
    const regx = /\s([@][\w_\[\u4E00-\u9FCA\]]*)/g

    const oldSelection = editorState.getSelection();
    let newSelection = editorState.getSelection();
    newContent = editorState.getCurrentContent();

    conditionWrap({ editorState, searchAllBlock: true }).forEach(function (block) {

      const blockKey = block.getKey()
      const blockText = block.getText()
      const metaArr = block.getCharacterList()

      metaArr.forEach(function (item, index) {
        const itemEntityKey = item.getEntity()
        if (itemEntityKey) {
          const entityType = newContent.getEntity(itemEntityKey).getType()

          if (entityType.indexOf("mention") >= 0) {

            newSelection = newSelection.merge({
              anchorKey: blockKey,
              anchorOffset: index,
              focusKey: blockKey,
              focusOffset: index + 1,
              isBackward: false,
              hasFocus: false,
            })
            newContent = Modifier.applyEntity(newContent, newSelection, null)
          }
        }
      })

      let matchArr;
      while ((matchArr = regx.exec(blockText)) !== null) {
        // alert("fdfsf")
        const start = matchArr.index;
        const end = matchArr.index + matchArr[0].length;
        const contentLenth = end - start;
        const contentFocusAt = anchorFocusOffset - start;


        const mentionOn = hasfocus && (blockKey === anchorFocusKey) && (contentFocusAt > 0) && (contentFocusAt <= contentLenth)
        const mentionOff = !mentionOn


        if (mentionOn) {

          tagStartPos = start
          tagEndPos = end

          newSelection = newSelection.merge({
            anchorKey: blockKey,
            focusKey: blockKey,
            anchorOffset: start + 1,
            focusOffset: end,//  start + 2,
            isBackward: false,
            hasFocus: false,
          })
          newContent = Modifier.applyEntity(newContent, newSelection, entityKeyObj[`mentionOn`])
        }
        else if (mentionOff) {
          tagStartPos = start
          tagEndPos = end

          newSelection = newSelection.merge({
            anchorKey: blockKey,
            focusKey: blockKey,
            anchorOffset: start + 1,
            focusOffset: end,//start + 2,
            isBackward: false,
            hasFocus: false,
          })
          newContent = Modifier.applyEntity(newContent, newSelection, entityKeyObj[`mentionOff`])
        }
      }
    })

    editorState = EditorState.push(editorState, newContent, "apply-entity");
    editorState = EditorState.acceptSelection(editorState, oldSelection);
    return editorState

  }

  function mentionStrategy(contentBlock, callback, contentState) {

    contentBlock.findEntityRanges(
      function (character) {
        const entityKey = character.getEntity();
        return entityKey !== null && contentState.getEntity(entityKey).getType().indexOf("mention") >= 0
      },
      callback
    );
  }

  function Mention({ ...props }) {


    const { peopleList } = useContext(Context)

    const theme = useTheme()





    const { contentState, entityKey, blockKey, offsetKey, start, end, decoratedText, children } = props;
    const { mentionHeadKey, mentionBodyKey, person, imgurl, mentionType } = contentState.getEntity(entityKey).getData()


    const blockType = contentState.getBlockForKey(blockKey).getType()
    const blockData = contentState.getBlockForKey(blockKey).getData().toObject()

    const regx = new RegExp(`${decoratedText.replace("@", "")}`, "i")
    const text = decoratedText.replace("@", "")

    const cssObj = {
      ...text && { backgroundColor: theme.palette.mentionBg },
      display: "inline-block",
      "& span": { fontSize: blockData.isSmallFont ? theme.scaleSizeObj(0.8) : theme.sizeObj }
    }


    const nameList = peopleList.filter(people => {
      return Boolean(people.match(regx))
    })





    if ((mentionType === "mentionOn") && (nameList.length !== 0)) {

      return (
        <Box sx={{ display: "inline-block" }} >
          <Typography sx={cssObj} variant="body2">
            {children}
          </Typography>



          <PeopleList tabIndex={tabIndex} setShowing={setShowing} setTabName={setTabName} nameList={nameList} insertMention={insertMention} blockType={blockType} />


        </Box>
      )
    }

    else {
      return <Typography sx={cssObj} variant="body2">
        {children}
      </Typography>
      // return (
      //   <Box sx={{ display: "inline-block" }}>
      //     <Typography aria-describedby={"sssd"} sx={cssObj} variant="body2" //ref={anchor}
      //     >
      //       {children}
      //     </Typography>
      //     <PeopleList tabIndex={tabIndex} setShowing={setShowing} setTabName={setTabName} nameList={nameList} insertMention={insertMention} blockType={blockType} />
      //   </Box>
      // )
    }

  }




  function insertMention(name) {



    const text = name ? (" " + name) : (" " + tabName)
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();


    const [anchorKey, anchorOffset, focusKey, focusOffset, isBackward, hasfocus] = selection.toArray()
    const [anchorStartKey, anchorStartOffset, anchorFocusKey, anchorFocusOffset, isAnchorBackward, isAnchorFocused]
      = [!isBackward ? anchorKey : focusKey, !isBackward ? anchorOffset : focusOffset, isBackward ? anchorKey : focusKey, isBackward ? anchorOffset : focusOffset,]


    let newSelection = selection.merge({
      anchorKey: anchorStartKey,
      anchorOffset: tagStartPos,
      focusKey: anchorStartKey,
      focusOffset: tagEndPos,
      isBackward: false,
      hasFocus: true,

    })

    let newContent = Modifier.replaceText(
      contentState,
      newSelection,
      text,
    )

    newContent = Modifier.applyEntity(newContent, editorState.getSelection().merge({

      anchorKey: anchorStartKey,
      anchorOffset: tagStartPos + 1,  // +1 for extra space added in tabName
      focusKey: anchorStartKey,
      focusOffset: tagStartPos + text.length,
      isBackward: false,
      hasFocus: true,
    }), entityKeyObj[`personTag`])


    newSelection = editorState.getSelection().merge({

      anchorKey: anchorStartKey,
      anchorOffset: tagStartPos + text.length,
      focusKey: anchorStartKey,
      focusOffset: tagStartPos + text.length,
      isBackward: false,
      hasFocus: true,
    })



    if (!name) {
      editorState = EditorState.push(editorState, newContent, "insert-characters");
      editorState = EditorState.acceptSelection(editorState, newSelection)
      setEditorState(editorState)
    }
    else {
      setTimeout(() => {
        editorState = EditorState.push(editorState, newContent, "insert-characters");
        editorState = EditorState.forceSelection(editorState, newSelection)
        setEditorState(editorState)
      }, 0);
    }





  }









  return {
    checkShowing,
    mentionPlugin: {



      onChange: function (newState, { setEditorState: setEditorState_ }) {

        editorState = newState
        setEditorState = setEditorState_
        newContent = newState.getCurrentContent()

        if (Object.keys(entityKeyObj).length === 0) {

          entityKeyObj.mentionOn = newContent.createEntity(`mentionOn`, "MUTABLE", { mentionType: `mentionOn` }).getLastCreatedEntityKey();
          entityKeyObj.mentionOff = newContent.createEntity(`mentionOff`, "MUTABLE", { mentionType: `mentionOff` }).getLastCreatedEntityKey();
          entityKeyObj.personTag = newContent.createEntity(`personTag`, "IMMUTABLE", { mentionType: `personTag` }).getLastCreatedEntityKey();
        }


        editorState = taggingMention()

        return editorState

      },


      keyBindingFn(e, { getEditorState, setEditorState, ...obj }) {

        if ((e.keyCode === 40) && isShowing) {
          tabIndex = tabIndex + 1;
          return "fire-arrow";
        }

        else if ((e.keyCode === 38) && isShowing) {
          tabIndex = tabIndex - 1;
          return "fire-arrow";
        }
        else {
          return undefined

        }
      },
      handleKeyCommand(command, editorState, evenTimeStamp, { setEditorState }) {

        if (command === "fire-arrow") {

          setEditorState(editorState)

          return "handled"
        }

        return undefined
      },
      handleReturn(e, newState, { setEditorState: setEditorState_ }) {

        if (isShowing) {
          editorState = newState
          setEditorState = setEditorState_
          insertMention();
          //  insertMention(matchFriendArr[tabIndex % matchFriendArr.length]);
          return "handled"
        }
        else {
          return undefined
        }
      },

      decorators: [
        {
          strategy: mentionStrategy,
          component: Mention,//MentionWrapFn,//withContext(withTheme(Mention))
        }
      ],

    }

  }

}