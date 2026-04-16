import { visit } from 'unist-util-visit';

const handlers = {
  callout: asAside,
  Callout: asAside,
  overflowx: asOverflow,
  OverflowX: asOverflow,
  storybook: asStorybook,
  Storybook: asStorybook,
};

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
