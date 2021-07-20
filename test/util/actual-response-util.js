const fs = require('fs');
const path = require('path');

const writeActualResponse = (testName, response) => {
  const file = path.join('data', `${testName}-actual-response.json`);
  const filePtr = fs.openSync(file, 'w');
  fs.writeSync(filePtr, JSON.stringify(response));
  fs.closeSync(filePtr);
};

exports.writeActualResponse = writeActualResponse;
