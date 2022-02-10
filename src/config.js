import { stateToHTML } from 'draft-js-export-html';



export const url = "http://192.168.0.100";



export function toPreHtml(editorState, theme, voteBlockId) {

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
          const data = escape(JSON.stringify({ ...block.getData().toObject(), voteBlockId }))
          const type = block.getType()
          const key = block.getKey()
          return `<object  data-type="vote-block"  data-block_key="${key}" data-block_data="${data}" >` + escape(block.getText()) + '</object>'
        },



      },

    }
  )
  return preHtml
}
