'use strict';

const Processor = function(path, folder, filename, code) {
  this.path = path;
  this.folder = folder;
  this.filename = filename;
  this.code = code;
}

Processor.prototype.update = function(success) {
  const processor = this;
  this.prepare(function() {
    processor.execute(success);
  });
}

Processor.prototype.prepare = function(success) {
  const exec = require('child_process').exec;
  const fs = require('fs');
  const path = require('path');
  const processor = this;

  const work_dir = path.join(this.path, this.folder);
  const cmd = ['mkdir', work_dir, '&&', 'chmod', '777', work_dir];
  exec(cmd.join(' '), function(error) {
    if (error) {
      console.log(error);
    } else {
      fs.writeFile(path.join(processor.path, processor.folder, processor.filename), processor.code, function(error) {
        if (error) {
          console.log(error);
        } else {
          success();
        }
      });
    }
  });
}

Processor.prototype.execute = function(success) {
  const exec = require('child_process').exec;
  const execSync = require('child_process').execSync;
  const fs = require('fs');
  const path = require('path');
  const processor = this;

  const cmd = ['bin/swift-ast-explorer', path.join(processor.path, processor.folder, processor.filename)];
  const swiftVersion = execSync('swift -version').toString();

  exec(cmd.join(' '), function(error) {
    try {
      const syntax = fs.readFileSync(path.join(processor.path, processor.folder, 'main.html'), 'utf8')
      const structure = fs.readFileSync(path.join(processor.path, processor.folder, 'main.json'), 'utf8')
      success({ syntax: syntax, structure: structure, swiftVersion: swiftVersion }, null);
    } catch(e) {
      success({ syntax: null, structure: null, swiftVersion: swiftVersion }, e);
    }
    execSync("rm -r " + path.join(processor.path, processor.folder));
  });
}

module.exports = Processor;
