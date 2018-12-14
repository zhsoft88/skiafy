/**
 * skiafy is a Node.js based chromium devtools for converting SVG to skia icon files.
 *
 * @see https://github.com/zhsoft88/skiafy
 *
 * @author zhsoft88 <zhsoft88@icloud.com> (https://github.com/zhsoft88)
 * @copyright © 2018 zhuatang.com
 * @license MIT
 */

const FS = require('fs')
const PATH = require('path')
const SVGO = require('svgo')
const skiafy = require('./skiafy.js')

let svgo

function error(mesg) {
  console.error(`Error: ${mesg}`)
}

function warn(mesg) {
  console.error(`Warning: ${mesg}`)
}

function error_exit(mesg) {
  error(mesg)
  process.exit(1)
}

function is_dir(path) {
  try {
    return FS.statSync(path).isDirectory();
  } catch(e) {}
  return false;
}

function parse_args() {
  const result =  {
    help: false,
    version: false,
    optimize: true,
    inputs: [],
    trailings: [],
    outputs: [],
    quiet: false,
    outputEnd: false,
  }
  const string_prefix = '--string'
  const input_prefix = '--input'
  const output_prefix = '--output'
  let i = 2
  while (i < process.argv.length) {
    const arg = process.argv[i]
    if (arg == '--help' || arg == '-h') {
      result.help = true
    } else if (arg == '--version' || arg == '-v') {
      result.version = true
    } else if (arg == '--no-optimize' || arg == '-n') {
      result.optimize = false
    } else if (arg == string_prefix || arg.startsWith(string_prefix + '=')) {
      if (arg == string_prefix || arg == string_prefix + '=')
        error_exit(`no argument specified for ${string_prefix}`)

      result.inputs.push({type: 's', value: arg.substr(string_prefix.length + 1)})
    } else if (arg == '-s') {
      i++
      if (i == process.argv.length)
        error_exit(`no argument specified for ${arg}`)

      result.inputs.push({type: 's', value: process.argv[i]})
    } else if (arg == input_prefix || arg.startsWith(input_prefix + '=')) {
      if (arg == input_prefix || arg == input_prefix + '=')
        error_exit(`no argument specified for ${input_prefix}`)

      const path = arg.substr(input_prefix.length + 1)
      result.inputs.push({type: is_dir(path) ? 'd' : 'f', value: path })
    } else if (arg == '-i') {
      i++
      if (i == process.argv.length)
        error_exit(`no argument specified for ${arg}`)

      const path = process.argv[i]
      result.inputs.push({type: is_dir(path) ? 'd' : 'f', value: path})
    } else if (arg == output_prefix || arg.startsWith(output_prefix + '=')) {
      if (arg == output_prefix || arg == output_prefix + '=')
        error_exit(`no argument specified for ${output_prefix}`)

      const path = arg.substr(output_prefix.length + 1)
      result.outputs.push({type: is_dir(path) ? 'd' : 'f', value: path, cmdline: arg})
    } else if (arg == '-o') {
      i++
      if (i == process.argv.length)
        error_exit(`no argument specified for ${arg}`)

      const path = process.argv[i]
      result.outputs.push({type: is_dir(path) ? 'd' : 'f', value: path, cmdline: `-o ${path}`})
    } else if (arg == '-q' || arg == '--quiet') {
      result.quiet = true
    } else if (arg == '-e') {
      result.outputEnd = true
    } else {
      // take all trailing arguments
      for (;i < process.argv.length; i++) {
        const path = process.argv[i]
        result.trailings.push({type: is_dir(path) ? 'd' : 'f', value: path})
      }
      break
    }
    i++
  }
  if (!Boolean(process.stdin.isTTY)) {
    result.trailings.push({type: 'f', value: '-'})
  }
  return result
}

function usage() {
  console.log(
`Node.js based chromium devtools for converting SVG files to Skia Vector Icon files

Usage:
  skiafy [OPTIONS] [ARGS]

Options:
  -h, --help: Help
  -v, --version : Version
  -n, --no-optimize : Not optimize SVG files (use SVGO for optimization)
  -s STRING, --string=STRING : Input SVG data string
  -i INPUT, --input=INPUT : Input file or folder, "-" for STDIN
     (for folder, convert all *.svg files to *.icon files)
  -o OUTPUT, --output=OUTPUT : Output file or folder, "-" for STDOUT
  -q, --quiet: Only show error messages
  -e : Output END line (default: no)

Arguments:
  INPUT : Alias to --input
`)
}

function help_exit() {
  usage()
  process.exit(0)
}

function find_all_files_in_dir(dir, ext) {
  function impl(dir, ext, result) {
    for (const name of FS.readdirSync(dir)) {
      const path =  PATH.join(dir, name)
      if (FS.statSync(path).isDirectory()) {
        impl(path, ext, result)
      } else if (!ext || name.endsWith(ext)) {
        result.push(path)
      }
    }
  }
  const result = []
  impl(dir, ext, result)
  for (let i = 0; i < result.length; i++) {
    result[i] = PATH.relative(dir, result[i])
  }
  return result
}

function mkdir_p(parent_dir, child_dir) {
  const list = child_dir.split(PATH.sep)
  let path
  for (const item of list) {
    if (path) {
      path = PATH.join(path, item)
    } else {
      path = item
    }
    const target = PATH.join(parent_dir, path)
    if (is_dir(target))
      continue

    try {
      FS.mkdirSync(target)
    } catch (e) {
      error(`mkdir ${target} failed, reason: ${e}`)
      return false
    }
  }
  return true
}

function skiafy_write(args, source, target, data) {
  const options = args.outputEnd ? {outputEnd: true} : {}
  const skdata = skiafy(data, options)
  if (target == '-') {
    console.log(skdata)
    return
  }

  try {
    FS.writeFileSync(target, skdata)
    if (!args.quiet) {
      console.log(`${source} --> ${target}`)
    }
  } catch (e) {
    error(`write ${target} failed, reason: ${e}, source: ${source}`)
  }
}

function skiafy_data(args, source, target, data) {
  if (args.optimize) {
    svgo.optimize(data).then(result => {
      skiafy_write(args, source, target, result.data)
    }).catch(reason => {
      error(`svgo failed for target: ${target}, reason: ${reason}`)
    })
  } else {
    skiafy_write(args, source, target, data)
  }
}

function skiafy_file(args, source, target) {
  if (source == '-') {
    const data = args.stdin_data
    skiafy_data(args, source, target, data)
  } else {
    try {
      const data = FS.readFileSync(source, 'utf8')
      skiafy_data(args, source, target, data)
    } catch (e) {
      error(`read failed, file: ${source}`)
    }
  }
}

function skiafy_files(args, files, from_dir, target_dir, create_dir) {
  for (const file of files) {
    if (create_dir && !mkdir_p(target_dir, PATH.dirname(file))) {
      const dir = PATH.join(target_dir, PATH.dirname(file))
      error(`mkdir failed: ${dir}`)
      continue
    }

    const source = PATH.join(from_dir, file)
    const target = PATH.join(target_dir, PATH.dirname(file), PATH.basename(file, '.svg') + '.icon')
    skiafy_file(args, source, target)
  }
}

function gen_icon_file(file) {
  if (file == '-')
    return file

  let result = file
  let index = result.lastIndexOf('.')
  if (index != -1) {
    result = result.substr(0, index)
  }
  result += '.icon'
  return result
}

function process_one(args, input, output) {
  if (input.type == 'd') {
    // dir input
    const from_dir = input.value
    const files = find_all_files_in_dir(from_dir, '.svg')
    if (files.length == 0)
      return

    if (output) {
      if (output.type == 'd') {
        skiafy_files(args, files, from_dir, output.value, true)
      } else {
        // convert the first one to target file
        {
          const file = files[0]
          files.splice(0, 1)
          const source = PATH.join(from_dir, file)
          skiafy_file(args, source, output.value)
        }

        skiafy_files(args, files, from_dir, from_dir)
      }
    } else {
      skiafy_files(args, files, from_dir, from_dir)
    }
  } else if (input.type == 's') {
    // string input
    if (output) {
      if (output.type == 'd') {
        // adjust output to stdout when input from string and output to folder
        skiafy_data(args, input.value, '-')
      } else {
        skiafy_data(args, input.value, output.value)
      }
    } else {
      skiafy_data(args, input.value, '-')
    }
  } else {
    // file input
    if (output) {
      if (output.type == 'd') {
        // adjust output to stdout when input from stdio and output to folder
        const target = input.value == '-' ? '-' : PATH.join(output.value, gen_icon_file(PATH.basename(input.value)))
        skiafy_file(args, input.value, target)
      } else {
        skiafy_file(args, input.value, output.value)
      }
    } else {
      const target = gen_icon_file(input.value)
      skiafy_file(args, input.value, target)
    }
  }
}

function do_work(args) {
  // make input/output pairs
  const pairs_len = Math.min(args.inputs.length, args.outputs.length)
  const pair_inputs = args.inputs.splice(0, pairs_len)
  const pair_outputs = args.outputs.splice(0, pairs_len)

  // remove trailing outputs after first folder, make first folder as default output folder
  let default_output_folder = null
  let ignore_outputs = []
  for (let i = 0; i < args.outputs.length; i++) {
    if (args.outputs[i].type == 'd') {
      default_output_folder = args.outputs[i]
      ignore_outputs = args.outputs.splice(i + 1)
      break
    }
  }
  if (ignore_outputs.length > 0) {
    let list = []
    for (const item of ignore_outputs) {
      list.push(item.cmdline)
    }
    const mesg = list.join(' ')
    warn(`ignore extra output arguments: ${mesg}`)
  }

  // process input/output pairs
  for (let i = 0; i < pairs_len; i++) {
    process_one(args, pair_inputs[i], pair_outputs[i])
  }

  // process other inputs
  const inputs = args.inputs.concat(args.trailings)
  for (let i = 0; i < inputs.length; i++) {
    process_one(args, inputs[i], i < args.outputs.length ? args.outputs[i] : default_output_folder)
  }
}

function run() {
  const args = parse_args()
  if (args.help) {
    help_exit()
  }

  if (args.version) {
    const pjson = require('../package.json')
    console.log(pjson.version)
    process.exit(0)
  }

  if (args.inputs.length == 0 && args.trailings.length == 0) {
    if (process.argv.length == 2) {
      help_exit()
    }

    usage()
    error('no inputs found')
    process.exit(1)
  }

  svgo = new SVGO({
    plugins: [{
      cleanupAttrs: true,
    }, {
      removeDoctype: true,
    },{
      removeXMLProcInst: true,
    },{
      removeComments: true,
    },{
      removeMetadata: true,
    },{
      removeTitle: true,
    },{
      removeDesc: true,
    },{
      removeUselessDefs: true,
    },{
      removeEditorsNSData: true,
    },{
      removeEmptyAttrs: true,
    },{
      removeHiddenElems: true,
    },{
      removeEmptyText: true,
    },{
      removeEmptyContainers: true,
    },{
      removeViewBox: false,
    },{
      cleanupEnableBackground: true,
    },{
      convertStyleToAttrs: true,
    },{
      convertColors: true,
    },{
      convertPathData: true,
    },{
      convertTransform: true,
    },{
      removeUnknownsAndDefaults: true,
    },{
      removeNonInheritableGroupAttrs: true,
    },{
      removeUselessStrokeAndFill: true,
    },{
      removeUnusedNS: true,
    },{
      cleanupIDs: true,
    },{
      cleanupNumericValues: true,
    },{
      moveElemsAttrsToGroup: true,
    },{
      moveGroupAttrsToElems: true,
    },{
      collapseGroups: true,
    },{
      removeRasterImages: false,
    },{
      mergePaths: true,
    },{
      convertShapeToPath: true,
    },{
      sortAttrs: true,
    },{
      removeDimensions: true,
    },{
      removeAttrs: {attrs: '(stroke|fill)'},
    }]
  })

  function has_stdin(list) {
    for (const item of list) {
      if (item.value == '-')
        return true
    }
    return false
  }
  if (has_stdin(args.inputs) || has_stdin(args.trailings)) {
    // read stdin first
    process.stdin.resume()
    process.stdin.setEncoding('utf8')

    var stdin_data = ''
    process.stdin.on('data', function(chunk) {
      stdin_data += chunk
    })
    process.stdin.on('end', function() {
      args.stdin_data = stdin_data
      do_work(args)
    })
  } else {
    do_work(args)
  }
}

module.exports.run = run
