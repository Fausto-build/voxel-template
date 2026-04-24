import { useMemo } from "react";
import { useGameStore } from "../core/gameStore";

export function UIManager() {
  const worldName = useGameStore((state) => state.world.name);
  const missions = useGameStore((state) => state.missions);
  const activeMissionId = useGameStore((state) => state.activeMissionId);
  const missionProgress = useGameStore((state) => state.missionProgress);
  const missionStates = useGameStore((state) => state.missionStates);
  const nearbyInteractable = useGameStore((state) => state.nearbyInteractable);
  const dialogue = useGameStore((state) => state.dialogue);
  const completionMessage = useGameStore((state) => state.completionMessage);
  const collectedIds = useGameStore((state) => state.collectedIds);
  const paused = useGameStore((state) => state.paused);

  const mission = useMemo(() => {
    if (activeMissionId) {
      return missions.find((entry) => entry.id === activeMissionId) ?? missions[0] ?? null;
    }

    return missions[0] ?? null;
  }, [activeMissionId, missions]);

  const missionState = mission ? missionStates[mission.id] : null;
  const targetCount = mission?.target.count ?? 0;
  const progress = mission ? missionProgress[mission.id] ?? 0 : 0;

  const missionHint = useMemo(() => {
    if (!mission) return "Explora el mundo.";
    if (missionState === "completed") return "¡Misión completa!";
    if (missionState === "ready_to_complete") {
      if (mission.completion?.returnToNpcId) {
        return "Vuelve con el personaje indicado y presiona E para completar la misión.";
      }
      return "¡Ya puedes completar la misión!";
    }
    if (missionState === "active") {
      if (mission.type === "reach_location") return mission.description;
      if (mission.type === "talk_to_npc") return mission.description;
      return mission.description;
    }
    if (!activeMissionId) {
      return missions.some((m) => m.type === "collect")
        ? "Habla con el Mago Milo."
        : "Explora el mundo.";
    }
    return mission.description;
  }, [mission, missionState, activeMissionId, missions]);

  return (
    <div className="game-ui">
      <section className="mission-panel" aria-label="Progreso de la misión">
        <div className="mission-panel__world">{worldName}</div>
        <h1>{mission?.title ?? "Exploración libre"}</h1>
        <p>{missionHint}</p>
        {mission?.type === "collect" ? (
          <div className="gem-meter" aria-label={`Gemas ${progress} de ${targetCount}`}>
            <span>Gemas</span>
            <strong>
              {progress} / {targetCount}
            </strong>
          </div>
        ) : null}
      </section>

      <section className="status-panel" aria-label="Estado de la colección">
        <span className="status-panel__dot" />
        <strong>{collectedIds.length}</strong>
        <span>recolectadas</span>
      </section>

      {nearbyInteractable && !dialogue ? (
        <div className="interaction-prompt">{nearbyInteractable.prompt}</div>
      ) : null}

      {dialogue ? (
        <div className="dialogue-box">
          <div className="dialogue-box__speaker">{dialogue.speakerName}</div>
          <p>{dialogue.lines[dialogue.lineIndex]}</p>
          <span>Presiona E</span>
        </div>
      ) : null}

      {completionMessage ? <div className="completion-toast">{completionMessage}</div> : null}

      {paused ? <div className="pause-badge">Pausa</div> : null}
    </div>
  );
}
