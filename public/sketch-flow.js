
const createSketch = (canvasWidth, canvasHeight, canvasScale) => {
    return (p) => {
      p.setup = () => {
        p.createCanvas(200, 200);
        console.log(arg1, arg2, arg3); // You can use the arguments in your sketch
      };
    
      p.draw = () => {
        p.background(0);
      };
    };
  };
  
  export default createSketch;
  