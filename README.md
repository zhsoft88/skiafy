# Skiafy
Node.js based chromium devtools for converting SVG files to Skia Vector Icon files

## Installation

```sh
$ [sudo] npm install -g skiafy
```

## Usage

```
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
  -c : Output color (default: no)

Arguments:
  INPUT : Alias to --input
```

* With files:

  ```sh
  $ skiafy a.svg b.svg
  ```

  Output a.icon, b.icon

  ```sh
  $ skiafy -i a.svg -o test.icon -i b.svg -o /tmp/b.icon some.svg thing.svg
  ```

  Output test.icon, /tmp/b.icon, some.icon and thing.icon

  ```sh
  $ skiafy -o /tmp/myfolder *.svg
  ```

  Convert all svg files, output icon files to folder /tmp/myfolder

* With folders:

  ```sh
  $ skiafy /tmp/myfolder
  ```

  or

  ```sh
  $ skiafy -i /tmp/myfolder
  ```

  Convert all svg files in /tmp/myfolder

  ```sh
  $ skiafy -i /tmp/myfolder -o /path/to/yourfolder
  ```

  Convert all svg file in /tmp/myfolder and output icon files to /path/to/yourfolder

  ```sh
  $ skiafy -i a.svg -o test.icon -i b.svg -o /tmp/b.icon some.svg thing.svg
  ```

  Output test.icon, /tmp/b.icon, some.icon and thing.icon

* With STDIN / STDOUT

  ```sh
  $ cat a.svg | skiafy >/tmp/a.icon
  ```

  ```sh
  $ skiafy -o /tmp/a.icon < a.svg
  ```

  Read svg from pipe and output to /tmp/a.icon

  ```sh
  $ skiafy -o /tmp/a.icon -
  ```

  ```sh
  $ skiafy -i - -o /tmp/a.icon
  ```

  Read from stdin and output to /tmp/a.icon

* With strings

  ```sh
  $ skiafy -s "<svg..." >/tmp/a.icon
  ```

  ```sh
  $ skiafy -s "<svg..." -o /tmp/a.icon
  ```

* With all of above

  ```sh
  $ skiafy -s "<svg..." -o /tmp/a.icon -i a.svg -o aa.icon \
   -i - -o /tmp/stdin.icon \
   -i /tmp/myfolder -o /tmp/yourfolder \
   -o /tmp/outputfoder some.svg /tmp/test.svg
  ```

  ```
  Converts:
    convert string to /tmp/a.icon;
    convert a.svg to aa.icon;
    read from stdin and output to /tmp/stdin.icon;
    convert all svg files in /tmp/myfolder and output icon files to /tmp/yourfolder;
    convert some.svg, /tmp/test.svg, output some.icon and test.icon to /tmp/outputfolder;
  ```

* Output path color

  ```sh
  $ skiafy -c -o - a.svg
  ......
  NEW_PATH,
  PATH_COLOR_ARGB, 0xFF, 0xFF, 0xAA, 0x00,
  CIRCLE, 11.5, 11.5, 1.5
  ......
  ```

### <abbr title="As Nodejs Module Interface">As Nodejs Module</abbr>

```js
const skiafy = require('skiafy')
const FS = require('fs')

FS.readFile('test.svg', 'utf8', function(err, data) {
  if (err)
    throw err

  const options = {translateX: 0, translateY: 0, scaleX: 1, scaleY: 1, outputEnd: false, outputColor: true}
  const result = skiafy(data, options)
  console.log(result)
}
```

## Reference

[A little SVG to Skia converter tool](https://github.com/evanstade/skiafy)<br/>
[Node.js tool for optimizing SVG files](https://github.com/svg/svgo)
