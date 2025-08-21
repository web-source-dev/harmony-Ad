import { Node, mergeAttributes } from '@tiptap/core';

export const CustomVideo = Node.create({
  name: 'customVideo',
  
  addOptions() {
    return {
      inline: false,
      HTMLAttributes: {},
    };
  },
  
  group: 'block',
  
  draggable: true,
  
  isolating: true,
  
  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: 640,
      },
      height: {
        default: 480,
      },
      controls: {
        default: true,
      },
      autoplay: {
        default: false,
      },
      muted: {
        default: false,
      },
      loop: {
        default: false,
      },
      poster: {
        default: null,
      },
      type: {
        default: 'custom', // 'youtube' or 'custom'
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'video[src]',
        getAttrs: (node) => ({
          src: node.getAttribute('src'),
          width: node.getAttribute('width') || node.style.width,
          height: node.getAttribute('height') || node.style.height,
          controls: node.hasAttribute('controls'),
          autoplay: node.hasAttribute('autoplay'),
          muted: node.hasAttribute('muted'),
          loop: node.hasAttribute('loop'),
          poster: node.getAttribute('poster'),
          type: 'custom',
        }),
      },
      {
        tag: 'iframe[src*="youtube"]',
        getAttrs: (node) => {
          const src = node.getAttribute('src');
          const width = node.getAttribute('width') || node.style.width;
          const height = node.getAttribute('height') || node.style.height;
          
          return {
            src,
            width,
            height,
            type: 'youtube',
          };
        },
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    const { type, src, width, height, controls, autoplay, muted, loop, poster } = HTMLAttributes;
    
    if (type === 'youtube') {
      // Render YouTube iframe
      return ['iframe', mergeAttributes(this.options.HTMLAttributes, {
        src,
        width,
        height,
        frameborder: '0',
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        allowfullscreen: true,
        style: `border: none; border-radius: 8px;`,
      })];
    } else {
      // Render custom video element
      const videoAttrs = {
        src,
        width,
        height,
        style: `border-radius: 8px; max-width: 100%;`,
      };
      
      if (controls) videoAttrs.controls = 'controls';
      if (autoplay) videoAttrs.autoplay = 'autoplay';
      if (muted) videoAttrs.muted = 'muted';
      if (loop) videoAttrs.loop = 'loop';
      if (poster) videoAttrs.poster = poster;
      
      return ['video', mergeAttributes(this.options.HTMLAttributes, videoAttrs)];
    }
  },

  addCommands() {
    return {
      setCustomVideo: (attrs) => ({ tr, dispatch }) => {
        const { selection } = tr;
        const node = this.type.create(attrs);

        if (dispatch) {
          tr.replaceRangeWith(selection.from, selection.to, node);
        }

        return true;
      },
    };
  },
  
  addNodeView() {
    return ({ node, editor, getPos }) => {
      const container = document.createElement('div');
      container.className = 'custom-video-wrapper';
      container.style.cssText = `
        position: relative;
        margin: 1em 0;
        display: block;
      `;
      
      const { type, src, width, height, controls, autoplay, muted, loop, poster } = node.attrs;
      
      if (type === 'youtube') {
        // Create YouTube iframe
        const iframe = document.createElement('iframe');
        iframe.src = src;
        iframe.width = width;
        iframe.height = height;
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.style.cssText = `
          border: none;
          border-radius: 8px;
          max-width: 100%;
        `;
        container.appendChild(iframe);
      } else {
        // Create custom video element
        const video = document.createElement('video');
        video.src = src;
        video.width = width;
        video.height = height;
        video.style.cssText = `
          border-radius: 8px;
          max-width: 100%;
        `;
        
        if (controls) video.controls = true;
        if (autoplay) video.autoplay = true;
        if (muted) video.muted = true;
        if (loop) video.loop = true;
        if (poster) video.poster = poster;
        
        container.appendChild(video);
      }
      
      return {
        dom: container,
        update: (updatedNode) => {
          // Handle updates if needed
          return true;
        },
      };
    };
  },
});

export default CustomVideo;
