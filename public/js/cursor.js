/**
 * Custom cursor – runs on every page. No-op on touch devices.
 */
(function () {
    if ('ontouchstart' in window) return;

    function throttle(fn, ms) {
        var last = 0;
        return function () {
            var now = Date.now();
            if (now - last >= ms) {
                last = now;
                fn.apply(this, arguments);
            }
        };
    }

    var cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    var cursorFollower = document.createElement('div');
    cursorFollower.className = 'cursor-follower';
    document.body.appendChild(cursorFollower);

    document.body.classList.add('custom-cursor-active');

    var mouseX = 0, mouseY = 0;
    var followerX = 0, followerY = 0;

    var handleMouseMove = throttle(function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    }, 16);

    function animateFollower() {
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        cursorFollower.style.left = followerX + 'px';
        cursorFollower.style.top = followerY + 'px';
        requestAnimationFrame(animateFollower);
    }
    animateFollower();

    document.addEventListener('mousemove', handleMouseMove);

    var hoverSelectors = 'a, button, [role="button"], .btn, .api-card, .dropdown-content a, .start-button, .Privacy-Policy, .back-btn, .theme-toggle, .menu-toggle';
    var hoverables = document.querySelectorAll(hoverSelectors);
    hoverables.forEach(function (el) {
        el.addEventListener('mouseenter', function () { cursor.classList.add('cursor-hover'); });
        el.addEventListener('mouseleave', function () { cursor.classList.remove('cursor-hover'); });
    });
})();
