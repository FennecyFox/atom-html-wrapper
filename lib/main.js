'use babel';

import { CompositeDisposable } from 'atom';
import Wrapper from '../lib/wrapper';

const main = {
  activate(state) {
    this.subscriptions = new CompositeDisposable;
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'html-wrapper:wrapp': () => this.wrapp()
    }));
  },
  deactivate() {
    this.subscriptions.dispose();
  },
  wrapp() {
    const editor = atom.workspace.getActivePaneItem();
    const range = editor.getSelectedBufferRange();
    let text = editor.getSelectedText();
    const prev = editor.getTextInBufferRange({
      start: {
        column: 0,
        row: 0
      },
      end: range.start
    }).trim() || '';
    let opened = undefined;
    let closed = undefined;
    let extra = undefined;
    let tag = undefined;

    prev.replace(/(.*)<(select|ul|ol|nav|tr)([^>]*)(>$)/ig, function(a, b, c, d) {
      if (c) { opened = c; }
    });

    prev.replace(/(.*)<\/?([a-z]+)([^>]*)(>)$/g, function(a, b, c) {
      if (c) {
        const reg = new RegExp(`(.*)(<${c})([^>]*)(>)(.*)</?([a-z]+)([^>]*)(>)$`, 'ig');
        prev.replace(reg, function(a, b, c, d) {
          extra = d || null;
        });
        closed = c;
      }
    });

    tag = (((opened && opened.match(/^(select|ul|ol|nav|tr)$/ig)) || (closed && closed.match(/^(option|li|a|td|div|span|strong)$/ig))) ? opened || closed : null);
    if (tag) {
      text = Wrapper(text, {
        tag,
        extra
      }
      );
      editor.setTextInBufferRange(range, text);
      return editor.autoIndentSelectedRows();
    }
  }
};

export default main;
