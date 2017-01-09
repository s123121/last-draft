import {convertFromHTML} from 'draft-convert'
import {stateToHTML} from 'draft-js-export-html'
import {Entity, convertToRaw, convertFromRaw, EditorState} from 'draft-js'
import defaultDecorator from '../decorators/defaultDecorator'
import {html} from 'common-tags'

export function editorStateFromHtml (html, decorator = defaultDecorator) {
  if (html === null) {
    return EditorState.createEmpty(decorator)
  }

  const contentState = convertFromHTML({
    htmlToEntity: (nodeName, node) => {
      if (nodeName === 'a') {
        return Entity.create(
          'LINK',
          'MUTABLE',
          {url: node.href, target: node.target}
        )
      }
    },
    htmlToBlock: (nodeName, node) => {
      if (nodeName === 'img') {
        return {
          type: 'atomic',
          data: { src: node.src, type: 'image' }
        }
      }

      if (nodeName === 'span') {
        if(node.className === 'ld-pullquote'){
          return {
            type: 'pullquote'
          };
        }
      }

      if (nodeName === 'blockquote') {
        if(node.className === 'ld-blockquote'){
          return {
            type: 'blockquote'
          };
        }
      }
    }
  })(html)

  return EditorState.createWithContent(contentState, decorator)
}

export function editorStateToHtml (editorState) {
  if (editorState) {
    const content = editorState.getCurrentContent()
    return stateToHTML(content, {
      blockRenderers: {
        atomic: (block) => {
          let data = block.getData()
          let type = data.get('type')
          let url = data.get('src')
          let caption = data.get('caption')
          if (url && type == 'image') {
            return html`
              <figure>
                <img src="${url}" alt="${caption}">
                <figcaption>${caption}</figcaption>
              </figure>
            `
          }
          if(url && type == 'video'){
            return html`
            <figure>
              <iframe
                width="560"
                height="315"
                src="${url}"
                className="ld-video-block"
                frameBorder="0"
                allowFullScreen>
              </iframe>
              <figcaption>${caption}</figcaption>
            </figure>
            `
          }
        },
        blockquote: (block) => {
          let text = block.getText()
          return `<blockquote class='ld-blockquote' >${text}</blockquote>`
        },
        pullquote: (block) => {
          let text = block.getText()
          return `<span class='ld-pullquote' >${text}</span>`
        }
      }
    })
  }
}

export function editorStateToJSON (editorState) {
  if (editorState) {
    const content = editorState.getCurrentContent()
    return JSON.stringify(convertToRaw(content), null, 2)
  }
}

export function editorStateFromRaw (rawContent, decorator = defaultDecorator) {
  if (rawContent) {
    const content = convertFromRaw(rawContent)
    return EditorState.createWithContent(content, decorator)
  } else {
    return EditorState.createEmpty(decorator)
  }
}
