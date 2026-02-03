import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from "@/shared/ui/useTheme";
import { useAiSignature } from "@/shared/ui/useAiSignature";

type DoomStats = {
  health: number;
  score: number;
  ammo: number;
};

const MAP = [
  "1111111111111111",
  "1000000000000001",
  "1011110111111101",
  "1010000100000101",
  "1010111101110101",
  "1000100001000001",
  "1110101111011101",
  "1000001000000001",
  "1011111110111101",
  "1000000000000001",
  "1111111111111111",
];

const TILE_SIZE = 1;
const FOV = Math.PI / 3;
const MAX_DEPTH = 12;

export function DoomPage() {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  useAiSignature("Doom / Arena");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stats, setStats] = useState<DoomStats>({ health: 100, score: 0, ammo: 25 });
  const [sessionId, setSessionId] = useState(0);

  const mapWidth = MAP[0]?.length ?? 0;
  const mapHeight = MAP.length;

  const instructions = useMemo(
    () => [
      "W/S: mover, A/D: girar",
      "Shift: correr",
      "Espaço: disparar",
      "R: recarregar munição",
    ],
    []
  );

  const started = sessionId > 0;

  useEffect(() => {
    if (!started) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame = 0;
    let running = true;

    const state = {
      x: 2.5,
      y: 2.5,
      angle: Math.PI / 4,
      walkSpeed: 2.2,
      runSpeed: 3.5,
      rotationSpeed: 2.3,
      keys: {
        forward: false,
        backward: false,
        left: false,
        right: false,
        run: false,
      },
      ammo: 25,
      health: 100,
      score: 0,
      flash: 0,
    };

    const enemies = Array.from({ length: 6 }).map((_, index) => ({
      id: index,
      x: 3 + Math.random() * 9,
      y: 3 + Math.random() * 6,
      alive: true,
    }));

    function isWall(x: number, y: number) {
      if (x < 0 || y < 0 || x >= mapWidth || y >= mapHeight) return true;
      return MAP[Math.floor(y)][Math.floor(x)] === "1";
    }

    function handleResize() {
      const parent = canvas.parentElement;
      const width = parent ? parent.clientWidth : 920;
      const height = parent ? Math.min(parent.clientHeight, 520) : 520;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.code === "KeyW") state.keys.forward = true;
      if (event.code === "KeyS") state.keys.backward = true;
      if (event.code === "KeyA") state.keys.left = true;
      if (event.code === "KeyD") state.keys.right = true;
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") state.keys.run = true;
      if (event.code === "Space") {
        if (state.ammo > 0) {
          state.ammo -= 1;
          state.flash = 0.15;
          const hit = enemies.find((enemy) => enemy.alive && Math.hypot(enemy.x - state.x, enemy.y - state.y) < 2.2);
          if (hit) {
            hit.alive = false;
            state.score += 100;
          }
        }
      }
      if (event.code === "KeyR") {
        state.ammo = 25;
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.code === "KeyW") state.keys.forward = false;
      if (event.code === "KeyS") state.keys.backward = false;
      if (event.code === "KeyA") state.keys.left = false;
      if (event.code === "KeyD") state.keys.right = false;
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") state.keys.run = false;
    }

    function update(dt: number) {
      const moveSpeed = state.keys.run ? state.runSpeed : state.walkSpeed;
      const moveStep = moveSpeed * dt;
      const rotStep = state.rotationSpeed * dt;

      if (state.keys.left) state.angle -= rotStep;
      if (state.keys.right) state.angle += rotStep;

      const dx = Math.cos(state.angle) * moveStep;
      const dy = Math.sin(state.angle) * moveStep;

      if (state.keys.forward) {
        const nextX = state.x + dx;
        const nextY = state.y + dy;
        if (!isWall(nextX, state.y)) state.x = nextX;
        if (!isWall(state.x, nextY)) state.y = nextY;
      }

      if (state.keys.backward) {
        const nextX = state.x - dx;
        const nextY = state.y - dy;
        if (!isWall(nextX, state.y)) state.x = nextX;
        if (!isWall(state.x, nextY)) state.y = nextY;
      }

      enemies.forEach((enemy) => {
        if (!enemy.alive) return;
        const dirX = state.x - enemy.x;
        const dirY = state.y - enemy.y;
        const dist = Math.hypot(dirX, dirY);
        if (dist > 0.6) {
          enemy.x += (dirX / dist) * dt * 0.6;
          enemy.y += (dirY / dist) * dt * 0.6;
        } else {
          state.health = Math.max(0, state.health - dt * 6);
        }
      });

      state.flash = Math.max(0, state.flash - dt);
      setStats({ health: Math.round(state.health), score: state.score, ammo: state.ammo });
    }

    function render() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#1b1b1b";
      ctx.fillRect(0, height / 2, width, height / 2);

      for (let column = 0; column < width; column += 2) {
        const rayAngle = state.angle - FOV / 2 + (column / width) * FOV;
        let distance = 0;
        while (distance < MAX_DEPTH) {
          const testX = state.x + Math.cos(rayAngle) * distance;
          const testY = state.y + Math.sin(rayAngle) * distance;
          if (isWall(testX, testY)) break;
          distance += 0.02;
        }

        const corrected = distance * Math.cos(rayAngle - state.angle);
        const wallHeight = Math.min(height, (TILE_SIZE / corrected) * (height * 0.8));
        const shade = Math.max(0, 255 - corrected * 22);
        ctx.fillStyle = `rgb(${shade}, ${shade * 0.5}, ${shade * 0.3})`;
        ctx.fillRect(column, (height - wallHeight) / 2, 2, wallHeight);
      }

      enemies.forEach((enemy) => {
        if (!enemy.alive) return;
        const angleToEnemy = Math.atan2(enemy.y - state.y, enemy.x - state.x);
        const angleDiff = ((angleToEnemy - state.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        if (Math.abs(angleDiff) > FOV / 2) return;
        const distance = Math.hypot(enemy.x - state.x, enemy.y - state.y);
        const size = Math.min(height * 0.6, (1 / distance) * height * 0.7);
        const x = ((angleDiff + FOV / 2) / FOV) * width - size / 2;
        const y = height / 2 - size / 2;
        ctx.fillStyle = "#c62828";
        ctx.fillRect(x, y, size, size);
      });

      if (state.flash > 0) {
        ctx.fillStyle = `rgba(255,200,120,${state.flash})`;
        ctx.fillRect(0, 0, width, height);
      }
    }

    let lastTime = performance.now();
    function loop(time: number) {
      if (!running) return;
      const dt = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;
      update(dt);
      render();
      animationFrame = requestAnimationFrame(loop);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    animationFrame = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [mapHeight, mapWidth, sessionId, started]);

  const isDark = theme === "dark";
  const pageStyle = {
    minHeight: "100vh",
    background: isDark ? "#060606" : "#f5f5f5",
    padding: "clamp(20px, 4vw, 32px)",
    fontFamily: "'Inter', 'Roboto', system-ui, sans-serif",
    color: isDark ? "#f5f5f5" : "#111111",
  };
  const cardStyle = {
    background: isDark ? "#101010" : "#ffffff",
    borderRadius: 22,
    padding: 20,
    border: isDark ? "1px solid #2b2b2b" : "1px solid #e4e4e4",
    boxShadow: isDark ? "0 16px 40px rgba(0,0,0,0.4)" : "0 16px 40px rgba(0,0,0,0.08)",
  };

  return (
    <div style={pageStyle}>
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        title={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
        aria-label="Alternar tema"
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          width: 52,
          height: 52,
          borderRadius: 999,
          border: "none",
          background: isDark ? "#1f1f1f" : "#ffffff",
          color: isDark ? "#90caf9" : "#ff8f00",
          fontSize: 20,
          cursor: "pointer",
          boxShadow: isDark ? "0 16px 30px rgba(0,0,0,0.45)" : "0 16px 30px rgba(0,0,0,0.2)",
          zIndex: 20,
        }}
      >
        {isDark ? "🌙" : "☀️"}
      </button>

      <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gap: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28 }}>Módulo Doom</h1>
            <p style={{ marginTop: 8, color: isDark ? "#bdbdbd" : "#616161" }}>
              Combate rápido em primeira pessoa inspirado no clássico.
            </p>
          </div>
          <button
            onClick={logout}
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              border: isDark ? "1px solid #ffffff" : "1px solid #111111",
              background: "transparent",
              color: isDark ? "#ffffff" : "#111111",
              fontWeight: 600,
              cursor: "pointer",
              opacity: 0.9,
            }}
            title="Sair"
          >
            Sair
          </button>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ ...cardStyle, display: "grid", gap: 12 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <button
                onClick={() => setSessionId((prev) => (prev === 0 ? 1 : prev + 1))}
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: "none",
                  background: isDark ? "#ffffff" : "#111111",
                  color: isDark ? "#111111" : "#ffffff",
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity: 0.92,
                }}
              >
                {started ? "Reiniciar combate" : "Iniciar combate"}
              </button>
              <div style={{ display: "flex", gap: 16, fontWeight: 600 }}>
                <span>HP: {stats.health}</span>
                <span>Mun: {stats.ammo}</span>
                <span>Pontuação: {stats.score}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, color: isDark ? "#bdbdbd" : "#616161" }}>
              {instructions.map((text) => (
                <span key={text}>{text}</span>
              ))}
            </div>
          </div>

          <div style={{ ...cardStyle, padding: 12 }}>
            {started ? (
              <canvas
                ref={canvasRef}
                style={{
                  width: "100%",
                  height: 520,
                  borderRadius: 18,
                  border: isDark ? "1px solid #2b2b2b" : "1px solid #e4e4e4",
                  background: "#050505",
                }}
              />
            ) : (
              <div
                style={{
                  height: 520,
                  borderRadius: 18,
                  border: isDark ? "1px solid #2b2b2b" : "1px solid #e4e4e4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: 24,
                  color: isDark ? "#bdbdbd" : "#616161",
                  background: isDark ? "#0a0a0a" : "#fafafa",
                }}
              >
                Clique em iniciar para entrar na arena.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
