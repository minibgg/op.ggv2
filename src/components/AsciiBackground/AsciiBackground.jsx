import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRankTheme } from "../../context/RankThemeContext";
import "./AsciiBackground.css";

// Набор символов градиента плотности капли
const CHAR_W = 8;
const CHAR_H = 11;

// Количество одновременно активных капель
const DROP_COUNT = 34;

// Цвет по умолчанию, если ранга нет — небесно-голубой (#4aa8f8)
const DEFAULT_BLUE_HEX = "#4aa8f8";
const DEFAULT_BLUE_RGB = { r: 74, g: 168, b: 248 };

function hexToRgb(hex) {
  if (!hex || typeof hex !== "string") {
    return { ...DEFAULT_BLUE_RGB };
  }
  const clean = hex.replace("#", "").trim();
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
      return { r, g, b };
    }
  }
  return { ...DEFAULT_BLUE_RGB };
}

function createDrop(leftBounds, rightBounds, height, initial = false) {
  const isLeft = Math.random() < 0.5;
  const minX = isLeft ? leftBounds[0] : rightBounds[0];
  const maxX = isLeft ? leftBounds[1] : rightBounds[1];
  const span = Math.max(maxX - minX, 10);
  const x = minX + Math.random() * span;

  return {
    x,
    y: initial ? Math.random() * height : 0,
    vy: 0.15 + Math.random() * 0.2,
    gravity: 0.018 + Math.random() * 0.018,
    maxSpeed: 1.4 + Math.random() * 0.9,
    tailRows: Math.floor(9 + Math.random() * 8),
    size: Math.random() < 0.55 ? 2 : 1, // 2 = объемная капля
    alpha: 0.7 + Math.random() * 0.3,
    state: initial ? "falling" : "forming",
    formProgress: 0,
    formSpeed: 0.007 + Math.random() * 0.008,
  };
}

function resetDrop(drop, leftBounds, rightBounds) {
  const isLeft = Math.random() < 0.5;
  const minX = isLeft ? leftBounds[0] : rightBounds[0];
  const maxX = isLeft ? leftBounds[1] : rightBounds[1];
  const span = Math.max(maxX - minX, 10);
  drop.x = minX + Math.random() * span;
  drop.y = 0;
  drop.vy = 0.15 + Math.random() * 0.2;
  drop.gravity = 0.018 + Math.random() * 0.018;
  drop.maxSpeed = 1.4 + Math.random() * 0.9;
  drop.tailRows = Math.floor(9 + Math.random() * 8);
  drop.size = Math.random() < 0.55 ? 2 : 1;
  drop.alpha = 0.7 + Math.random() * 0.3;
  drop.state = "forming";
  drop.formProgress = 0;
  drop.formSpeed = 0.007 + Math.random() * 0.008;
}

function renderBubble(
  ctx,
  b,
  isFalling,
  rVal,
  gVal,
  bVal,
  safeLeft,
  safeRight,
  rootRect,
  height,
) {
  const rad = b.radius;
  if (rad < 4) return;

  const stretchY = isFalling ? Math.min(1.45, 1.0 + (b.vy || 0) * 0.045) : 1.0;
  const stretchX = isFalling ? 1.0 / Math.sqrt(stretchY) : 1.0;

  const spanX = Math.ceil((rad * stretchX * 1.5) / CHAR_W);
  const spanY = Math.ceil((rad * stretchY * 1.5) / CHAR_H);
  const centerCol = Math.round(b.x / CHAR_W);
  const centerRow = Math.round(b.y / CHAR_H);

  for (let r = centerRow - spanY; r <= centerRow + spanY; r++) {
    const drawY = r * CHAR_H;
    if (drawY < 0 || drawY >= height) continue;

    for (let c = centerCol - spanX; c <= centerCol + spanX; c++) {
      const drawX = c * CHAR_W;

      // Исключаем отрисовку под контентом сайта
      if (rootRect && drawX >= safeLeft && drawX <= safeRight) continue;

      const dx = (drawX - b.x) / stretchX;
      const dy = ((drawY - b.y) * (CHAR_W / CHAR_H)) / stretchY;
      const rawDist = Math.hypot(dx, dy);

      // Органичное покачивание поверхности пузыря (желейная физика)
      const angle = Math.atan2(dy, dx);
      const wobble =
        Math.sin(angle * 4 + (b.wobblePhase || 0)) * (isFalling ? 0.8 : 1.5);
      const dist = rawDist - wobble;

      if (dist > rad + 2.5) continue;

      const rimDist = Math.abs(dist - rad);
      // Блик в левом верхнем углу пузыря
      const glintDist = Math.hypot(dx - -rad * 0.42, dy - -rad * 0.42);

      if (glintDist < Math.max(3.5, rad * 0.22)) {
        // Яркий точечный блик света
        ctx.fillStyle = `rgba(255, 255, 255, 0.95)`;
        ctx.fillText("@", drawX, drawY);
      } else if (rimDist <= 2.2) {
        // Внешняя мембрана / оболочка пузыря
        const rimAlpha = 0.85 + Math.sin(angle * 2) * 0.15;
        const char = rimDist > 1.2 ? "8" : "@";
        ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, ${rimAlpha})`;
        ctx.fillText(char, drawX, drawY);
      } else if (dist < rad && dist >= rad - 5.5) {
        // Внутреннее свечение под мембраной
        ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, 0.55)`;
        ctx.fillText("#", drawX, drawY);
      } else if (dist < rad - 5.5) {
        // Жидкая полупрозрачная сердцевина
        if (glintDist < rad * 0.4) {
          ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, 0.35)`;
          ctx.fillText("o", drawX, drawY);
        } else if ((c + r) % 3 === 0) {
          ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, 0.20)`;
          ctx.fillText("~", drawX, drawY);
        } else if ((c * 2 + r) % 4 === 0) {
          ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, 0.15)`;
          ctx.fillText(".", drawX, drawY);
        }
      }
    }
  }
}

export function AsciiBackground() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const { rankColor } = useRankTheme();
  const rankColorRef = useRef(rankColor);

  useEffect(() => {
    rankColorRef.current = rankColor;
  }, [rankColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrameId;
    let isVisible = true;

    const mouse = { x: -1000, y: -1000, hasMouse: false };
    let isMouseDown = false;
    let activeBubble = null;
    const fallingBubbles = [];

    const currentRgb = hexToRgb(rankColorRef.current || DEFAULT_BLUE_HEX);

    let leftBounds = [16, 300];
    let rightBounds = [1500, 1900];
    let drops = [];
    const splashes = [];

    const spawnSplash = (x, y) => {
      const count = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        splashes.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 2.8,
          vy: -(1.0 + Math.random() * 1.8),
          life: 1.0,
          decay: 0.04 + Math.random() * 0.03,
        });
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.font =
        '9px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';
      ctx.textBaseline = "top";

      const rootEl = document.getElementById("root");
      const rootRect = rootEl?.getBoundingClientRect();
      const safeLeft = rootRect ? rootRect.left - 12 : width * 0.2;
      const safeRight = rootRect ? rootRect.right + 12 : width * 0.8;

      leftBounds = [16, Math.max(safeLeft, 40)];
      rightBounds = [Math.min(safeRight, width - 40), width - 16];

      drops = Array.from({ length: DROP_COUNT }, () =>
        createDrop(leftBounds, rightBounds, height, true),
      );
    };

    const handleMouseDown = (e) => {
      if (e.button !== 0) return;

      const rootEl = document.getElementById("root");
      const rootRect = rootEl?.getBoundingClientRect();
      const safeLeft = rootRect ? rootRect.left - 12 : width * 0.2;
      const safeRight = rootRect ? rootRect.right + 12 : width * 0.8;

      // Проверяем, кликнул ли пользователь внутри основного контента сайта
      const isInsideContent = Boolean(
        rootEl &&
        rootRect &&
        e.clientX >= safeLeft &&
        e.clientX <= safeRight &&
        e.clientY >= rootRect.top &&
        e.clientY <= rootRect.bottom &&
        rootEl.contains(e.target),
      );

      // Проверяем клик по интерактивным элементам (кнопки, ссылки, поиск)
      const isInteractive = Boolean(
        e.target?.closest &&
        e.target.closest("input, textarea, button, a, select, [role='button']"),
      );

      // Если клик внутри контента или по элементам интерфейса — не мешаем обычному клику/выделению
      if (isInsideContent || isInteractive) {
        return;
      }

      // Клик по фону для сбора капли — предотвращаем выделение текста на сайте
      e.preventDefault();

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        selection.removeAllRanges();
      }

      document.body.style.userSelect = "none";
      document.body.style.webkitUserSelect = "none";

      isMouseDown = true;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.hasMouse = true;

      activeBubble = {
        x: e.clientX,
        y: e.clientY,
        radius: 8,
        targetRadius: 10,
        mass: 1,
        wobblePhase: Math.random() * Math.PI,
      };
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.hasMouse = true;

      // При перетаскивании пузыря не даем браузеру выделить текст
      if (isMouseDown && activeBubble) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          sel.removeAllRanges();
        }
      }
    };

    const handleMouseUp = (e) => {
      if (e.button !== 0) return;
      if (isMouseDown) {
        document.body.style.userSelect = "";
        document.body.style.webkitUserSelect = "";
      }
      isMouseDown = false;
      if (activeBubble) {
        fallingBubbles.push({
          x: activeBubble.x,
          y: activeBubble.y,
          radius: activeBubble.radius,
          vy: 0.6,
          gravity: 0.2,
          maxSpeed: 8.5,
          mass: activeBubble.mass,
          wobblePhase: activeBubble.wobblePhase,
        });
        activeBubble = null;
      }
    };

    const handleMouseEnter = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.hasMouse = true;
    };

    const handleMouseLeave = () => {
      mouse.hasMouse = false;
      if (isMouseDown) {
        document.body.style.userSelect = "";
        document.body.style.webkitUserSelect = "";
      }
      if (isMouseDown && activeBubble) {
        isMouseDown = false;
        fallingBubbles.push({
          x: activeBubble.x,
          y: activeBubble.y,
          radius: activeBubble.radius,
          vy: 0.6,
          gravity: 0.2,
          maxSpeed: 8.5,
          mass: activeBubble.mass,
          wobblePhase: activeBubble.wobblePhase,
        });
        activeBubble = null;
      }
    };

    const handleSelectStart = (e) => {
      if (isMouseDown && activeBubble) {
        e.preventDefault();
      }
    };

    const handleDragStart = (e) => {
      if (isMouseDown && activeBubble) {
        e.preventDefault();
      }
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseenter", handleMouseEnter, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    window.addEventListener("selectstart", handleSelectStart);
    window.addEventListener("dragstart", handleDragStart);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    resize();

    const rootEl = document.getElementById("root");

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible) return;

      // Плавная интерполяция к цвету ранга SoloQ игрока (либо к голубому по умолчанию #4aa8f8)
      const targetRgb = hexToRgb(rankColorRef.current || DEFAULT_BLUE_HEX);
      currentRgb.r += (targetRgb.r - currentRgb.r) * 0.04;
      currentRgb.g += (targetRgb.g - currentRgb.g) * 0.04;
      currentRgb.b += (targetRgb.b - currentRgb.b) * 0.04;

      const rVal = Math.round(currentRgb.r);
      const gVal = Math.round(currentRgb.g);
      const bVal = Math.round(currentRgb.b);

      // Обновляем цвет статической сетки точек
      if (containerRef.current) {
        containerRef.current.style.setProperty(
          "--rank-dot-color",
          `rgba(${rVal}, ${gVal}, ${bVal}, 0.20)`,
        );
      }

      ctx.clearRect(0, 0, width, height);

      // Актуальные границы контента сайта
      const rootRect = rootEl?.getBoundingClientRect();
      const safeLeft = rootRect ? rootRect.left - 12 : width * 0.2;
      const safeRight = rootRect ? rootRect.right + 12 : width * 0.8;
      leftBounds[1] = Math.max(safeLeft, 40);
      rightBounds[0] = Math.min(safeRight, width - 40);

      // Обновление и отрисовка капель
      for (let i = 0; i < drops.length; i++) {
        const drop = drops[i];

        if (activeBubble) {
          const abdx = activeBubble.x - drop.x;
          const abdy = activeBubble.y - drop.y;
          const abDist = Math.hypot(abdx, abdy);
          // Локальный радиус притяжения вокруг пузыря (увеличен)
          const pullRadius = Math.max(80, activeBubble.radius + 40);

          if (abDist <= pullRadius && abDist > 0) {
            // Капли только внутри радиуса срываются с потолка и притягиваются
            if (drop.state === "forming") {
              drop.state = "falling";
            }

            // Плавный спад силы притяжения от границы к центру (спокойное медленное движение)
            const norm = abDist / pullRadius;
            const influence = Math.pow(1 - norm, 1.8);
            const pullSpeed = 0.4 + influence * 2.4;
            const swirlSpeed = influence * 0.9;

            const perpX = -abdy / abDist;
            const perpY = abdx / abDist;

            drop.x += (abdx / abDist) * pullSpeed + perpX * swirlSpeed;
            drop.y += (abdy / abDist) * pullSpeed + perpY * swirlSpeed;

            // Капля достигла пузыря — поглощение в общую массу
            if (abDist < activeBubble.radius + 5) {
              activeBubble.mass += 1;
              splashes.push({
                x: drop.x,
                y: drop.y,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                life: 0.45,
                decay: 0.08,
              });
              resetDrop(drop, leftBounds, rightBounds);
              continue;
            }
          }
        }

        if (drop.state === "forming") {
          // Капля формируется и набухает у самого верхнего края экрана
          drop.formProgress += drop.formSpeed;

          const col = Math.round(drop.x / CHAR_W);
          const drawX = col * CHAR_W;

          // Исключаем отрисовку под контентом сайта
          if (!(rootRect && drawX >= safeLeft && drawX <= safeRight)) {
            if (drop.formProgress < 0.25) {
              ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, ${drop.alpha * 0.35})`;
              ctx.fillText(".", drawX, 0);
            } else if (drop.formProgress < 0.55) {
              ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, ${drop.alpha * 0.6})`;
              ctx.fillText(":", drawX, 0);
            } else if (drop.formProgress < 0.85) {
              ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, ${drop.alpha * 0.85})`;
              ctx.fillText("o", drawX, 0);
            } else {
              // Набухшая капля готова к отрыву
              ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, ${drop.alpha})`;
              ctx.fillText("8", drawX, 0);
              ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, ${drop.alpha * 0.5})`;
              ctx.fillText(".", drawX, CHAR_H);
              if (drop.size === 2) {
                ctx.fillText(".", drawX - CHAR_W, 0);
                ctx.fillText(".", drawX + CHAR_W, 0);
              }
            }
          }

          if (drop.formProgress >= 1) {
            drop.state = "falling";
          }
        } else {
          // Падение капли с ускорением свободного падения
          drop.vy = Math.min(drop.vy + drop.gravity, drop.maxSpeed);
          drop.y += drop.vy;

          // Достижение нижнего края экрана — всплеск и респавн
          if (drop.y >= height - 5) {
            spawnSplash(drop.x, height - 5);
            resetDrop(drop, leftBounds, rightBounds);
            continue;
          }

          const col = Math.round(drop.x / CHAR_W);
          const drawX = col * CHAR_W;

          // Исключаем отрисовку под контентом сайта
          if (rootRect && drawX >= safeLeft && drawX <= safeRight) {
            continue;
          }

          const headRow = Math.floor(drop.y / CHAR_H);

          // Отрисовка хвоста и головки капли
          for (let r = headRow - drop.tailRows; r <= headRow; r++) {
            if (r < 0 || r * CHAR_H >= height) continue;

            const distFromHead = headRow - r;
            const drawY = r * CHAR_H;

            let char = ".";
            let charAlpha = 0.2;

            if (distFromHead === 0) {
              // Головка капли
              char = drop.size === 2 ? "@" : "8";
              charAlpha = 1.0;

              // Боковые капли для округлой формы
              if (drop.size === 2) {
                ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, ${drop.alpha * 0.4})`;
                ctx.fillText(".", drawX - CHAR_W, drawY);
                ctx.fillText(".", drawX + CHAR_W, drawY);
              }
            } else if (distFromHead === 1) {
              char = "#";
              charAlpha = 0.85;
            } else if (distFromHead === 2) {
              char = "X";
              charAlpha = 0.72;
            } else if (distFromHead === 3) {
              char = "*";
              charAlpha = 0.58;
            } else if (distFromHead === 4) {
              char = "+";
              charAlpha = 0.46;
            } else if (distFromHead === 5) {
              char = "=";
              charAlpha = 0.36;
            } else if (distFromHead === 6) {
              char = "-";
              charAlpha = 0.26;
            } else if (distFromHead === 7) {
              char = ":";
              charAlpha = 0.18;
            } else {
              char = ".";
              charAlpha = 0.12;
            }

            ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, ${drop.alpha * charAlpha})`;
            ctx.fillText(char, drawX, drawY);
          }
        }
      }

      // Обновление и отрисовка активного пузыря (удерживаемого мышью)
      if (activeBubble) {
        activeBubble.x += (mouse.x - activeBubble.x) * 0.35;
        activeBubble.y += (mouse.y - activeBubble.y) * 0.35;
        activeBubble.wobblePhase += 0.06;

        // Плавный и более медленный рост пузыря по мере сбора капель
        activeBubble.targetRadius = Math.min(
          52,
          10 + Math.pow(activeBubble.mass, 0.48) * 2.2,
        );
        activeBubble.radius +=
          (activeBubble.targetRadius - activeBubble.radius) * 0.045;

        renderBubble(
          ctx,
          activeBubble,
          false,
          rVal,
          gVal,
          bVal,
          safeLeft,
          safeRight,
          rootRect,
          height,
        );
      }

      // Обновление и отрисовка падающих пузырей (отпущенных пользователем)
      for (let bIdx = fallingBubbles.length - 1; bIdx >= 0; bIdx--) {
        const fb = fallingBubbles[bIdx];
        fb.vy = Math.min(fb.vy + fb.gravity, fb.maxSpeed);
        fb.y += fb.vy;
        fb.wobblePhase += 0.06;

        // Капли-следы за падающим пузырем
        if (Math.random() < 0.35) {
          splashes.push({
            x: fb.x + (Math.random() - 0.5) * (fb.radius * 0.5),
            y: fb.y - fb.radius * 0.7,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -Math.random() * 1.5,
            life: 0.5,
            decay: 0.06,
          });
        }

        // При ударе о низ экрана — мощный взрывной всплеск
        if (fb.y >= height - fb.radius * 0.6) {
          const splashCount = Math.min(36, 16 + Math.floor(fb.radius * 0.6));
          for (let s = 0; s < splashCount; s++) {
            const angle = -Math.PI * (0.08 + Math.random() * 0.84);
            const speed = 2.0 + Math.random() * 6.5;
            splashes.push({
              x: fb.x + (Math.random() - 0.5) * fb.radius,
              y: height - 6,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1.0,
              decay: 0.022 + Math.random() * 0.02,
            });
          }
          fallingBubbles.splice(bIdx, 1);
          continue;
        }

        renderBubble(
          ctx,
          fb,
          true,
          rVal,
          gVal,
          bVal,
          safeLeft,
          safeRight,
          rootRect,
          height,
        );
      }

      // Отрисовка брызг (частиц от удара капель и пузырей)
      for (let i = splashes.length - 1; i >= 0; i--) {
        const p = splashes[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // мягкая гравитация брызг
        p.life -= p.decay;

        if (p.life <= 0) {
          splashes.splice(i, 1);
          continue;
        }

        const col = Math.round(p.x / CHAR_W);
        const row = Math.round(p.y / CHAR_H);
        const px = col * CHAR_W;
        const py = row * CHAR_H;

        if (!(rootRect && px >= safeLeft && px <= safeRight)) {
          ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, ${p.life * 0.75})`;
          ctx.fillText(p.life > 0.5 ? "*" : ".", px, py);
        }
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("selectstart", handleSelectStart);
      window.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={containerRef}
      className="asciiBackgroundContainer"
      aria-hidden="true"
    >
      <div className="asciiStaticDotGrid" />
      <canvas ref={canvasRef} className="asciiBackgroundCanvas" />
    </div>,
    document.body,
  );
}
