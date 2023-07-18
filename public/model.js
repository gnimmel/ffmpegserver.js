// Load the video file names from directory and parse name, color into respective emotion array into dict objects 
//npm install papaparse fs

const fs = require('fs');
const path = require('path');

const Emotions = [
    'inspired',
    'competitive',
    'emotional',
    'nostalgic'
];

let assetArrayByEmotion = {};

for (let item of Emotions)
    assetArrayByEmotion[item] = [];

function init(directoryPath) {
    //const directoryPath = './videos';
    try {
        let files = fs.readdirSync(directoryPath);

        files.forEach((file) => {
            if (path.extname(file) === '.mp4' && fs.statSync(path.join(directoryPath, file)).isFile()) 
            {
                let key = file.split('_')[1].toLowerCase();

                if (key in assetArrayByEmotion) {
                    console.log(file);
                    assetArrayByEmotion[key].push(file);
                }
            }
        });
    } catch (err) {
        console.error('An error occurred while fetching mp4 data', err);
    }
}

//01_Inspired_162B83_Float_Particles.mp4

function getHexFromFilename(filename) {
    return ('#' + filename.split('_')[2]);
}

function getRandomItem(array) {
    const index = Math.floor(Math.random() * array.length);
    const item = array[index];
    //array.splice(index, 1);
    return item;
}

let assetDataById = {};

function setAssetData(id, emotion, lyrics) {
    //console.log(Emotion.INSPIRED);
    console.log("assetArrayByEmotion :: " + assetArrayByEmotion);
    
    let name;
    if (emotion in assetArrayByEmotion)
        name = getRandomItem(assetArrayByEmotion[emotion]);
    else
        console.error('This is not a valid emotion: ' + emotion);
    
    try {
        assetDataById[id] = {
            "filename": name,
            "lyrics": lyrics,
            "textcolor": getHexFromFilename(name)
        };
    } catch (err) {
        console.error('set asset data failed', err);
    }

    console.log(assetDataById);
}

function getAssetData(id) {
    if (id in assetDataById)
        return assetDataById[id];
    else 
        return null
}

module.exports = { init, getAssetData, setAssetData, getHexFromFilename };
