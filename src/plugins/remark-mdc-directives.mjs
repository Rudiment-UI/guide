import { visit } from 'unist-util-visit';

const handlers = {
  callout: asAside,
  Callout: asAside,
  overflowx: asOverflow,
  OverflowX: asOverflow,
  storybook: asStorybook,
  Storybook: asStorybook,
};

let storybookLogoSeq = 0;

function asAside(node) {
  setHast(node, 'aside', { role: 'note', 'data-callout': '' });
}

function asOverflow(node) {
  setHast(node, 'div', {
    role: 'region',
    tabindex: '0',
    'aria-label': node.attributes?.label ?? 'Scrollable content',
    'data-overflow-x': '',
  });
}

function asStorybook(node) {
  const attrs = node.attributes ?? {};
  const url = attrs.url;
  const title = attrs.title ?? 'Storybook preview';
  const height = attrs.height ?? '400px';

  if (!url) {
    const data = node.data || (node.data = {});
    data.hName = 'div';
    data.hProperties = { role: 'alert', 'data-storybook-missing-url': '' };
    data.hChildren = [{ type: 'text', value: 'Missing Storybook URL.' }];
    return;
  }

  const data = node.data || (node.data = {});
  data.hName = 'figure';
  data.hProperties = {
    'data-storybook': '',
    'data-src': url,
    'data-title': title,
    'data-height': height,
  };
  data.hChildren = [
    {
      type: 'element',
      tagName: 'figcaption',
      properties: {},
      children: [
        { type: 'text', value: `${title} — ` },
        {
          type: 'element',
          tagName: 'a',
          properties: {
            href: url,
            target: '_blank',
            rel: 'noreferrer',
          },
          children: [{ type: 'text', value: 'open in Storybook' }],
        },
      ],
    },
    {
      type: 'element',
      tagName: 'button',
      properties: {
        type: 'button',
        'data-storybook-loader': '',
        style: `height: ${height};`,
      },
      children: [
        storybookLogo(),
        {
          type: 'element',
          tagName: 'span',
          properties: { 'data-storybook-loader-label': '' },
          children: [{ type: 'text', value: 'Load interactive preview' }],
        },
        {
          type: 'element',
          tagName: 'span',
          properties: { 'data-storybook-loader-hint': '' },
          children: [{ type: 'text', value: 'Embeds Storybook inline' }],
        },
      ],
    },
  ];
}

function storybookLogo() {
  const id = `sb-logo-${++storybookLogoSeq}`;
  const shapeId = `${id}-shape`;
  const maskId = `${id}-mask`;

  return {
    type: 'element',
    tagName: 'svg',
    properties: {
      'data-storybook-loader-logo': '',
      viewBox: '0 0 256 319',
      'aria-hidden': 'true',
    },
    children: [
      {
        type: 'element',
        tagName: 'defs',
        properties: {},
        children: [
          {
            type: 'element',
            tagName: 'path',
            properties: {
              id: shapeId,
              d: 'M9.872 293.324L.012 30.574C-.315 21.895 6.338 14.54 15.005 14L238.494.032c8.822-.552 16.42 6.153 16.972 14.975q.03.498.031.998v286.314c0 8.839-7.165 16.004-16.004 16.004q-.36 0-.718-.016l-213.627-9.595c-8.32-.373-14.963-7.065-15.276-15.388',
            },
            children: [],
          },
        ],
      },
      {
        type: 'element',
        tagName: 'mask',
        properties: { id: maskId, fill: '#fff' },
        children: [
          {
            type: 'element',
            tagName: 'use',
            properties: { href: `#${shapeId}` },
            children: [],
          },
        ],
      },
      {
        type: 'element',
        tagName: 'use',
        properties: { fill: '#ff4785', href: `#${shapeId}` },
        children: [],
      },
      {
        type: 'element',
        tagName: 'path',
        properties: {
          fill: '#fff',
          mask: `url(#${maskId})`,
          d: 'm188.665 39.127l1.527-36.716L220.884 0l1.322 37.863a2.387 2.387 0 0 1-3.864 1.96l-11.835-9.325l-14.013 10.63a2.387 2.387 0 0 1-3.829-2.001m-39.251 80.853c0 6.227 41.942 3.243 47.572-1.131c0-42.402-22.752-64.684-64.415-64.684c-41.662 0-65.005 22.628-65.005 56.57c0 59.117 79.78 60.249 79.78 92.494c0 9.052-4.433 14.426-14.184 14.426c-12.705 0-17.729-6.49-17.138-28.552c0-4.786-48.458-6.278-49.936 0c-3.762 53.466 29.548 68.887 67.665 68.887c36.935 0 65.892-19.687 65.892-55.326c0-63.36-80.961-61.663-80.961-93.06c0-12.728 9.455-14.425 15.07-14.425c5.909 0 16.546 1.042 15.66 24.801',
        },
        children: [],
      },
    ],
  };
}

function setHast(node, tagName, properties) {
  const data = node.data || (node.data = {});
  data.hName = tagName;
  data.hProperties = { ...(data.hProperties || {}), ...properties };
}

export function remarkMdcDirectives() {
  return (tree) => {
    visit(tree, (node) => {
      if (
        node.type !== 'containerDirective' &&
        node.type !== 'leafDirective' &&
        node.type !== 'textDirective'
      ) {
        return;
      }
      const handler = handlers[node.name];
      if (handler) handler(node);
    });
  };
}
