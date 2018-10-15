/**
 * skiafy is a Nodejs-based tool for converting SVG to skia icon files (for chromium dev).
 *
 * @see https://github.com/zhsoft88/skiafy
 *
 * @author zhsoft88 <zhsoft88@icloud.com> (https://github.com/zhsoft88)
 * @copyright © 2018 zhsoft88
 * @license MIT
 */

const FS = require('fs')
const {skiafy} = require('./skiafy.js')

function error_exit(mesg) {
  console.error(mesg)
  process.exit(1)
}

function run() {
  if (process.argv.length != 3) {
    error_exit('usage: skiafy svg_file')
  }

  const file = process.argv[2]
  let svg
  try {
    svg = FS.readFileSync(file, 'utf8')
  } catch (e) {
    error_exit(`Error: file read failed: ${file}`)
  }
  console.log(skiafy(svg))
}

module.exports.run = run
