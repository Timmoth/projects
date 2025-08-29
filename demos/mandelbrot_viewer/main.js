import { dotnet } from './_framework/dotnet.js'

const { setModuleImports, getAssemblyExports, getConfig, runMain } = await dotnet
    .withDiagnosticTracing(false)
    .withApplicationArgumentsFromQuery()
    .create();

const config = getConfig();
const exports = await getAssemblyExports(config.mainAssemblyName);
const interop = exports.realtime_path_tracing_demo.Interop;

var canvas = globalThis.document.getElementById("canvas");
dotnet.instance.Module["canvas"] = canvas;

let devicePixelRatio = window.devicePixelRatio || 1.0;

setModuleImports("main.js", {
    initialize: () => {

        var checkCanvasResize = (dispatch) => {
            devicePixelRatio = window.devicePixelRatio || 1.0;
            var displayWidth = canvas.clientWidth * devicePixelRatio;
            var displayHeight = canvas.clientHeight * devicePixelRatio;

            if (canvas.width != displayWidth || canvas.height != displayHeight) {
                canvas.width = displayWidth;
                canvas.height = displayHeight;
                dispatch = true;
            }

            if (dispatch)
                interop.OnCanvasResize(displayWidth, displayHeight, devicePixelRatio);
        }

        function checkCanvasResizeFrame() {
            checkCanvasResize(false);
            requestAnimationFrame(checkCanvasResizeFrame);
        }
        

        // --- Zoom handling for mouse/trackpad ---
        var mouseWheel = (e) => {
            e.preventDefault();
            let x = e.offsetX * devicePixelRatio;
            let y = (canvas.height - e.offsetY * devicePixelRatio); // flip Y

            // Wheel delta -> exponential zoom factor
            let zoomFactor = Math.pow(0.9, e.deltaY > 0 ? 1 : -1);
            interop.ZoomAtPoint(x, y, zoomFactor);
        }

        var shouldIgnore = (e) => {
            e.preventDefault();
            return e.touches.length > 1 || e.type == "touchend" && e.touches.length > 0;
        }


        // --- Pinch zoom (touch devices) ---
        var lastPinchDistance = null;

        var touchPinch = (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                var bcr = e.target.getBoundingClientRect();

                var dx = e.touches[0].clientX - e.touches[1].clientX;
                var dy = e.touches[0].clientY - e.touches[1].clientY;
                var dist = Math.sqrt(dx * dx + dy * dy);

                var centerX = ((e.touches[0].clientX + e.touches[1].clientX) / 2 - bcr.x) * devicePixelRatio;
                var centerY = (canvas.height - (((e.touches[0].clientY + e.touches[1].clientY) / 2 - bcr.y) * devicePixelRatio));

                if (lastPinchDistance) {
                    let zoomFactor = dist / lastPinchDistance; // ratio >1 = zoom in, <1 = zoom out
                    interop.ZoomAtPoint(centerX, centerY, zoomFactor);
                }
                lastPinchDistance = dist;
            }
        }

        var resetPinch = () => {
            lastPinchDistance = null;
        }

        let isDragging = false;
        let lastX = 0, lastY = 0;

        var mouseDown = (e) => {
            e.stopPropagation();
            isDragging = true;
            lastX = e.offsetX * devicePixelRatio;
            lastY = (canvas.height - e.offsetY * devicePixelRatio);
            interop.OnMouseDown(e.shiftKey, e.ctrlKey, e.altKey, e.button);
        }

        var mouseMove = (e) => {
            let x = e.offsetX * devicePixelRatio;
            let y = (canvas.height - e.offsetY * devicePixelRatio);

            if (isDragging) {
                let dx = x - lastX;
                let dy = y - lastY;
                interop.OnDrag(dx, dy);   // NEW call
            }

            lastX = x;
            lastY = y;

            interop.OnMouseMove(x, y);
        }

        var mouseUp = (e) => {
            e.stopPropagation();
            isDragging = false;
            interop.OnMouseUp(e.shiftKey, e.ctrlKey, e.altKey, e.button);
        }

// --- Touch drag ---
        var touchStart = (e) => {
            if (shouldIgnore(e)) return;

            var touch = e.changedTouches[0];
            var bcr = e.target.getBoundingClientRect();
            var x = (touch.clientX - bcr.x) * devicePixelRatio;
            var y = (canvas.height - (touch.clientY - bcr.y) * devicePixelRatio);

            lastX = x;
            lastY = y;
            isDragging = true;

            interop.OnMouseMove(x, y);
            interop.OnMouseDown(e.shiftKey, e.ctrlKey, e.altKey, 0);
        }

        var touchMove = (e) => {
            if (shouldIgnore(e)) return;

            var touch = e.changedTouches[0];
            var bcr = e.target.getBoundingClientRect();
            var x = (touch.clientX - bcr.x) * devicePixelRatio;
            var y = (canvas.height - (touch.clientY - bcr.y) * devicePixelRatio);

            if (isDragging && e.touches.length === 1) {
                let dx = x - lastX;
                let dy = y - lastY;
                interop.OnDrag(dx, dy);   // NEW call
            }

            lastX = x;
            lastY = y;
            interop.OnMouseMove(x, y);
        }

        var touchEnd = (e) => {
            if (shouldIgnore(e)) return;
            isDragging = false;

            var touch = e.changedTouches[0];
            var bcr = e.target.getBoundingClientRect();
            var x = (touch.clientX - bcr.x) * devicePixelRatio;
            var y = (canvas.height - (touch.clientY - bcr.y) * devicePixelRatio);

            interop.OnMouseMove(x, y);
            interop.OnMouseUp(e.shiftKey, e.ctrlKey, e.altKey, 0);
        }


        // Attach listeners
        canvas.addEventListener("mousemove", mouseMove, false);
        canvas.addEventListener("mousedown", mouseDown, false);
        canvas.addEventListener("mouseup", mouseUp, false);
        canvas.addEventListener("wheel", mouseWheel, { passive: false });
        canvas.addEventListener("touchstart", touchStart, false);
        canvas.addEventListener("touchmove", touchMove, false);
        canvas.addEventListener("touchend", touchEnd, false);
        canvas.addEventListener("touchmove", touchPinch, { passive: false });
        canvas.addEventListener("touchend", resetPinch, false);
        canvas.addEventListener("touchcancel", resetPinch, false);

        checkCanvasResize(true);
        checkCanvasResizeFrame();

        canvas.tabIndex = 1000;

        interop.SetRootUri(window.location.toString());

        var langs = navigator.languages || [];
        for (var i = 0; i < langs.length; i++)
            interop.AddLocale(langs[i]);
        interop.AddLocale(navigator.language);
        interop.AddLocale(navigator.userLanguage);
    }
});

await runMain();
