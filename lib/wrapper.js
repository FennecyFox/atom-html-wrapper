'use babel';

import { setSlug, stripTags } from '../lib/helpers';

const replaceSlug = function(tag, url) {
  if (tag.match(/href/)) {
    tag = tag.replace(/(.*)?(href)([\s]+)?(\=)(["']{1})?([^"'\s]+)?(.*)/, `$1$2$3$4$5$6/${setSlug(url)}$7`);
  }
  return tag;
};

const replaceValue = function(tag, url) {
  if (tag.match(/value/)) {
    tag = tag.replace(/(.*)?(value)([\s]+)?(\=)(["']{1})?([^"'\s]+)?(.*)/, `$1$2$3$4$5$6${url.trim()}$7`);
  }
  return tag;
};

const outerTag = function(text, tag) {
  let x;
  return x = `<${tag}>\n${text}\n</${tag}>`;
};

const create = function(lines, tag, close) {
  if (lines.length > 0) {
    for (let i in lines) {
      lines[i] = `<${tag.match(/^a\s?/i)
        ? replaceSlug(tag, lines[i])
        : tag.match(/^option\s?/i)
          ? replaceValue(tag, lines[i])
          : tag}>${lines[i].trim()}</${close}>`;
    }
  }
  return lines.join('\n');
};

const replace = function(lines, tag, close) {
  let str = undefined;
  if ((lines.length > 0) && tag.match(/^(select|option|nav|a)$/ig)) {
    let i;
    if (lines[0].match(/(.*)(value|href)(\=)(["']{2})(.*)/ig)) {
      for (i in lines) {
        lines[i] = lines[i].replace(/(.*)(value|href)(\=)(["']{2})(.*)/ig, `$1$2$3'${ ((
          tag.match(/^(nav|a)$/ig)
          ? `/${setSlug(stripTags(lines[i]))}`
          : stripTags(lines[i]))).trim()}'$5`);
      }
    } else {
      switch (tag) {
        case 'select':
        case 'option':
          for (i in lines) {
            str = (
              lines[i].match(/(.*)(value)(\=)(["']{1})?([0-9]+)(["']{1})?(.*)/ig)
              ? ''
              : i);
            lines[i] = lines[i].replace(/(.*)(value)(\=)(["']{1})?([^"']+)?(.*)/ig, `$1$2$3$4${str}$6`);
          }
          break;
        case 'nav':
        case 'a':
          for (i in lines) {
            lines[i] = lines[i].replace(/(.*)(value|href)(\=)(["']{1})?([^"'\s]+)?(.*)/ig, '$1$2$3$4$6');
          }
          break;
      }
    }
  }
  return lines.join('\n');
};

const innerTags = function(text, tag, extra) {
  const lines = text.split(/\n|\r/g);
  let close = tag;
  switch (tag) {
    case 'select':
      extra = extra || ' value=""';
      tag = (close = 'option');
      break;
    case 'ul':
    case 'ol':
      tag = 'li';
      close = tag;
      break;
    case 'tr':
      tag = 'td';
      close = tag;
      break;
    case 'nav':
    case 'a':
      extra = extra || ' href=""';
      tag = (close = 'a');
      break;
  }

  const has = (
    text.match(new RegExp(`^([\\s]*<)${tag}(\\s|>)`, 'ig'))
    ? 1
    : 0);
  if (has) {
    return replace(lines, tag, close);
  } else {
    if (extra) {
      tag += extra;
    }
    return create(lines, tag, close);
  }
  return '';
};

export default function Wrapper(text, params) {
  params = params || {};
  if (text.length > 0) {
    let r = innerTags(text, params.tag, params.extra);
    if (!params.tag) {
      r = outerTag(r, 'ul');
    }
    return r;
  }
};
