# Tools for locale-js

See [locale-js project](https://github.com/chleck/locale-js "i18n for Javascript").

## Installation
---

```shell
$ npm install locale-tools
```

## Usage
---

```shell
$ i18n --help

  Usage: i18n [options] [command]

  Commands:

    init                   Run initialization wizard
    collect                Collect translation data and write .tr file(s).
    dict                   Build dictionary files.
    *

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -f, --force    force initialization, use with "init" command

```

## Project lifecycle
---

### Creating new project

```shell
$ cd <project_home>
$ i18n init
```

This command sequence will create i18n directory in the \<project_home> and put project config into it.

Result:
- *tr.json* - project config.

### Collecting translation data

```shell
$ i18n collect
```

This command will create translation file for each target language.

Result:
- *\<target>.tr* - translation file for \<target> language.

### Building translation dictionary

Edit .tr files with your favorite text editor and run the following command:

```shell
$ i18n dict
```

This will create dictionary file for each target language and dictionary's config file.

Result:
- *i18n.json* - dictionary's config.
- *\<target>.json* - translation dictionary for \<target> language.
