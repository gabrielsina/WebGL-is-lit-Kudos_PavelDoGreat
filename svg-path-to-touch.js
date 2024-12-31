function cubicBezier(x1, y1, x2, y2) {
    return function (t) {
        const cx = 3 * x1;
        const bx = 3 * (x2 - x1) - cx;
        const ax = 1 - cx - bx;

        const cy = 3 * y1;
        const by = 3 * (y2 - y1) - cy;
        const ay = 1 - cy - by;

        const tCubed = t * t * t;
        const tSquared = t * t;

        return {
            x: ax * tCubed + bx * tSquared + cx * t,
            y: ay * tCubed + by * tSquared + cy * t
        };
    };
}

function emulateTouch(_duration = 1000, _distance = 100) {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
        throw new Error('No canvas element found in the DOM');
    }

    // Get canvas position and dimensions
    const rect = canvas.getBoundingClientRect();

    // Calculate the center coordinates based on the visible canvas area
    const startX = rect.left + (rect.width / 2);
    const startY = rect.top + (rect.height / 2);
    const endX = startX; // Keep X axis as is
    const endY = startY - _distance;       // Move Y axis by distance

    // Create the bezier curve with the specified parameters
    const bezier = cubicBezier(0.82, 0.31, 0.07, 0.55);

    // Animation parameters
    const duration = _duration; // Duration in milliseconds (1 second)
    const fps = 60;
    const frameDuration = _duration / fps;
    const frames = duration / frameDuration;

    // Function to dispatch mouse event
    function dispatchMouseEvent(type, x, y) {
        const mouseEvent = new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: x,
            clientY: y,
            screenX: x,
            screenY: y,
            button: 0,
            buttons: type === '_syntheticMouseup' ? 0 : 1
        });
        canvas.dispatchEvent(mouseEvent);
    }

    // Start the mouse sequence
    let frameCount = 0;

    // Dispatch initial mousedown at true center
    dispatchMouseEvent('_syntheticMousedown', startX, startY);

    // Return a promise that resolves when the animation is complete
    return new Promise((resolve) => {
        // Animate the mouse movement
        const interval = setInterval(() => {
            frameCount++;

            if (frameCount <= frames) {
                const progress = frameCount / frames;
                const bezierPoint = bezier(progress);

                // Calculate current position
                const currentX = startX + (endX - startX) * bezierPoint.x;
                const currentY = startY + (endY - startY) * bezierPoint.y;

                // Dispatch mousemove
                dispatchMouseEvent('_syntheticMousemove', currentX, currentY);
            } else {
                // End the mouse sequence
                dispatchMouseEvent('_syntheticMouseup', endX, endY);
                clearInterval(interval);
                resolve(); // Resolve the promise when animation is complete
            }
        }, frameDuration);
    });
}