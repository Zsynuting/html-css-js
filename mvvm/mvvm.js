function MVVM(options) {
  this.$options = options;
  let data = this._data = this.$options.data;

  Object.keys(data).forEach(key => this._proxyData(key));

  this._initComputed();

  observe(data);
  
  this._initWatch();

  this.$compile = new Compile(options.el || document.body, this);
}

MVVM.prototype = {
  _proxyData(key) {
    Object.defineProperty(this, key, {
      enumerable: true,
      configurable: false,
      get: () => {
        return this._data[key];
      },
      set: (newVal) => {
        this._data[key] = newVal;
      }
    })
  },

  _initComputed() {
    let computed = this.$options.computed;
    if (typeof computed === 'object') {
      Object.keys(computed).forEach(key => {
        Object.defineProperty(this, key, {
          get: typeof computed[key] === 'function' ? computed[key] : computed[key].get,
          set() {}
        })
      })
    }
  },

  _initWatch() {
    let watch = this.$options.watch;
    if (typeof watch === 'object') {
      Object.keys(watch).forEach(key => {
        if (typeof watch[key] === 'function') {
          new Watcher(this, key, watch[key]);
        }
      })
    }
  }
}