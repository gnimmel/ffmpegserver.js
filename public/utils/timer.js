export default class Timer 
{
    constructor(timerElementId) {
        this.startTime = null;
        this.timerElement = document.getElementById(timerElementId);
        this.timerInterval = null;
    }

    start() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => this.update(), 1000);
    }

    stop() {
        clearInterval(this.timerInterval);
    }

    update() {
        let elapsedTime = Date.now() - this.startTime;
  
        let seconds = Math.floor((elapsedTime / 1000) % 60);
        let minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
        let hours = Math.floor((elapsedTime / (1000 * 60 * 60)) % 24);

        this.timerElement.textContent = 
            hours.toString().padStart(2, '0') + ':' + 
            minutes.toString().padStart(2, '0') + ':' + 
            seconds.toString().padStart(2, '0');
    }
}
