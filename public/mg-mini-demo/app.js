// MG Mini Demo — plain JS, zero dependencies.
// States reuse the original desktop app's frame sets and delays:
//   idle 220ms · wave 170ms · jump 110ms · sleep 260ms
// Artwork: existing MG PNG frames only (no new artwork).
(function () {
  "use strict";

  var ASSETS = {
    idle: { frames: ["idle/00", "idle/01", "idle/02", "idle/03", "idle/04", "idle/05"], delay: 220, loop: true },
    wave: { frames: ["waving/00", "waving/01", "waving/02", "waving/03"], delay: 170, loop: false },
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
  var wakeQueued = false;

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

  function play(name, label, loop) {
    if (timer) { clearTimeout(timer); timer = null; }
    current = name;
    var spec = ASSETS[name];
    var frames = preloaded[name];
    var i = 0;
    setLabel(label || "");
    function step() {
      if (frames[i]) img.src = frames[i].src;
      i += 1;
      if (i >= frames.length) {
        if (spec.loop) { i = 0; timer = setTimeout(step, spec.delay); }
        else {
          // one-shot finished → back to idle (or stay asleep if sleeping)
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
    play("idle", null, true);
  }

  // Wake from sleep on click/tap (idle state follows).
  function wake() {
    if (current !== "sleep") return;
    play("wake", "Wake!", false);
    // wake animation is one-shot; play() returns to idle at its end.
  }

  // --- Drag (Pointer Events: mouse + touch) ---
  var offsetX = 0, offsetY = 0;

  pet.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    dragging = true;
    activePointerId = e.pointerId;
    pet.classList.add("dragging");
    var rect = pet.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    try { pet.setPointerCapture(e.pointerId); } catch (_) {}
  });

  pet.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    e.preventDefault();
    if (activePointerId !== undefined && e.pointerId !== activePointerId) return;
    var stageRect = stage.getBoundingClientRect();
    var x = e.clientX - stageRect.left - offsetX;
    var y = e.clientY - stageRect.top - offsetY;
    var w = pet.offsetWidth, h = pet.offsetHeight;
    x = Math.max(0, Math.min(stageRect.width - w, x));
    y = Math.max(0, Math.min(stageRect.height - h, y));
    pet.style.left = x + "px";
    pet.style.top = y + "px";
    pet.style.transform = "none";
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    pet.classList.remove("dragging");
    if (e && e.pointerId !== undefined) {
      try { pet.releasePointerCapture(e.pointerId); } catch (_) {}
    }
  }
  pet.addEventListener("pointerup", endDrag);
  pet.addEventListener("pointercancel", endDrag);

  // Click/tap on sleeping pet wakes it (drag suppression built into pointer capture).
  pet.addEventListener("click", function () {
    wake();
  });

  // --- Controls ---
  document.getElementById("btnWave").addEventListener("click", function () { play("wave", "Wave!", false); });
  document.getElementById("btnJump").addEventListener("click", function () { play("jump", "Jump!", false); });
  document.getElementById("btnSleep").addEventListener("click", function () { play("sleep", "Sleeping — click to wake", true); });
  document.getElementById("btnReset").addEventListener("click", function () {
    pet.style.left = "";
    pet.style.top = "";
    pet.style.transform = "";
    returnToIdle();
    setLabel(null);
  });

  // Start alive immediately.
  play("idle", null, true);
})();
