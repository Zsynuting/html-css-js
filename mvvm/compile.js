function Compile(el, vm) {
  this.$vm = vm;
  this.$el = this.isElementNode(el) ? el : document.querySelector(el);

  if (this.$el) {
    this.$fragment = this.node2Fragment(this.$el);
    this.init();
    this.$el.appendChild(this.$fragment);
  }

}

Compile.prototype = {
  isDirective(attr) {
    return attr.indexOf('v-') === 0;
  },

  isEventDirective(attr) {
    return attr.indexOf('on') === 0;
  },

  isElementNode(node) {
    return node.nodeType === 1;
  },

  isTextNode(node) {
    return node.nodeType === 3;
  },

  node2Fragment(el) {
    let fragment = document.createDocumentFragment(),
      child;

    // move native node into fragment
    // fragment.appendChild will append 'child' to fragment
    // if child is existing in DOM already, it will be remove from original place
    // that's why code below is always fetching the first child.
    while (child = el.firstChild) {
      fragment.appendChild(child);
    }

    return fragment;
  },

  compile(node) {
    let nodeAttrs = node.attributes;
    [].slice.call(nodeAttrs).forEach(attr => {
      let attrName = attr.name;
      if (this.isDirective(attrName)) {
        let exp = attr.value;
        //get accurate directive after v-
        let dir = attrName.substring(2);
        if (this.isEventDirective(dir)) {
          compileUtil.eventHandler(node, this.$vm, exp, dir);
        } else {
          compileUtil[dir] && compileUtil[dir](node, this.$vm, exp);
        }
        node.removeAttribute(attrName);
      }
    })
  },

  compileText(node, exp) {
    compileUtil.text(node, this.$vm, exp);
  },

  compileElement(el) {
    let childNodes = el.childNodes;

    [].slice.apply(childNodes)
      .forEach((node) => {
        let text = node.textContent;
        let reg = /\{\{(.*)\}\}/;
        if (this.isElementNode(node)) {
          this.compile(node);
        } else if (this.isTextNode(node) && reg.test(text)) {
          // RegExp.$1 is the first group match by reg.test(text)
          this.compileText(node, RegExp.$1);
        }

        if (node.childNodes && node.childNodes.length) {
          this.compileElement(node);
        }
      })
  },

  init() {
    this.compileElement(this.$fragment);
  },
}

const compileUtil = {
  __getVMVal(vm, attrExp) {
    // vm is the virtual node compiled by options
    // attrExp is the property binding to HTML nodes
    let val = vm;
    attrs = attrExp.split('.');
    attrs.forEach(attr => val = val[attr]);
    return val;
  },

  __setVMVal(vm, attrExp, value) {
    let val = vm;
    attrs = attrExp.split('.');
    attrs.forEach((attr, i) => {
      if (i < attrs.length - 1) {
        val = val[attr];
      } else {
        val[attr] = value;
      }
    })
  },

  eventHandler(node, vm, exp, dir) {
    let eventType = dir.split(':')[1],
      fn = vm.$options.methods && vm.$options.methods[exp];

    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false);
    }
  },

  bind(node, vm, exp, dir) {
    let updaterFn = updater[dir + 'Updater'];

    updaterFn && updaterFn(node, this.__getVMVal(vm, exp));

    new Watcher(vm, exp, (value, oldValue) => {
      updaterFn && updaterFn(node, value, oldValue);
    });
  },

  text(node, vm, exp) {
    this.bind(node, vm, exp, 'text');
  },

  html(node, vm, exp) {
    this.bind(node, vm, exp, 'html');
  },

  model(node, vm, exp) {
    this.bind(node, vm, exp, 'model');

    let val = this.__getVMVal(vm, exp);
    node.addEventListener('input', (e) => {
      let newValue = e.target.value;
      if (val === newValue) return;
      this.__setVMVal(vm, exp, newValue);
      val = newValue;
    })
  },

  class(node, vm, exp) {
    this.bind(node, vm, exp, 'class');
  }
}

const updater = {
  textUpdater(node, value) {
    node.textContent = typeof value === 'undefined' ? "" : value;
  },

  htmlUpdater(node, value) {
    node.innerHTML = typeof value === 'undefined' ? "" : value;
  },

  classUpdater(node, value, oldValue) {
    let className = node.className;
    className = className.replace(oldValue, '').replace(/\s$/, '');
    let space = className && String(value) ? ' ' : '';
    node.className = className + space + value;
  },

  modelUpdater(node, value) {
    node.value = typeof value === 'undefined' ? '' : value;
  }
}