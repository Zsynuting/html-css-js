/**
 * implement Array.prototype.reduce
 */

if (!Array.prototype.reduce) {
  /**
   * callback parameters are:
   *        accumulator
   *        current item
   *        current index
   *        array
   */
  Array.prototype.reduce = function (callback, initialValue) {
    if (callback) {
      if (typeof callback !== "function") {
        throw new Error("callback is not function");
      }
    } else {
      throw new Error("callback is not provided");
    }
    let accumulator, index = 0;
    if (initialValue) {
      accumulator = initialValue;
    } else {
      if (this.length) {
        accumulator = this[0];
        index = 1;
      } else {
        throw new Error("empty array with no initial value");
      }
    }
    for (; index < this.length; index++) {
      accumulator = callback(accumulator, this[index], index, this);
    }
    return accumulator;
  }
}