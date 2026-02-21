export function animateCounter(targetValue, duration, callback) {
  const startValue = 0;
  const startTime = performance.now();
  const isDecimal = Number(targetValue) % 1 !== 0;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = startValue + (targetValue - startValue) * easeOut;
    const displayValue = isDecimal ? Number(currentValue.toFixed(2)) : Math.floor(currentValue);
    callback(displayValue);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      callback(Number(targetValue));
    }
  }

  requestAnimationFrame(update);
}
