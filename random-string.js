/**
 * @returns : return an exact length of random string 
 * @param {Number} length : the expected length of random string
 */

module.exports = function (length) {
  length = Number(length);
  if (isNaN(length)) {
    throw new Error("length is not an integer");
  } else {
    length = Math.floor(length);
  }
  let result = "";
  while (length > 0) {
    // pattern is 0.xxxxxxxxxxx, length is 13
    // the first character after . is probably 0, so we use the last 10 characters
    let pattern = Math.random().toString(32)
    result += pattern.substr(length > 10 ? -10 : -length);
    length -= 10;
  }
  return result;
}