// Load the video file names from directory and parse name, color into respective emotion array into dict objects 
//npm install papaparse fs

const INSPIRED = 'inspired'
const COMPETITIVE = 'competitive'
const EMOTIONAL = 'emotional'
const NOSTALGIC = 'nostalgic'

/*
const fs = require('fs');
const Papa = require('papaparse');

const file = fs.createReadStream('path_to_your_file.csv');

let data = [];

Papa.parse(file, {
    header: true,
    step: function(results) {
        data.push(results.data);
    },
    complete: function() {
        console.log('Parsing complete:', data);
    }
});
*/

const fs = require('fs');
const path = require('path');

const directoryPath = './'; // specify the directory path

try {
  let files = fs.readdirSync(directoryPath);

  files.forEach((file) => {
    if (path.extname(file) === '.mp4' && fs.statSync(path.join(directoryPath, file)).isFile()) {
      console.log(file);
    }
  });

} catch (err) {
  console.error('An error occurred while fetching mp4 data', err);
}