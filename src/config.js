import { stateToHTML } from 'draft-js-export-html';

import useMediaQuery from '@mui/material/useMediaQuery';

import { ThemeProvider, useTheme, createTheme, styled } from '@mui/material/styles';

export const url = "http://192.168.0.100";



export function toPreHtml(editorState, theme) {

  const preHtml = stateToHTML(
    editorState.getCurrentContent(),
    {
      defaultBlockTag: "div",



      inlineStyleFn: function (styleNameSet) {

        const styleObj = {

          element: "span",
          style: {},
          attributes: {}

        }


        if (styleNameSet.toArray().includes("linkTagOn")) {
          //  styleObj.style = { color: blue[800] }
          styleObj.attributes["data-type"] = "link"
        }
        if (styleNameSet.toArray().includes("linkTagOff")) {
          //    styleObj.style = { color: blue[800] }
          styleObj.attributes["data-type"] = "link"
        }



        return styleObj

      },


      entityStyleFn: function (entity) {
        const { type, data, mutablity } = entity.toObject()

        //  console.log(type, data, mutablity)

        if (type.indexOf("mention") >= 0) {
          return {
            element: 'object',
            attributes: {
              "data-type": "mention-tag"
            },

          }
        }
        else if (type.indexOf("personTag") >= 0) {
          return {
            element: 'object',
            attributes: {
              "data-type": "person-tag"
            },

          }

        }

      },

      blockStyleFn: function (block) {

        const text = block.getText()
        const data = block.getData().toObject()
        const type = block.getType()
        const key = block.getKey()

        return {
          style: {
            ...(type === "centerBlock") && { textAlign: "center" },  // style will be a string not an object during toHtmll call
            ...(type === "rightBlock") && { textAlign: "right" },


            // ...(data.isSmallFont&&type==="rightBlock")&&{transform:"translateX(10%) scale(0.8) ",backgroundColor:"pink",lineHeight:1},
            // ...(data.isSmallFont&&type==="unstyled")&&{transform:"translateX(-10%) scale(0.8) ",backgroundColor:"pink",lineHeight:1},
            // ...(data.isSmallFont&&type==="centerBlock")&&{transform:"scale(0.8) ",backgroundColor:"pink",lineHeight:1},

            // ...styleObj.centerBlock && { textAlign: "center" },
            // ...styleObj.rightBlock && { textAlign: "right" }

          },
          attributes: {
            ...data.isSmallFont && { "small-font": "small-font" },
            ...(type === "centerBlock") && { "text-align": "center" },
            ...(type === "rightBlock") && { "text-align": "right" },

            // ...styleObj.centerBlock && { className: "text-center" },
            // ...styleObj.rightBlock && { className: "text-right" }
          }
        }


      },


      blockRenderers: {




        imageBlock: function (block) {
          const text = block.getText()
          const data = escape(JSON.stringify(block.getData().toObject()))
          //  console.log(JSON.stringify(block.getData().toObject()))

          //const data = block.getData().toObject()

          const type = block.getType()
          const key = block.getKey()
          return `<object  data-type="image-block"  data-block_key="${key}" data-block_data="${data}" >` + escape(block.getText()) + '</object>'
        },

        voteBlock: function (block) {
          const data = escape(JSON.stringify({ ...block.getData().toObject() }))
          const type = block.getType()
          const key = block.getKey()
          return `<object  data-type="vote-block"  data-block_key="${key}" data-block_data="${data}" >` + escape(block.getText()) + '</object>'
        },



      },

    }
  )
  return preHtml
}


export function hexify(color) {
  var values = color
    .replace(/rgba?\(/, '')
    .replace(/\)/, '')
    .replace(/[\s+]/g, '')
    .split(',');
  var a = parseFloat(values[3] || 1),
    r = Math.floor(a * parseInt(values[0]) + (1 - a) * 255),
    g = Math.floor(a * parseInt(values[1]) + (1 - a) * 255),
    b = Math.floor(a * parseInt(values[2]) + (1 - a) * 255);
  return "#" +
    ("0" + r.toString(16)).slice(-2) +
    ("0" + g.toString(16)).slice(-2) +
    ("0" + b.toString(16)).slice(-2);
}

export function hexToRGB(hex, alpha) {
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return hexify("rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")");
  } else {
    return hexify("rgb(" + r + ", " + g + ", " + b + ")");
  }
}

export function hexToRGB2(hex, alpha) {
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  } else {
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }
}


export function useScreenState() {
  const theme = useTheme()

  const xs = useMediaQuery(theme.breakpoints.only("xs"))
  const sm = useMediaQuery(theme.breakpoints.only("sm"))
  const md = useMediaQuery(theme.breakpoints.only("md"))
  const lg = useMediaQuery(theme.breakpoints.only("lg"))
  const xl = useMediaQuery(theme.breakpoints.only("xl"))
  return ["xs", "sm", "md", "lg", "xl"][[xs, sm, md, lg, xl].indexOf(true)]

}


export function uniqByKeepFirst(a, key) {
  let seen = new Set();
  return a.filter(item => {
    let k = key(item);
    return seen.has(k) ? false : seen.add(k);
  });
}

