const root = document.documentElement;
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeLabel = document.querySelector("[data-theme-label]");
const themeColor = document.querySelector('meta[name="theme-color"]');

const applyTheme = (theme) => {
  const isDark = theme === "dark";
  root.dataset.theme = theme;
  themeToggle?.setAttribute("aria-pressed", String(isDark));
  themeToggle?.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
  if (themeLabel) themeLabel.textContent = isDark ? "Light" : "Dark";
  themeColor?.setAttribute("content", isDark ? "#101614" : "#f7f6f2");
};

const savedTheme = localStorage.getItem("theme");
const preferredTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
applyTheme(preferredTheme);

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem("theme", nextTheme);
});

document.querySelectorAll("[data-visualization-expand]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (!window.matchMedia("(max-width: 780px)").matches) return;
    event.preventDefault();
    window.location.assign(link.href);
  });
});

const navLinks = [...document.querySelectorAll(".site-nav a")].filter((link) => {
  const destination = new URL(link.href, window.location.href);
  const samePage =
    destination.pathname === window.location.pathname ||
    (window.location.pathname.endsWith("/") && destination.pathname.endsWith("/index.html"));
  return samePage && destination.hash;
});
const sections = document.querySelectorAll("main section[id]");

const setActiveNav = (sectionId) => {
  navLinks.forEach((link) => link.classList.toggle("active", link.hash === `#${sectionId}`));
};

let initialSection = sections[0];
try {
  const sectionId = decodeURIComponent(window.location.hash.slice(1));
  initialSection = (sectionId && document.getElementById(sectionId)) || sections[0];
} catch {
  // Malformed URL fragments should fall back without interrupting page setup.
}
if (initialSection) setActiveNav(initialSection.id);

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        setActiveNav(entry.target.id);
      });
    },
    { rootMargin: "-30% 0px -60%", threshold: 0 },
  );
  sections.forEach((section) => observer.observe(section));
}

const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear();

const ensnarlmentExperience = document.querySelector("[data-ensnarlment-experience]");

if (ensnarlmentExperience) {
  const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animationSettings = {
    growthSpeed: prefersReducedMotion ? 190 : 82,
    pointSpacing: 4.5,
    firstBranchDistance: 48,
    branchDistanceMin: 54,
    branchDistanceMax: 92,
    branchAngleMin: 0.22,
    branchAngleMax: 0.48,
    maxActiveTips: 28,
    minimumActiveTips: 10,
    maxBranches: 240,
    maxPointsPerSegment: 110,
    fusionSeekDistance: 72,
    fusionContactDistance: 5,
    fusionDistanceMin: 210,
    fusionDistanceMax: 340,
    minimumCompletedCycles: 8,
    minimumBranchesBeforeLink: 54,
    attentionDistance: 540,
    meetingDistance: 20,
    linkedContactSeparation: 52,
    minimumEntanglementContacts: 6,
    entanglementMinimumDuration: prefersReducedMotion ? 500 : 4200,
    entanglementMaximumDuration: prefersReducedMotion ? 900 : 7200,
    settleDuration: prefersReducedMotion ? 180 : 1900,
    speechRevealDelay: prefersReducedMotion ? 80 : 850,
  };

  const main = document.querySelector(".home-main");
  const canvas = ensnarlmentExperience.querySelector("[data-network-canvas]");
  const speech = ensnarlmentExperience.querySelector("[data-ensnarlment-speech]");
  const dismissSpeech = ensnarlmentExperience.querySelector("[data-speech-dismiss]");
  const triggers = {
    green: ensnarlmentExperience.querySelector('[data-network-trigger="green"]'),
    magenta: ensnarlmentExperience.querySelector('[data-network-trigger="magenta"]'),
  };
  const groups = {
    green: ensnarlmentExperience.querySelector('[data-network-group="green"]'),
    magenta: ensnarlmentExperience.querySelector('[data-network-group="magenta"]'),
  };

  const createState = (color, seed) => ({
    color,
    seed,
    active: false,
    tips: [],
    nodes: [],
    completedCycles: 0,
    branchCount: 0,
    totalDistance: 0,
    nextFusionAt: 520,
    nextBudAt: 720,
    attentionTriggered: false,
    entanglementGuide: null,
  });

  const networkState = {
    green: createState("green", 0x4f1bbcdc),
    magenta: createState("magenta", 0xa4829d37),
  };
  let nextBranchId = 1;
  let animationFrame = 0;
  let previousFrame = 0;
  let resizeFrame = 0;
  let linkDetectedAt = 0;
  let lastMeetingCheck = 0;
  let entanglementContactCount = 0;
  let speechShown = false;
  let interactionComplete = false;
  let fadeTimer = 0;
  let speechTimer = 0;
  let celebrationTimer = 0;

  const random = (state) => {
    state.seed = (Math.imul(state.seed, 1664525) + 1013904223) >>> 0;
    return state.seed / 4294967296;
  };
  const randomBetween = (state, minimum, maximum) => minimum + random(state) * (maximum - minimum);
  const createSvgElement = (name, attributes = {}) => {
    const element = document.createElementNS(SVG_NAMESPACE, name);
    Object.entries(attributes).forEach(([attribute, value]) => element.setAttribute(attribute, String(value)));
    return element;
  };

  const characterOrigin = (trigger) => {
    const mainRect = main.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    return [triggerRect.left - mainRect.left + triggerRect.width / 2, triggerRect.top - mainRect.top + triggerRect.height / 2];
  };

  const angleDifference = (from, to) => Math.atan2(Math.sin(to - from), Math.cos(to - from));
  const steerAngle = (angle, target, amount) => angle + angleDifference(angle, target) * amount;

  const createTip = (state, x, y, angle, generation = 0, isFirst = false, options = {}) => {
    if (state.branchCount >= animationSettings.maxBranches) return null;
    const branchId = nextBranchId;
    nextBranchId += 1;
    const strokeWidth = Math.max(0.66, 1.52 - generation * 0.11);
    const path = createSvgElement("path", {
      class: "network-edge network-root",
      d: `M ${x.toFixed(2)} ${y.toFixed(2)}`,
    });
    path.style.strokeWidth = String(strokeWidth);
    groups[state.color].append(path);
    const tip = {
      branchId,
      path,
      committedPathData: `M ${x.toFixed(2)} ${y.toFixed(2)}`,
      segmentPointCount: 0,
      strokeWidth,
      samples: [{ x, y, angle }],
      x,
      y,
      angle,
      generation,
      parentBranchId: options.parentBranchId ?? null,
      noisePhase: randomBetween(state, 0, Math.PI * 2),
      noiseRate: randomBetween(state, 0.72, 1.28),
      turnBias: randomBetween(state, -0.0008, 0.0008),
      nextBranchDirection: random(state) < 0.5 ? -1 : 1,
      travelled: 0,
      pointRemainder: 0,
      canBranch: options.canBranch ?? true,
      remainingDistance: options.remainingDistance ?? Number.POSITIVE_INFINITY,
      fusionTarget: null,
      distanceToBranch: isFirst
        ? animationSettings.firstBranchDistance
        : randomBetween(state, animationSettings.branchDistanceMin, animationSettings.branchDistanceMax),
    };
    state.branchCount += 1;
    state.nodes.push({ x, y, angle, branchId, generation, parentBranchId: tip.parentBranchId });
    state.tips.push(tip);
    return tip;
  };

  const finishTip = (state, tip) => {
    const tipIndex = state.tips.indexOf(tip);
    if (tipIndex >= 0) state.tips.splice(tipIndex, 1);
  };

  const branchFromTip = (state, tip) => {
    if (!tip.canBranch || state.branchCount >= animationSettings.maxBranches) return;
    if (state.tips.length >= animationSettings.maxActiveTips) return;
    const branchOriginIndex = Math.max(0, tip.samples.length - 2 - Math.floor(randomBetween(state, 2, 7)));
    const branchOrigin = tip.samples[branchOriginIndex] || { x: tip.x, y: tip.y, angle: tip.angle };
    const direction = tip.nextBranchDirection;
    tip.nextBranchDirection *= -1;
    const branchAngle = branchOrigin.angle + direction * randomBetween(
      state,
      animationSettings.branchAngleMin,
      animationSettings.branchAngleMax,
    );
    tip.angle -= direction * randomBetween(state, 0.025, 0.07);
    createTip(state, branchOrigin.x, branchOrigin.y, branchAngle, tip.generation + 1, false, {
      parentBranchId: tip.branchId,
      canBranch: tip.generation < 8,
    });
  };

  const assignFusionTarget = (state) => {
    if (state.totalDistance < state.nextFusionAt || state.nodes.length < 80) return;
    const nodes = state.nodes.slice(-1900);
    let selectedTip = null;
    let selectedTarget = null;
    let bestScore = Number.POSITIVE_INFINITY;

    state.tips.forEach((tip) => {
      if (tip.fusionTarget || tip.travelled < 72) return;
      for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += 3) {
        const node = nodes[nodeIndex];
        if (node.branchId === tip.branchId) continue;
        const deltaX = node.x - tip.x;
        const deltaY = node.y - tip.y;
        const targetDistance = Math.hypot(deltaX, deltaY);
        if (targetDistance < 16 || targetDistance > animationSettings.fusionSeekDistance) continue;
        const targetAngle = Math.atan2(deltaY, deltaX);
        const turn = Math.abs(angleDifference(tip.angle, targetAngle));
        if (turn > 0.92) continue;
        const score = targetDistance + turn * 24;
        if (score < bestScore) {
          bestScore = score;
          selectedTip = tip;
          selectedTarget = node;
        }
      }
    });

    if (selectedTip && selectedTarget) {
      selectedTip.fusionTarget = selectedTarget;
      selectedTip.turnBias = 0;
      state.nextFusionAt += randomBetween(
        state,
        animationSettings.fusionDistanceMin,
        animationSettings.fusionDistanceMax,
      );
    } else {
      state.nextFusionAt += 52;
    }
  };

  const repelFromSiblingTips = (state, tip, timeScale) => {
    let repelX = 0;
    let repelY = 0;
    state.tips.forEach((otherTip) => {
      if (otherTip === tip) return;
      const deltaX = tip.x - otherTip.x;
      const deltaY = tip.y - otherTip.y;
      const squaredDistance = deltaX * deltaX + deltaY * deltaY;
      if (squaredDistance <= 1 || squaredDistance > 58 * 58) return;
      const weight = 1 - Math.sqrt(squaredDistance) / 58;
      repelX += (deltaX / squaredDistance) * weight;
      repelY += (deltaY / squaredDistance) * weight;
    });
    if (repelX || repelY) {
      tip.angle = steerAngle(tip.angle, Math.atan2(repelY, repelX), 0.012 * timeScale);
    }
  };

  const advanceTip = (state, tip, distance, deltaTime) => {
    const width = main.clientWidth;
    const height = main.clientHeight;
    const margin = 0;
    const timeScale = deltaTime / 16.667;
    if (tip.fusionTarget) {
      tip.turnBias = 0;
      const fusionAngle = Math.atan2(tip.fusionTarget.y - tip.y, tip.fusionTarget.x - tip.x);
      tip.angle = steerAngle(tip.angle, fusionAngle, Math.min(0.72, 0.24 * timeScale));
    } else {
      tip.noisePhase += deltaTime * 0.001 * tip.noiseRate;
      const correlatedTurn = (
        Math.sin(tip.noisePhase) +
        Math.sin(tip.noisePhase * 0.43 + tip.branchId) * 0.42
      ) * 0.00011;
      tip.turnBias = Math.max(
        -0.0026,
        Math.min(0.0026, tip.turnBias * 0.94 + correlatedTurn),
      );
      tip.angle += tip.turnBias * timeScale;
      const defaultGuideX = state.color === "green" ? width * 0.78 : width * 0.22;
      const defaultGuideY = state.color === "green" ? height * 0.76 : height * 0.24;
      const guideSpread = linkDetectedAt ? Math.min(width, height) * 0.1 : 0;
      const guideOffsetAngle = tip.branchId * 2.399963;
      const guideX = (state.entanglementGuide?.x ?? defaultGuideX) + Math.cos(guideOffsetAngle) * guideSpread;
      const guideY = (state.entanglementGuide?.y ?? defaultGuideY) + Math.sin(guideOffsetAngle) * guideSpread;
      const guideAngle = Math.atan2(guideY - tip.y, guideX - tip.x);
      tip.angle = steerAngle(tip.angle, guideAngle, (linkDetectedAt ? 0.0048 : 0.0022) * timeScale);
      repelFromSiblingTips(state, tip, timeScale);
    }

    let travelDistance = distance;
    let fused = false;
    if (tip.fusionTarget) {
      const targetDistance = Math.hypot(tip.fusionTarget.x - tip.x, tip.fusionTarget.y - tip.y);
      if (targetDistance <= distance + animationSettings.fusionContactDistance) {
        tip.angle = Math.atan2(tip.fusionTarget.y - tip.y, tip.fusionTarget.x - tip.x);
        travelDistance = targetDistance;
        fused = true;
      }
    }

    const stepX = Math.cos(tip.angle) * travelDistance;
    const stepY = Math.sin(tip.angle) * travelDistance;
    let boundaryScale = 1;
    if (stepX < 0) boundaryScale = Math.min(boundaryScale, (margin - tip.x) / stepX);
    if (stepX > 0) boundaryScale = Math.min(boundaryScale, (width - margin - tip.x) / stepX);
    if (stepY < 0) boundaryScale = Math.min(boundaryScale, (margin - tip.y) / stepY);
    if (stepY > 0) boundaryScale = Math.min(boundaryScale, (height - margin - tip.y) / stepY);
    const hitBoundary = boundaryScale >= 0 && boundaryScale < 1;
    const nextX = tip.x + stepX * Math.max(0, boundaryScale);
    const nextY = tip.y + stepY * Math.max(0, boundaryScale);
    const actualDistance = travelDistance * Math.max(0, boundaryScale);

    tip.x = nextX;
    tip.y = nextY;
    tip.pointRemainder += actualDistance;
    tip.distanceToBranch -= actualDistance;
    tip.remainingDistance -= actualDistance;
    tip.travelled += actualDistance;
    state.totalDistance += actualDistance;

    tip.path.setAttribute(
      "d",
      `${tip.committedPathData} L ${tip.x.toFixed(2)} ${tip.y.toFixed(2)}`,
    );

    if (tip.pointRemainder >= animationSettings.pointSpacing) {
      tip.committedPathData += ` L ${tip.x.toFixed(2)} ${tip.y.toFixed(2)}`;
      tip.segmentPointCount += 1;
      tip.pointRemainder %= animationSettings.pointSpacing;
      tip.samples.push({ x: tip.x, y: tip.y, angle: tip.angle });
      if (tip.samples.length > 42) tip.samples.shift();
      state.nodes.push({
        x: tip.x,
        y: tip.y,
        angle: tip.angle,
        branchId: tip.branchId,
        generation: tip.generation,
        parentBranchId: tip.parentBranchId,
      });
      if (state.nodes.length > 3000) state.nodes.splice(0, 320);

      if (tip.segmentPointCount >= animationSettings.maxPointsPerSegment) {
        const continuation = createSvgElement("path", {
          class: "network-edge network-root",
          d: `M ${tip.x.toFixed(2)} ${tip.y.toFixed(2)}`,
        });
        continuation.style.strokeWidth = String(tip.strokeWidth);
        groups[state.color].append(continuation);
        tip.path = continuation;
        tip.committedPathData = `M ${tip.x.toFixed(2)} ${tip.y.toFixed(2)}`;
        tip.segmentPointCount = 0;
      }
    }

    if (!tip.fusionTarget && tip.distanceToBranch <= 0) {
      branchFromTip(state, tip);
      tip.distanceToBranch = randomBetween(state, animationSettings.branchDistanceMin, animationSettings.branchDistanceMax);
    }

    if (fused) {
      state.completedCycles += 1;
      finishTip(state, tip);
    } else if (hitBoundary || tip.remainingDistance <= 0) {
      finishTip(state, tip);
    }
  };

  const callOtherCharacter = (activeColor) => {
    const state = networkState[activeColor];
    const otherColor = activeColor === "green" ? "magenta" : "green";
    if (state.attentionTriggered || networkState[otherColor].active) return;
    state.attentionTriggered = true;
    triggers[otherColor].classList.remove("is-calling");
    void triggers[otherColor].offsetWidth;
    triggers[otherColor].classList.add("is-calling");
  };

  const budFromExistingBranch = (state) => {
    if (state.branchCount >= animationSettings.maxBranches || state.nodes.length < 36) return false;
    const margin = 46;
    const candidates = state.nodes
      .slice(-1500)
      .filter((node) => (
        node.x > margin &&
        node.x < main.clientWidth - margin &&
        node.y > margin &&
        node.y < main.clientHeight - margin &&
        (node.generation ?? 0) < 8
      ));
    if (!candidates.length) return false;

    const origin = candidates[Math.floor(random(state) * candidates.length)];
    const direction = random(state) < 0.5 ? -1 : 1;
    const angle = origin.angle + direction * randomBetween(
      state,
      animationSettings.branchAngleMin,
      animationSettings.branchAngleMax,
    );
    const tip = createTip(state, origin.x, origin.y, angle, (origin.generation ?? 0) + 1, false, {
      parentBranchId: origin.branchId,
      canBranch: (origin.generation ?? 0) < 8,
    });
    return Boolean(tip);
  };

  const advanceNetwork = (state, deltaTime) => {
    const distance = animationSettings.growthSpeed * (deltaTime / 1000);
    if (linkDetectedAt) {
      const otherState = networkState[state.color === "green" ? "magenta" : "green"];
      const frontier = otherState.nodes.slice(-360);
      if (frontier.length) {
        let guideX = 0;
        let guideY = 0;
        let guideSamples = 0;
        for (let nodeIndex = 0; nodeIndex < frontier.length; nodeIndex += 8) {
          guideX += frontier[nodeIndex].x;
          guideY += frontier[nodeIndex].y;
          guideSamples += 1;
        }
        state.entanglementGuide = {
          x: guideX / guideSamples,
          y: guideY / guideSamples,
        };
      }
    }
    assignFusionTarget(state);
    [...state.tips].forEach((tip) => advanceTip(state, tip, distance, deltaTime));
    if (
      state.totalDistance >= state.nextBudAt &&
      state.tips.length < animationSettings.minimumActiveTips
    ) {
      if (budFromExistingBranch(state)) {
        state.nextBudAt += randomBetween(state, 90, 150);
      } else {
        state.nextBudAt += 42;
      }
    }
    if (state.totalDistance >= animationSettings.attentionDistance) callOtherCharacter(state.color);
  };

  const showSpeech = () => {
    if (speechShown) return;
    speechShown = true;
    triggers.magenta.classList.add("is-celebrating");
    celebrationTimer = window.setTimeout(
      () => triggers.magenta.classList.remove("is-celebrating"),
      prefersReducedMotion ? 20 : 820,
    );
    speech.hidden = false;
  };

  const countNetworkContacts = (contactLimit = 2) => {
    const greenNodes = networkState.green.nodes;
    const magentaNodes = networkState.magenta.nodes;
    if (
      greenNodes.length < 24 ||
      magentaNodes.length < 24 ||
      networkState.green.branchCount < animationSettings.minimumBranchesBeforeLink ||
      networkState.magenta.branchCount < animationSettings.minimumBranchesBeforeLink ||
      networkState.green.completedCycles < animationSettings.minimumCompletedCycles ||
      networkState.magenta.completedCycles < animationSettings.minimumCompletedCycles
    ) {
      return 0;
    }
    const thresholdSquared = animationSettings.meetingDistance ** 2;
    const separationSquared = animationSettings.linkedContactSeparation ** 2;
    const greenFront = greenNodes.slice(-520);
    const magentaFront = magentaNodes.slice(-520);
    const contacts = [];

    for (let greenIndex = 0; greenIndex < greenFront.length; greenIndex += 2) {
      const greenNode = greenFront[greenIndex];
      for (let magentaIndex = 0; magentaIndex < magentaFront.length; magentaIndex += 2) {
        const magentaNode = magentaFront[magentaIndex];
        const deltaX = greenNode.x - magentaNode.x;
        const deltaY = greenNode.y - magentaNode.y;
        if (deltaX * deltaX + deltaY * deltaY > thresholdSquared) continue;
        const contact = {
          x: (greenNode.x + magentaNode.x) / 2,
          y: (greenNode.y + magentaNode.y) / 2,
        };
        const isDistinct = contacts.every((existingContact) => {
          const contactDeltaX = existingContact.x - contact.x;
          const contactDeltaY = existingContact.y - contact.y;
          return contactDeltaX * contactDeltaX + contactDeltaY * contactDeltaY >= separationSquared;
        });
        if (!isDistinct) continue;
        contacts.push(contact);
        if (contacts.length >= contactLimit) return contacts.length;
      }
    }
    return contacts.length;
  };

  const beginEntanglement = (now, initialContacts) => {
    linkDetectedAt = now;
    entanglementContactCount = initialContacts;
    Object.values(networkState).forEach((state) => {
      state.nextFusionAt = Math.min(state.nextFusionAt, state.totalDistance + 75);
      state.nextBudAt = Math.min(state.nextBudAt, state.totalDistance + 55);
    });
  };

  const completeInteraction = () => {
    if (interactionComplete) return;
    interactionComplete = true;
    Object.entries(networkState).forEach(([color, state]) => {
      state.active = false;
      triggers[color].classList.remove("is-active", "is-calling");
    });
    Object.values(groups).forEach((group) => group.classList.add("is-settling"));
    fadeTimer = window.setTimeout(() => {
      Object.values(groups).forEach((group) => {
        group.classList.remove("is-settling");
        group.classList.add("is-fading");
      });
    }, animationSettings.settleDuration);
    speechTimer = window.setTimeout(
      showSpeech,
      animationSettings.settleDuration + animationSettings.speechRevealDelay,
    );
  };

  const resetInteraction = () => {
    window.cancelAnimationFrame(animationFrame);
    window.clearTimeout(fadeTimer);
    window.clearTimeout(speechTimer);
    window.clearTimeout(celebrationTimer);
    animationFrame = 0;
    previousFrame = 0;
    linkDetectedAt = 0;
    lastMeetingCheck = 0;
    entanglementContactCount = 0;
    speechShown = false;
    interactionComplete = false;
    nextBranchId = 1;
    networkState.green = createState("green", 0x4f1bbcdc);
    networkState.magenta = createState("magenta", 0xa4829d37);
    Object.entries(groups).forEach(([color, group]) => {
      group.replaceChildren();
      group.classList.remove("is-settling", "is-fading");
      triggers[color].classList.remove("is-active", "is-calling", "is-celebrating");
      triggers[color].setAttribute("aria-pressed", "false");
    });
    speech.hidden = true;
  };

  const updateAnimation = (now) => {
    animationFrame = 0;
    const deltaTime = Math.min(40, previousFrame ? now - previousFrame : 16.667);
    previousFrame = now;
    if (interactionComplete) return;
    const activeStates = Object.values(networkState).filter((state) => state.active);
    activeStates.forEach((state) => advanceNetwork(state, deltaTime));

    if (activeStates.length === 2 && now - lastMeetingCheck >= 180) {
      lastMeetingCheck = now;
      const contactLimit = linkDetectedAt ? animationSettings.minimumEntanglementContacts : 2;
      const contactCount = countNetworkContacts(contactLimit);
      if (!linkDetectedAt && contactCount >= 2) {
        beginEntanglement(now, contactCount);
      } else if (linkDetectedAt) {
        entanglementContactCount = Math.max(entanglementContactCount, contactCount);
      }
    }
    if (linkDetectedAt) {
      const entanglementDuration = now - linkDetectedAt;
      const hasEnoughInterleavings = (
        entanglementDuration >= animationSettings.entanglementMinimumDuration &&
        entanglementContactCount >= animationSettings.minimumEntanglementContacts
      );
      if (hasEnoughInterleavings || entanglementDuration >= animationSettings.entanglementMaximumDuration) {
        completeInteraction();
        return;
      }
    }

    if (activeStates.length) animationFrame = window.requestAnimationFrame(updateAnimation);
  };

  const requestAnimation = () => {
    if (!animationFrame) animationFrame = window.requestAnimationFrame(updateAnimation);
  };

  const activateNetwork = (color) => {
    if (interactionComplete) resetInteraction();
    const state = networkState[color];
    if (state.active) return;
    const [characterX, characterY] = characterOrigin(triggers[color]);
    const initialAngle = Math.atan2(main.clientHeight * 0.5 - characterY, main.clientWidth * 0.5 - characterX);
    const originX = characterX + Math.cos(initialAngle) * 30;
    const originY = characterY + Math.sin(initialAngle) * 30;
    state.active = true;
    const fanOffsets = [-0.35, -0.16, 0.04, 0.3, 0.64, 0.98];
    fanOffsets.forEach((offset) => {
      createTip(
        state,
        originX,
        originY,
        initialAngle + offset + randomBetween(state, -0.07, 0.07),
        0,
        true,
      );
    });
    triggers[color].classList.remove("is-calling");
    triggers[color].classList.add("is-active");
    triggers[color].setAttribute("aria-pressed", "true");

    // Draw exactly one normal animation step immediately. This makes the click
    // response visible without giving the first segment a different speed.
    advanceNetwork(state, 16.667);
    previousFrame = performance.now();
    requestAnimation();
  };

  Object.entries(triggers).forEach(([color, trigger]) => {
    trigger.addEventListener("click", () => activateNetwork(color));
  });

  const gazeTargets = Object.values(triggers).map((trigger) => ({
    trigger,
    pupils: [...trigger.querySelectorAll(".pixel-character__pupil")],
  }));
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  let gazeFrame = 0;
  let pointerX = 0;
  let pointerY = 0;

  const centerEyes = () => {
    if (gazeFrame) {
      window.cancelAnimationFrame(gazeFrame);
      gazeFrame = 0;
    }

    gazeTargets.forEach(({ pupils }) => {
      pupils.forEach((pupil) => {
        pupil.style.transform = "translate(0, 0)";
      });
    });
  };

  const updateGaze = () => {
    gazeFrame = 0;
    const gazeRadius = Math.min(360, Math.max(260, window.innerWidth * 0.24));
    const maxPupilOffset = 2;

    gazeTargets.forEach(({ trigger, pupils }) => {
      const bounds = trigger.getBoundingClientRect();
      const deltaX = pointerX - (bounds.left + bounds.width / 2);
      const deltaY = pointerY - (bounds.top + bounds.height / 2);
      const distance = Math.hypot(deltaX, deltaY);
      let offsetX = 0;
      let offsetY = 0;

      if (distance > 0 && distance <= gazeRadius) {
        const proximity = 1 - distance / gazeRadius;
        const strength = maxPupilOffset * (0.55 + proximity * 0.45);
        offsetX = Math.round((deltaX / distance) * strength);
        offsetY = Math.round((deltaY / distance) * strength);
      }

      pupils.forEach((pupil) => {
        pupil.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      });
    });
  };

  document.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || event.pointerType === "touch") return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!gazeFrame) gazeFrame = window.requestAnimationFrame(updateGaze);
  }, { passive: true });

  document.documentElement.addEventListener("mouseleave", centerEyes);
  window.addEventListener("blur", centerEyes);
  finePointer.addEventListener("change", centerEyes);

  dismissSpeech.addEventListener("click", (event) => {
    event.stopPropagation();
    speech.hidden = true;
  });

  const sizeCanvas = () => {
    const width = main.clientWidth;
    const height = main.clientHeight;
    if (!width || !height) return;
    canvas.setAttribute("viewBox", `0 0 ${width} ${height}`);
    canvas.setAttribute("preserveAspectRatio", "none");
  };

  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(sizeCanvas);
  });

  sizeCanvas();
}
