'use strict';
// libraries

// modules

// constants
const fileDataMap = new Map();

// variables

// functions
const existsSync = (file) => {
  return fileDataMap.has(file);
};

const openSync = (file) => {
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
};

exports.existsSync = existsSync;
exports.openSync = openSync;
exports.writeSync = writeSync;
exports.readFileSync = readFileSync;
exports.closeSync = closeSync;
exports.clear = clear;
