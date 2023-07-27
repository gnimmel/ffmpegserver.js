//import createSketch from './sketch.js';
import BaseSketch from './BaseSketch.js';

let lyrics = [
    [
    "Don't know where she gets it,",
    "Dem golden vocals be hittin'.",
    "Leavin' legends in her wake,",
    "Every note she take, a heartbreak."
    ],
    [
    "Reminiscing on the early days,",
    "Workin' hard, no time to laze.",
    "Bittersweet, the memories flow,",
    "Humble beginnings, watch her glow."
    ],
    [
    "Superstar from the get-go,",
    "Competition runnin' off slow.",
    "She's got that magic, can't deny,",
    "A legend always reachin' sky-high."
    ],    
    [
    "Superstar from the get-go,",
    "Competition runnin' off slow.",
    "She's got that magic, can't deny,",
    "A legend always reachin' sky-high."
    ]];
let vidPath; //= "videos/10_Competitive_68C5FF_ASCII.mp4";
let textColor; // = "#68C5FF";

const FPS = 60;
//const CANVAS_WIDTH = 1080;
//const CANVAS_HEIGHT = 1920;
//const CANVAS_SCALE = 1.0;

let canvasWidth;// = CANVAS_WIDTH * CANVAS_SCALE;
let canvasHeight;// = CANVAS_HEIGHT * CANVAS_SCALE;
let framerate = FPS;

window.onload = async function() 
{
  let screenWidth = window.screen.width;
  canvasWidth = parseInt(screenWidth / 2);
  canvasHeight = parseInt(canvasWidth * (16 / 9));
  console.log("Resolution: " + canvasWidth + "x" + canvasHeight);

  if (id) {
      console.log(`id is: ${id}`);

      try {
          // Fetch the asset data
          //await fetchAssetData(id);
          if (id == 1){
            vidPath = "videos/10_Competitive_68C5FF_ASCII.mp4";
            textColor = "#68C5FF";
          } else if (id == 2){
            vidPath = "videos/01_Competitive_FFFFFF_Floating_Particles.mp4";
            textColor = "#FFFFFF";
          } else if (id == 3){
            vidPath = "videos/24_Competitive_FFFFFF_Spiral.mp4";
            textColor = "#FFFFFF";
          } else if (id == 4){
            vidPath = "videos/28_Competitive_FFC700_ASCII_Sphere.mp4";
            textColor = "#FFC700";
          }
          
          // Create the sketch
          let mySketch = new BaseSketch(framerate, canvasWidth, canvasHeight, lyrics, textColor, vidPath, 15, true);

          let thep5 = new p5((p) => {
              p.preload = () => mySketch.p5preload(p);
              p.setup = () => mySketch.p5setup(p);
              p.draw = () => mySketch.p5draw(p);
          }, 'the-sketch');
      } catch (error) {
          console.error(`Error fetching asset data for id ${id}:`, error);
      }
  } else {
      console.log("'id' not found");
  }
};

async function fetchAssetData(id) {
  try {
      //let response = await fetch(`http://localhost:4000/assetdata/${id}`);
      let response = await fetch(`http://${serverIp}:4000/assetdata/${id}`);

      if (!response.ok) {
          throw new Error("HTTP error " + response.status);
      }

      let json = await response.json();

      console.log(json);
      
      vidPath = `http://${serverIp}:4000/videos/${json.file}`;

      lyrics = json.lyrics;
      textColor = json.textcolor;
      console.log(`Filepath: ${vidPath}, Lyrics: ${lyrics}, Text color: ${textColor}`);
  } catch (error) {
      console.log("Fetch error:", error);
  }
}
