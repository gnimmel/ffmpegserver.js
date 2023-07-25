class BaseAnimation {
    constructor(p) {
      this.p = p; // the p5 instance
    }
  
    setup() {
      // (overridden by subclasses)
    }
  
    draw() {
      // (overridden by subclasses)
    }
  }

  export default BaseAnimation;