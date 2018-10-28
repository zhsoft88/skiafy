# Skiafy
Node.js based chromium devtools for converting SVG files to Skia Vector Icon files

## Installation

```sh
$ [sudo] npm install -g skiafy
```

## Usage

### <abbr title="Command Line Interface">CLI</abbr>

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

## Reference

[A little SVG to Skia converter tool](https://github.com/evanstade/skiafy)
