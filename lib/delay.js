exports.delay = function delay(n = 0) {
  return new Promise(r => setTimeout(r, n))
}