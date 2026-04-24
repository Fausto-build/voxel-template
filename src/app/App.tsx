import { Suspense, lazy } from "react";
import { UIManager } from "../game/systems/UIManager";
import "./styles.css";

const GameCanvas = lazy(() =>
  import("../game/core/GameCanvas").then((m) => ({ default: m.GameCanvas })),
);

function GameLoadingFallback() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d1118",
        color: "#ffffff",
        fontSize: "1.1rem",
        fontFamily: "monospace",
        letterSpacing: "0.05em",
      }}
    >
      Cargando...
    </div>
  );
}

export function App() {
  return (
    <main className="app-shell">
      <Suspense fallback={<GameLoadingFallback />}>
        <GameCanvas />
      </Suspense>
      <UIManager />
    </main>
  );
}
