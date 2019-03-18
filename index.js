'use strict';

var through = require('through2');
var path = require('path');
var PluginError = require('plugin-error');
var File = require('vinyl');

module.exports = function (file, mergeFunc, dumpFunc, initial) {
  if (!file) {
    throw new PluginError('gulp-do-merge', 'Missing file option for gulp-do-merge');
  }
  if (typeof file !== 'string' && typeof file.path !== 'string') {
    throw new PluginError('gulp-do-merge', 'Missing path in file options for gulp-do-merge');
  }
  if (!mergeFunc) {
    throw new PluginError('gulp-do-merge', 'Missing merge function callback for gulp-do-merge');
  }
  if (!dumpFunc) {
    throw new PluginError('gulp-do-merge', 'Missing dump function callback for gulp-do-merge');
  }

  var latestFile;
  var outData = initial || {};

  function bufferContents(file, enc, cb) {
    // ignore empty files
    if (file.isNull()) {
      cb();
      return;
    }

    // we don't do streams (yet)
    if (file.isStream()) {
      this.emit('error', new PluginError('gulp-do-merge', 'Streaming not supported'));
      cb();
      return;
    }

    latestFile = file;
    
    var data = file.contents.toString('utf8');
    outData = mergeFunc(outData, data);

    cb();
  }

  function endStream(cb) {
    var outFile;

    if (typeof file === 'string') {
      outFile = latestFile.clone({contents: false});
      outFile.path = path.join(latestFile.base, file);
    } else {
      outFile = new File(file);
    }

    outFile.contents = Buffer.from(dumpFunc(outData));

    this.push(outFile);

    cb();
  }

  return through.obj(bufferContents, endStream);
};