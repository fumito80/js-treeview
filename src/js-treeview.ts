'use strict';

interface TreeviewNode {
  name: string;
  children: TreeviewNode[];
};

type TreeviewNodes = TreeviewNode[]; 

interface Options {
  fontPxSize: number;
  addonCss: string;
  folderImageColor: string;
  folderImage: string;
}

class Treeview {
  private shadowRoot: ShadowRoot;
  private options: Options;
  constructor(htmlElement: HTMLElement, options: Options) {
    this.shadowRoot = htmlElement.attachShadow({ mode: 'closed' });
    this.options = {
      fontPxSize: 14,
      folderImageColor: '#222222',
      addonCss: '',
      ...options,
    };
    this.options.folderImage = this.options.folderImage || this.drawFolderImage(this.options);
  }
  public reset(json: TreeviewNodes) {
    this.shadowRoot.innerHTML = [
      this.css(this.options),
      this.options.addonCss,
      '<ul>',
      this.setNodes(json),
      '</ul>',
    ].join('');
    this.setJS(this.shadowRoot);
  }
  private setNodes(json: TreeviewNodes) {
    return json.reduce((acc, node: TreeviewNode) => acc + this.setNode(node), '');
  }
  private setNode({ name, children = [] }: TreeviewNode): string {
    const nodes = this.setNodes(children);
    return `
      <li>
        <input type="checkbox">
        <label><input type="radio" name="selected"><span>${name}</span></label>
        <ul>${nodes}</ul>
      </li>
    `;
  }
  private css({ fontPxSize, folderImage }: Options) {
    return `
      <style>
        ul {
          font-size: ${fontPxSize}px;
          height: auto;
          visibility: visible;
          overflow: hidden;
          padding-inline-start: 20px;
        }
        li {
          list-style-type: none;
          position: relative;
        }
        label {
          cursor: pointer;
        }
        input {
          -webkit-appearance: none;
          -moz-appearance: none;
        }
        input[type="checkbox"] {
          position: absolute;
          outline: none;
        }
        input[type="checkbox"]::before {
          content: '';
          cursor: pointer;
          position: absolute;
          left: -${fontPxSize}px;
          width: ${fontPxSize}px;
          height: ${fontPxSize}px;
          background-image: url(${folderImage});
          transition: transform 0.2s 0s ease;
        }
        input[type="checkbox"]:checked::before {
          transform: rotate(90deg);
        }
        input[type="checkbox"]:not(:checked) ~ ul {
          height: 0;
          visibility: hidden;
        }
        input[type="radio"] + span:hover,
        input[type="radio"]:checked + span {
          background-color: #DDDDDD;
        }
      </style>
    `;
  }
  private setJS(shadowRoot: ShadowRoot) {
    return ``;
  }
  private drawFolderImage({ folderImageColor, fontPxSize }: Options) {
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
