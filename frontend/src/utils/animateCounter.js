export function animateCounter(targetValue, duration, callback) {
  const startValue = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = startValue + (targetValue - startValue) * easeOut;
    
    callback(Math.floor(currentValue));
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      callback(targetValue);
    }
  }

  requestAnimationFrame(update);
}
