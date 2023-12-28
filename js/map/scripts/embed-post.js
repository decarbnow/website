'use strict'

class EmbedPost extends HTMLElement {
  static Style = `
    :host {
      --info-bg: #000;
      --info-text: #fff;
    }
    .content {
      width: 100%;
      max-height: var(--post-height-px);
    }
    .wrapper {
      //border-radius: 1rem;
      position: relative;
      overflow: auto;
    }
    .info-underlay {
      position: absolute;
      bottom: 0;
      z-index: -1;
      width: 100%;
      padding: 1rem;
      text-transform: uppercase;
      font-size: 16px;
      background: var(--info-bg);
      color: var(--info-text);
    }
  `
  static DefaultHeight = '300'
  static DefaultWidth = '800'

  /** @type {HTMLElement} */
  #content
  /** @type {HTMLElement} */
  #wrapper

  constructor() {
    super()
    const height =
      this.getAttribute('data-maxheight') || EmbedPost.DefaultHeight
    const width = this.getAttribute('data-maxwidth') || EmbedPost.DefaultWidth
    const postUrl = this.getAttribute('data-src')
    if (!postUrl) {
      throw new Error(`Missing data-src attribute in embed-post tag.`)
    }

    this.#constructDOM(postUrl, height)
    this.#requestEmbed(postUrl, height, width)
  }

  /**
   * @param {string} postUrl
   * @param {string} height
   */
  #constructDOM(postUrl, height) {
    this.#content = document.createElement('div')
    this.#content.setAttribute('class', 'content')
    this.#content.setAttribute('style', `--post-height-px: ${height}px`)

    const loading = document.createElement('aside')
    loading.setAttribute('class', 'info-underlay')
    loading.innerHTML = `Loading from ${new URL(postUrl).host}`

    this.#wrapper = document.createElement('div')
    this.#wrapper.setAttribute('class', 'wrapper')
    this.#wrapper.append(this.#content, loading)
  }

  /**
   * @param {string} postUrl
   * @param {string} height
   * @param {string} width
   */
  async #requestEmbed(postUrl, height, width) {
    try {
      const hostname = new URL(postUrl).host
      const resp = await fetch(
        `https://${hostname}/api/oembed?url=${postUrl}&maxwidth=${width}&maxheight=${height}`,
      )
      const embed = await resp.json()
      this.#content.innerHTML = embed.html
    } catch (e) {
      console.error('Failed to load embedded post.', e)
    }
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = EmbedPost.Style
    this.shadowRoot.append(style, this.#wrapper)
  }
}

customElements.define('embed-post', EmbedPost)
