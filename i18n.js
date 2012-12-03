/*
 * # i18n tool
 *
 * ## locale.js: i18n for Node.js and browser
 * 
 * @author Dmitry A. Chleck <dmitrychleck@gmail.com>
 * @version 0.0.1
 */

var fs    = require('fs')
  , path  = require('path');

var scheme = {
  "be": [ "Belarusian",         3, "(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)" ],
  "bg": [ "Bulgarian",          2, "" ],
  "cs": [ "Czech",              3, "(n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2" ],
  "da": [ "Danish",             2, "" ],
  "de": [ "German",             2, "" ],
  "el": [ "Greek",              2, "" ],
  "en": [ "English",            2, "" ],
  "eo": [ "Esperanto",          2, "" ],
  "es": [ "Spanish",            2, "" ],
  "fa": [ "Persian",            1, "0" ],
  "fi": [ "Finnish",            2, "" ],
  "fr": [ "French",             2, "(n>1 ? 1 : 0)" ],
  "he": [ "Hebrew",             2, "" ],
  "hi": [ "Hindi",              2, "" ],
  "hy": [ "Armenian",           2, "" ],
  "hr": [ "Croatian",           3, "(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)" ],
  "hu": [ "Hungarian",          2, "" ],
  "id": [ "Indonesian",         1, "0" ],
  "is": [ "Icelandic",          2, "((n%10!=1 || n%100==11) ? 1 : 0)" ],
  "it": [ "Italian",            2, "" ],
  "ja": [ "Japanese",           1, "0" ],
  "ka": [ "Georgian",           1, "0" ],
  "kk": [ "Kazakh",             1, "0" ],
  "ko": [ "Korean",             1, "0" ],
  "ky": [ "Kyrgyz",             1, "0" ],
  "lt": [ "Lithuanian",         3, "(n%10==1 && n%100!=11 ? 0 : n%10>=2 && (n%100<10 || n%100>=20) ? 1 : 2)" ],
  "lv": [ "Latvian",            3, "(n%10==1 && n%100!=11 ? 0 : n != 0 ? 1 : 2)" ],
  "mn": [ "Mongolian",          2, "" ],
  "ms": [ "Malay",              1, "0" ],
  "nb": [ "Norwegian Bokmal",   2, "" ],
  "ne": [ "Nepali",             2, "" ],
  "nl": [ "Dutch",              2, "" ],
  "nn": [ "Norwegian Nynorsk",  2, "" ],
  "pl": [ "Polish",             3, "(n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)" ],
  "pt": [ "Portuguese",         2, "" ],
  "ro": [ "Romanian",           3, "(n==1 ? 0 : (n==0 || (n%100 > 0 && n%100 < 20)) ? 1 : 2)" ],
  "ru": [ "Russian",            3, "(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)" ],
  "sk": [ "Slovak",             3, "((n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2)" ],
  "sl": [ "Slovenian",          4, "(n%100==1 ? 1 : n%100==2 ? 2 : n%100==3 || n%100==4 ? 3 : 0)" ],
  "so": [ "Somali",             2, "" ],
  "sq": [ "Albanian",           2, "" ],
  "sr": [ "Serbian",            3, "(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)" ],
  "sv": [ "Swedish",            2, "" ],
  "tg": [ "Tajik",              2, "(n>1 ? 1 : 0)" ],
  "th": [ "Thai",               1, "0" ],
  "tk": [ "Turkmen",            2, "" ],
  "tr": [ "Turkish",            2, "(n>1 ? 1 : 0)" ],
  "tt": [ "Tatar",              1, "0" ],
  "uk": [ "Ukrainian",          3, "(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)" ],
  "uz": [ "Uzbek",              2, "(n>1 ? 1 : 0)" ],
  "vi": [ "Vietnamese",         1, "0" ],
  "zh": [ "Chinese",            2, "(n>1 ? 1 : 0)" ]
};

var log = console.log;

// Project config (tr.json)
var cfg;

// ***********************
// Creates tr.json project
// ***********************
function init() {
  log('Init');
  // Take base language
  var base = process.argv[3] || 'en';
  if(!scheme[base]) {
    log('WARNING: Unknown base language (' + base + '), use default.');
    base = 'en';
  }
  log('Base: ' + scheme[base][0]);
  var n = scheme[base][1];
  var rule = scheme[base][2] || '(n == 1 ? 0 : 1)';
  // Take target languages
  var targets = process.argv[4] || '';
  targets = targets.split(',');
  var tmp = {};
  for(var i in targets) {
    var target = scheme[targets[i]];
    if(!target) {
      log('WARNING: Unknown target language (' + targets[i] + '), skipped.');
      continue;
    }
    log('Target: ' + target[0]);
    tmp[targets[i]] = { n: target[1], rule: target[2] || '(n == 1 ? 0 : 1)' };
  }
  targets = tmp;
  // Save project config
  cfg = {
    base: base,
    n: n,
    rule: rule,
    filter: [ ".js" ],
    targets: targets
  };
  try {
    fs.mkdirSync('i18n');
  } catch(e) {
    log('ERROR: Can not create directory (i18n).')
    process.exit(1);
  }
  try {
    fs.writeFileSync(path.join('i18n', 'tr.json'), JSON.stringify(cfg, null, '  '), 'utf8');
  } catch(e) {
    log('ERROR: Can not write file (i18n/tr.json).');
    process.exit(1);
  }
}

// *****************
// Creates .tr files
// *****************
function collect() {
  var tr = {};

  // Load config
  try {
    cfg = JSON.parse(fs.readFileSync(path.join('i18n', 'tr.json'), 'utf8'));
  } catch(e) {
    log('ERROR: Can not load file (i18n/tr.json).');
    process.exit(1);
  }
  // Find __() in project files
  log('\nParsing:');
  grep('.');
  
  // Save translation for each target language
  for(var target in cfg.targets) {
    log('\nCreating ' + target + '.tr');
    var res = [];
    // Take number of plural forms
    var n = cfg.targets[target].n;
    // Load old translation
    try {
      var old = JSON.parse(fs.readFileSync(path.join('i18n', target + '.json'), 'utf8'));
    } catch(e) {
      log('WARNING: Can not read old translation file (i18n/' + target + '.json).');
      var old = {};
    }
    // Add records
    for(var key in tr) {
      // Push 'where'
      var tmp = '';
      var i = 1;
      tr[key].where.forEach(function(w){
        res.push('@ [' + i++ + '] ' + w);
      });
      // Simple or plural
      var k = tr[key].plural ? n : 1;
      res.push((k == 1 ? 'S ' : 'P ') + key.replace(/\n/g, '\n  '));
      // Push comment and phrase for each form
      for(var i in tr[key].base) {
        var o = tr[key].base[i];
        o.comment.forEach(function(c) {
          res.push('# ' + c.replace(/\n/g, '\n# '));
        });
        res.push('? ' + o.phrase.replace(/\n/g, '\n  '));
      }
      // Push translation for each phrase form
      for(var i = 0; i < k; i++) {
        if(tr[key].plural && Array.isArray(old[key])) tmp = old[key][i]; else tmp = old[key];
        tmp = tmp || '';
        res.push('! ' + tmp.replace(/\n/g, '\n  '));
      }
      // Push delimiter
      res.push('');
    }
    // Save translation file
    try {
      fs.writeFileSync(path.join('i18n', target + '.tr'), res.join('\n'), 'utf8');
    } catch(e) {
      log('ERROR: Can not write translation file (i18n/' + target + '.tr).');
      process.exit(1);
    }
  }
  
  // Directory traversal
  function grep(dir) {
    // Get dir content
    try {
      var files = fs.readdirSync(dir);
    } catch(e) {
      log('WARNING: Can not read directory (' + dir + '), skipped.');
      return;
    }
  
    for(var i in files) {
      var file = path.join(dir, files[i]);
      try {
        var s = fs.statSync(file);
      } catch(e) {
        log('WARNING: Can not get file properties (' + file + '), skipped.');
        continue;
      }
      // Dive into subdir
      if(s.isDirectory()) {
        grep(file);
        continue;
      }
      // Apply filter
      if(cfg.filter.indexOf(path.extname(file)) < 0) continue;
      // Parse file
      parse(file);
    }
  }
  
  // Extract params from __()
  function parse(file) {
    log('  ' + file);
  
    // Current position
    var pos = -1;
    var line = 1;
    var col = 0;
    // Read file
    try {
      var f = fs.readFileSync(file, 'utf8');
    } catch(e) {
      log('WARNING: Can not read file (' + file + '), skipped.');
      return;
    }
    
    // Result
    while(next()) {
      // Parse __()
      if(check('__(')) __();
      // Skip strings
      else if(check('"')) str('"');
      else if(check('\'')) str('\'');
      // Skip comments
      else if(check('//')) comment1();
      else if(check('/*')) comment2();
    }
  
    // Parse __()
    function __() {
      var args
        , where
        , plural = false;
      var from = pos + 3;
  
      where = file + ' (' + line + ':' + col + ')';
  
      if(f[from] == '[') plural = true; else plural = false;

      while(next()) {
        // Search ] for plural or , or ) for simple
        if((plural && check(']') || (!plural && (check(',') || check(')'))))) {
          args = f.substring(from, pos);
          if(!plural) args = '[' + args;
          args += ']';
          try {
            var tmp = eval(args);
          } catch(e) {
            log('ERROR: Something wrong with arguments of __() function at ' + where + ', arguments: "' + args.slice(1, -1) + '".');
            process.exit(1);
          }
          // Return if no args
          if(!tmp.length) return;
          // Return if any of args is empty
          for(var i in tmp) if(!tmp[i]) {
            log('ERROR: Empty argument of __() function at ' + where + ', arguments: "' + args.slice(1, -1) + '".');
            process.exit(1);
          }
          // Split every phrase form to key and comment
          var phrase = split(plural, where, tmp);
          return;
          // Take key from phrase
          var key = phrase[0].key;
          // Multiple phrases with the same key
          if(tr[key] !== undefined) {
            // Prepend to 'where'
            where += '\n' + tr[key].where;
          }
          // Save phrase
          tr[key] = { where: where, plural: plural, phrase: phrase };
          return;
        }
        // Skip strings
        else if(check('"')) str('"');
        else if(check('\'')) str('\'');
        // Skip comments
        else if(check('//')) comment1();
        else if(check('/*')) comment2();
      }
    }
  
    // Skip string
    function str(to) {
      while(next()) {
        if(f[pos] == to && f[pos-1] != '\\') return;
      }
    }
  
    // Skip // comment
    function comment1() {
      while(next()) {
        if(f[pos] == '\n') return;
      }
    }
  
    // Skip /* */ comment
    function comment2() {
      while(next()) {
        if(f[pos] == '/' && f[pos-1] == '*') return;
      }
    }
  
    // splitPhrase
    function splitPhrase(phrase) {
      var i = 0;
      var c;
      // Search single '#'
      while(c = phrase[i++]) {
        if(c == '#') {
          if(phrase[i] == '#') i++; else break;
        }
      }
      var j = phrase.indexOf(' ', i);
      if(j < 0) j = phrase.length;
      var s = phrase.slice(0, i-1);
      var id = phrase.slice(i, j);
      var comment = phrase.slice(j+1);
      return { phrase: s, id: id, comment: comment };
    }

    function split(plural, where, args) {
      var key;
      var base = [];
      for(var i in args) {
        var tmp = splitPhrase(args[i]);
        // Create key based on the first arg
        if(!key) {
          key = tmp.phrase;
          if(tmp.id) key += '#' + tmp.id;
        }
        base.push({ comment: tmp.comment, phrase: tmp.phrase });
      }
      // For new key
      if(!tr[key]) {
        tr[key] = { where: [ where ], plural: plural, base: [] };
        for(var i in base) {
          var tmp = { comment: [], phrase: base[i].phrase };
          if(base[i].comment) tmp.comment.push(base[i].comment);
          tr[key].base.push(tmp);
        }
      } else {
        // For existing key
        var tmp = tr[key];
        tmp.where.push(where);
        if(tmp.plural != plural) {
          log('ERROR: Same key but different forms at ' + where + '.');
          process.exit(1);
        }
        for(var i in tmp.base) {
          if(tmp.base[i].phrase != base[i].phrase) {
          log('ERROR: Same key but different phrases at ' + where + '.');
          process.exit(1);
          }
          if(base[i].comment) tmp.base[i].comment.push('[' + tmp.where.length + '] ' + base[i].comment);
        }
      }
    }

    // Goto next position
    function next() {
      pos++;
      col++;
      if(f[pos] === '\n') {
        line++;
        col = 1;
      }
      return f[pos] ? true : false;
    }

    // Check substr at current position
    function check(str) {
      for(var i = 0; i < str.length; i++)
        if(f[pos + i] != str[i]) return false;
      return true;
    }
  
  }
} // End of tr()

function json() {
  // Load config
  try {
    cfg = fs.readFileSync(path.join('i18n', 'tr.json'), 'utf8');
    cfg = JSON.parse(cfg);
  } catch(e) {
    log('ERROR: Can not load file (i18n/tr.json).');
    process.exit(1);
  }
  var i18n = { base: cfg.base, rule: cfg.rule, targets: [] };
  // Build all configured languages
  for(var target in cfg.targets) {
    log(target);
    i18n.targets.push(target);
    build(target);
  }

  // Save translation config
  try {
    fs.writeFileSync(path.join('i18n', 'i18n.json'), JSON.stringify(i18n, null, '  '), 'utf8');
  } catch(e) {
    log('ERROR: Can not write file (i18n/i18n.js).');
    process.exit(1);
  }
  
  // Build translation dictionary for given target
  function build(target) {
    var n       = 0
      , baseN   = 0
      , targetN = 0
      , plural  = null
      , key     = null
      , tr      = [];
    // Result
    var res     = { '': cfg.targets[target].rule };
    
    // Read .tr for given lang
    try {
      var s = fs.readFileSync(path.join('i18n', target + '.tr'), 'utf8');
    } catch(e) {
      log('ERROR: Can not read file (i18n/' + target + '.tr).');
      process.exit(1);
    }
    // Split .tr to lines
    s = s.split('\n');
    // Process each line
    s.forEach(function(line) {
      // Line counter
      n++;
      // Take first char of the current line
      var c = line[0];
      // Trim line prefix
      line = line.substr(2);
      switch(c) {
        // At
        case '@':
        case '#':
          break;
        // Simple form
        case 'S':
          if(plural !== null) err('S-line, but plural already set.');
          plural = false;
          key = line;
          break;
        // Plural form
        case 'P':
          if(plural !== null) err('P-line, but plural already set.');
          plural = true;
          key = line;
          break;
        // Base phrase
        case '?':
          baseN++;
          if(baseN > (plural ? cfg.n : 1)) err('Too much base language lines.');
          //key = key || line;
          break;
        // Target phrase
        case '!':
          targetN++;
          if(targetN > (plural ? cfg.targets[target].n : 1)) err('Too much target language lines.');
          tr.push(line);
          break;
        // Multi line
        case ' ':
          line = '\n' + line;
          if(!baseN) key += line;
          if(tr.length) tr[tr.length-1] += line;
          break;
        // Delimiter
        case undefined:
          res[key] = plural ? tr : tr[0];
          baseN = 0;
          targetN = 0;
          plural = null;
          key = null;
          tr = [];
          break;
        default:
          err('Bad line.');
          process.exit(1);
      }
    });
    
    try {
      fs.writeFileSync(path.join('i18n', target + '.json'), JSON.stringify(res, null, '  '), 'utf8');
    } catch(e) {
      log('ERROR: Can not write file (i18n/' + target + '.json).');
    }

    function err(msg) {
      console.log('ERROR: i18n/' + target + '.tr (' + n + '): ' + msg);
      process.exit(1);
    }
  }
} // End of json()

function help() {
  log(
'\ni18n init|collect|json\n\n',
'init [base] [targets]\n',
'   Create i18n project config, base is base language of your application, targets is comma-separated list of target languages.\n',
'collect\n',
'   Create translation data file for each target language.\n',
'json\n',
'   Create i18n file for each target language.\n'
  );
}

var actions = {
  init: init,
  collect: collect,
  json: json
}

var mode = process.argv[2] || '';

(actions[mode] || help)();
