function Watcher(vm, expOrFn, cb) {
  this.cb = cb;
  this.vm = vm;
  this.expOrFn = expOrFn;
  this.depIds = {};

  if (typeof expOrFn === 'function') {
    this.getter = expOrFn;
  } else {
    this.getter = this.parseGetter(expOrFn);
  }

  this.value = this.get();
}

Watcher.prototype = {
  run() {
    let value = this.get();
    let oldValue = this.value;
    if (value !== oldValue) {
      this.value = value;
      this.cb.call(this.vm, value, oldValue);
    }
  },

  update() {
    this.run();
  },

  addDep(dep) {
    if (!(dep.id in this.depIds)) {
      dep.addSub(this);
      this.depIds[dep.id] = dep;
    }
  },

  get() {
    Dep.target = this;
    let value = this.getter.call(this.vm, this.vm);
    Dep.target = null;
    return value;
  },

  parseGetter(exp) {
    // RegExp below is to only allow \w . $ in exp
    // exp is actually an expression in {{}}, v-model, v-bind
    if (/[^\w.$]/.test(exp)) return;
    
    let exps = exp.split('.');
    return function (obj) {
      if (obj) {
        for (let i = 0, length = exps.length; i < length; i++) {
          obj = obj[exps[i]];
        }
      }
      return obj;
    }
  }
}