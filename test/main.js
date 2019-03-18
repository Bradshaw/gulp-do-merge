'use strict';

var fs = require('fs');
var through = require('through2');
var assert = require('assert');
var File = require('vinyl');
var gulp = require('gulp');

var doMerge = require('../index.js');

require('mocha');
require('should');

function streamifyString() {
    var args = arguments || [];

    var stream = through.obj(function (data, enc, next) {
        this.push(data);
        next();
    });

    setTimeout(function(){
        for(var i = 0; i < args.length; i++) {
            stream.push(new File({
                cwd: "",
                path: i.toString(),
                contents: Buffer.from(args[i], 'utf8')
            }));
        }
        stream.end();
    }, 0);

    return stream;
}

var a = 'This little piggy';

var b = 'stayed at home';

var c = 'This little piggy stayed at home';

describe('gulp-do-merge', function() {

    describe('doMerge', function() {

        it('should throw when arguments is missing', function() {
            (function(){
                doMerge();
            }).should.throw('Missing file option for gulp-do-merge');
        });
        it('should throw when merge callback is missing', function() {
            (function(){
                doMerge('./tmp/v.yaml');
            }).should.throw('Missing merge function callback for gulp-do-merge');
        });
        it('should throw when dump callback is missing', function() {
            (function(){
                doMerge('./tmp/v.yaml',()=>{});
            }).should.throw('Missing dump function callback for gulp-do-merge');
        });

        it('should concat multiple files', function(done) {
            var stream = streamifyString(a, b)
              .pipe(doMerge(
                './tmp/v.yaml',
                (memo, data)=>{
                  return (memo.length>0?memo+" ":"")+data;
                },
                (memo)=>{
                  return memo
                },
                ""
              ));

            stream.on('data', function(file) {
                file.contents.toString('utf8').should.equal(c);
                done();
            });
        });

    });

});