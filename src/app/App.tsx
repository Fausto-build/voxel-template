import { GameCanvas } from "../game/core/GameCanvas";
import { UIManager } from "../game/systems/UIManager";
import "./styles.css";

export function App() {
  return (
    <main className="app-shell">
      <GameCanvas />
      <UIManager />
    </main>
  );
}
