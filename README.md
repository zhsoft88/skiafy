# Skiafy
Node.js tool for skiafy SVG files

It mainly used in chromium development.

At first, use svgo to optimize svg file. 
Then use skiafy to convert svg file to icon file. 
Finally, reference this icon in chromium.

## Installation

```sh
$ [sudo] npm install -g skiafy
```

## Usage

### <abbr title="Command Line Interface">CLI</abbr>

```
Usage:
  skiafy svg_file
```

## Reference

[A little SVG to Skia converter tool](https://github.com/evanstade/skiafy)
