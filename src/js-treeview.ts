'use strict';

interface TreeviewNode {
  name: string;              // display name
  children?: TreeviewNode[]; // sub folder
  id?: string;               // your id key
  open?: boolean;            // initial open folder
  active?: boolean;          // initial active node
};

interface Options {
  fontSize: string;          // css font size for draw size (default attatched element font-size)
  addonCssText: string;      // overrides css
  folderImageColor: string;  // draw image color (default #222222)
  folderImageData: string;   // change draw image to base64 png image data
}

interface ITreeviewConstructor {
  new (rootElement: HTMLElement, options: Options): Treeview;
}

interface ITreeview {
  reset(json: TreeviewNode[]): void;
}

class Treeview implements ITreeview {
  private shadowRoot: ShadowRoot;
  private options: Options;
  constructor(rootElement: HTMLElement, options: Options) {
    let fontSize;
    if (options && /px$/.test(options.fontSize)) {
      fontSize = options.fontSize;
    } else if (options && !/px$/.test(options.fontSize)) {
      const testEl = rootElement.appendChild(document.createElement('span'));
      testEl.style.fontSize = options.fontSize;
      fontSize = getComputedStyle(testEl).fontSize;
    } else {
      fontSize = getComputedStyle(rootElement).fontSize;
    }
    this.shadowRoot = rootElement.attachShadow({ mode: 'closed' });
    this.options = {
      folderImageColor: '#222222',
      addonCssText: '',
      ...options,
      fontSize,
    };
    if (this.options.folderImageData == null) {
      const fontPxSize = Number(this.options.fontSize.replace('px', ''));
      this.options.folderImageData = this.drawFolderImage(fontPxSize, this.options);
    }
    this.setJS(this.shadowRoot);
  }
  public reset(json: TreeviewNode[]) {
    this.shadowRoot.innerHTML = [
      this.css(this.options),
      this.options.addonCssText,
      '<ul class="root">',
      this.setNodes(json),
      '</ul>',
    ].join('');
  }
  private setNodes(json: TreeviewNode[]) {
    return json.reduce((acc, node: TreeviewNode) => acc + this.setNode(node), '');
  }
  private setNode(treeviewNode: TreeviewNode): string {
    const { name, children = [], open = false, active = false, id = '' } = treeviewNode;
    const hasChildren = children.length === 0 ? "" : "hasChildren";
    return `
      <li>
        <input type="checkbox" class="${hasChildren}" ${open ? 'checked' : ''} tabindex="-1">
        <label>
          <input type="radio" name="selected" ${active ? 'checked' : ''} data-id="${id}" tabindex="-1">
          <span contenteditable="false" tabindex="0">${name}</span>
        </label>
        <ul>${this.setNodes(children)}</ul>
      </li>
    `;
  }
  private css({ fontSize, folderImageData }: Options) {
    return `
      <style>
        ul {
          font-size: ${fontSize};
          transition: all 5.2s 0s ease;
          height: auto;
          visibility: visible;
          overflow: hidden;
          padding-inline-start: 20px;
        }
        li {
          list-style-type: none;
          position: relative;
          margin: 1px;
        }
        label {
          cursor: pointer;
        }
        input {
          -webkit-appearance: none;
          -moz-appearance: none;
          width: 0;
          height: 0;
        }
        input[type="checkbox"] {
          position: absolute;
          padding: 2px;
          outline: none;
        }
        input[type="checkbox"].hasChildren::before {
          content: '';
          cursor: pointer;
          position: absolute;
          left: -${fontSize};
          width: ${fontSize};
          height: ${fontSize};
          background-image: url(${folderImageData});
          transition: transform 0.2s 0s ease;
        }
        input[type="checkbox"].hasChildren:checked::before {
          transform: rotate(90deg);
        }
        input[type="checkbox"].hasChildren:not(:checked) ~ ul {
          height: 0;
          visibility: hidden;
        }
        input[type="radio"] {
          position: absolute;
        }
        input[type="radio"] + span {
          display: inline-block;
          width: 100%;
          margin-left: 5px;
          padding: 2px 4px;
        }
        input[type="radio"]:checked + span {
          background-color: rgba(0, 0, 0, .05);
        }
        [contenteditable] {
          user-select: text;
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
        }
      </style>
    `;
  }
  private setJS(shadowRoot: ShadowRoot) {
    shadowRoot.addEventListener('click', e => {
      const target = e.target as HTMLElement;
      if (target.localName === 'span') {
        const radio = target.previousElementSibling as HTMLInputElement;
        if (radio.checked) {
          radio.checked = false;
        }
      }
    });
  }
  private drawFolderImage(fontPxSize: number, { folderImageColor }: Options) {
    const canvas = document.createElement('canvas');
    canvas.width = fontPxSize;
    canvas.height = fontPxSize;
    const ctx = canvas.getContext('2d');
    if (ctx == null) {
      return '';
    }
    ctx.fillStyle = folderImageColor;
    const left1 = fontPxSize / 3;
    const left2 = fontPxSize * (2 / 3);
    ctx.beginPath();
    ctx.moveTo(left1, fontPxSize / 2);
    ctx.lineTo(left1, 2);
    ctx.lineTo(left2, fontPxSize / 2);
    ctx.lineTo(left1, fontPxSize - 2);
    ctx.closePath();
    ctx.fill();
    return canvas.toDataURL();
  }
}
