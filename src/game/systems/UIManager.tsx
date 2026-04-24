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
  const missionHint =
    missionState === "completed"
      ? "Mission complete!"
      : missionState === "ready_to_complete"
        ? "Return to Wizard Milo."
        : activeMissionId
          ? mission?.description
          : "Talk to Wizard Milo.";

  return (
    <div className="game-ui">
      <section className="mission-panel" aria-label="Mission progress">
        <div className="mission-panel__world">{worldName}</div>
        <h1>{mission?.title ?? "Free Explore"}</h1>
        <p>{missionHint}</p>
        {mission ? (
          <div className="gem-meter" aria-label={`Gems ${progress} of ${targetCount}`}>
            <span>Gems</span>
            <strong>
              {progress} / {targetCount}
            </strong>
          </div>
        ) : null}
      </section>

      <section className="status-panel" aria-label="Collection status">
        <span className="status-panel__dot" />
        <strong>{collectedIds.length}</strong>
        <span>collected</span>
      </section>

      {nearbyInteractable && !dialogue ? (
        <div className="interaction-prompt">{nearbyInteractable.prompt}</div>
      ) : null}

      {dialogue ? (
        <div className="dialogue-box">
          <div className="dialogue-box__speaker">{dialogue.speakerName}</div>
          <p>{dialogue.lines[dialogue.lineIndex]}</p>
          <span>Press E</span>
        </div>
      ) : null}

      {completionMessage ? <div className="completion-toast">{completionMessage}</div> : null}

      {paused ? <div className="pause-badge">Paused</div> : null}
    </div>
  );
}
