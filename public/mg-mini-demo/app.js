// MG Mini Demo — plain JS, zero dependencies.
// States reuse the original desktop app's frame sets and delays:
//   idle 220ms · run 140ms · wave 170ms · jump 110ms · sleep 260ms
// Artwork: existing MG PNG frames only (no new artwork).
// Improvements over v1: directional running frames, a dedicated looping
// cute pose, drag throttle to avoid accidental taps, and clearer state labels.
(function () {
  "use strict";

  var ASSETS = {
    idle: { frames: ["idle/00", "idle/01", "idle/02", "idle/03", "idle/04", "idle/05"], delay: 220, loop: true },
    "run-left": { frames: ["running-left/00", "running-left/01", "running-left/02", "running-left/03", "running-left/04", "running-left/05", "running-left/06", "running-left/07"], delay: 85, loop: true },
    "run-right": { frames: ["running-right/00", "running-right/01", "running-right/02", "running-right/03", "running-right/04", "running-right/05", "running-right/06", "running-right/07"], delay: 85, loop: true },
    wave: { frames: ["waving/00", "waving/01", "waving/02", "waving/03"], delay: 170, loop: false },
    cute: { frames: ["cute/00"], delay: 700, loop: true },
    jump: { frames: ["jumping/00", "jumping/01", "jumping/02", "jumping/03", "jumping/04"], delay: 110, loop: false },
    sleep: { frames: ["failed/00", "failed/01", "failed/02", "failed/03", "failed/04", "failed/05", "failed/06", "failed/07"], delay: 260, loop: true },
    wake: { frames: ["waiting/00", "waiting/01", "waiting/02", "waiting/03", "waiting/04", "waiting/05"], delay: 170, loop: false },
  };

  var pet = document.getElementById("pet");
  var img = document.getElementById("petImg");
  var stateLabel = document.getElementById("stateLabel");
  var stage = document.getElementById("stage");

  var current = "idle";
  var timer = null;
  var dragging = false;
  var activePointerId = undefined;
  var lastMoveX = 0;
  var movedDuringDrag = false;
  var dragThreshold = 6; // px of movement before we consider it a drag, not a tap

  var preloaded = {};
  Object.keys(ASSETS).forEach(function (name) {
    preloaded[name] = ASSETS[name].frames.map(function (f) {
      var im = new Image();
      im.src = "assets/" + f + ".png";
      return im;
    });
  });

  function setLabel(text) {
    if (!text) { stateLabel.classList.remove("show"); return; }
    stateLabel.textContent = text;
    stateLabel.classList.add("show");
  }

  function play(name, label, opts) {
    if (timer) { clearTimeout(timer); timer = null; }
    current = name;
    pet.classList.toggle("running", name === "run-left" || name === "run-right");
    pet.classList.toggle("cute-mode", name === "cute");
    var spec = ASSETS[name];
    var frames = preloaded[name];
    var i = 0;
    if (label) setLabel(label); else setLabel(null);
    function step() {
      if (frames[i]) img.src = frames[i].src;
      i += 1;
      if (i >= frames.length) {
        if (spec.loop) { i = 0; timer = setTimeout(step, spec.delay); }
        else {
          if (name === "sleep") {
            current = "sleep";
            setLabel("Sleeping — click to wake");
            // keep showing last sleep frame
          } else {
            returnToIdle();
          }
        }
      } else {
        timer = setTimeout(step, spec.delay);
      }
    }
    step();
  }

  function returnToIdle() {
    if (timer) { clearTimeout(timer); timer = null; }
    play("idle", null, {});
  }

  function startRunning(direction) {
    if (!dragging || !direction) return;
    var name = direction === "left" ? "run-left" : "run-right";
    if (current !== name) play(name, null, {});
  }

  // Wake from sleep on click/tap (idle state follows).
  function wake() {
    if (current !== "sleep") return;
    play("wake", "Wake!", {});
  }

  // --- Drag (Pointer Events: mouse + touch) ---
  var offsetX = 0, offsetY = 0;

  pet.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    dragging = true;
    movedDuringDrag = false;
    activePointerId = e.pointerId;
    pet.classList.add("dragging");
    var rect = pet.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    lastMoveX = e.clientX;
    try { pet.setPointerCapture(e.pointerId); } catch (_) {}
    // Wait for an actual horizontal movement before switching to a running pose.
  });

  pet.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    e.preventDefault();
    if (activePointerId !== undefined && e.pointerId !== activePointerId) return;
    var dx = e.clientX - lastMoveX;
    if (Math.abs(e.clientX - offsetX - pet.offsetLeft) > dragThreshold || Math.abs(e.clientY - offsetY - pet.offsetTop) > dragThreshold) {
      movedDuringDrag = true;
      // Real movement: leave sleep and run.
      if (current === "sleep") startRunning(dx < 0 ? "left" : "right");
    }
    lastMoveX = e.clientX;
    var stageRect = stage.getBoundingClientRect();
    var x = e.clientX - stageRect.left - offsetX;
    var y = e.clientY - stageRect.top - offsetY;
    var w = pet.offsetWidth, h = pet.offsetHeight;
    x = Math.max(0, Math.min(stageRect.width - w, x));
    y = Math.max(0, Math.min(stageRect.height - h, y));
    pet.style.left = x + "px";
    pet.style.top = y + "px";
    pet.style.transform = "none";
    // Directional running while dragging
    if (Math.abs(dx) > 2) startRunning(dx < 0 ? "left" : "right");
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    pet.classList.remove("dragging");
    if (e && e.pointerId !== undefined) {
      try { pet.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    if (!movedDuringDrag) {
      // It was a tap, not a drag: wake if sleeping, otherwise stay put.
      if (current === "sleep") { wake(); }
      return;
    }
    returnToIdle();
  }
  pet.addEventListener("pointerup", endDrag);
  pet.addEventListener("pointercancel", endDrag);

  // Click/tap on sleeping pet wakes it (backup for browsers without pointer capture).
  pet.addEventListener("click", function () {
    wake();
  });

  // --- Controls ---
  document.getElementById("btnWave").addEventListener("click", function () { play("wave", "Wave!", {}); });
  document.getElementById("btnCute").addEventListener("click", function () { play("cute", "Cute!", {}); });
  document.getElementById("btnJump").addEventListener("click", function () { play("jump", "Jump!", {}); });
  document.getElementById("btnSleep").addEventListener("click", function () { play("sleep", "Sleeping — click to wake", { loop: true }); });
  document.getElementById("btnReset").addEventListener("click", function () {
    pet.style.left = "";
    pet.style.top = "";
    pet.style.transform = "";
    returnToIdle();
    setLabel(null);
  });

  // Start alive immediately.
  play("idle", null, {});
})();
