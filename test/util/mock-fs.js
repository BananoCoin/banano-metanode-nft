'use strict';
// libraries
const path = require('path');

// modules

// constants
const fileDataMap = new Map();
const dirDataMap = new Map();

// variables

// functions
const existsSync = (file) => {
  const retval = fileDataMap.has(file) || dirDataMap.has(file);
  // console.log('existsSync', file, retval);
  return retval;
};

const openSync = (file) => {
  const dir = path.dirname(file);
  dirDataMap.get(dir).add(path.basename(file));
  return file;
};

const writeSync = (filePtr, data) => {
  fileDataMap.set(filePtr, data);
};

const readFileSync = (file) => {
  return fileDataMap.get(file);
};

const closeSync = (file) => {
  // do nothing, as writeSync did the work.
};

const clear = () => {
  fileDataMap.clear();
  dirDataMap.clear();
};

const mkdirSync = (file) => {
  dirDataMap.set(file, new Set());
};

const readdirSync = (file) => {
  const dirSync = dirDataMap.get(file);
  return [...dirSync];
};

const unlinkSync = (file) => {
  const dir = path.dirname(file);
  dirDataMap.get(dir).delete(path.basename(file));
};

exports.fileDataMap = fileDataMap;
exports.dirDataMap = dirDataMap;
exports.existsSync = existsSync;
exports.openSync = openSync;
exports.writeSync = writeSync;
exports.readFileSync = readFileSync;
exports.closeSync = closeSync;
exports.clear = clear;
exports.mkdirSync = mkdirSync;
exports.readdirSync = readdirSync;
exports.unlinkSync = unlinkSync;
