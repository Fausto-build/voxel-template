import { MissionMarker } from "../components/MissionMarker";
import { useGameStore } from "../core/gameStore";

export function MissionSystem() {
  const world = useGameStore((state) => state.world);
  const missions = useGameStore((state) => state.missions);
  const missionStates = useGameStore((state) => state.missionStates);

  return (
    <>
      {missions.map((mission) => {
        const returnNpcId = mission.completion?.returnToNpcId;
        const npc = returnNpcId ? world.npcs.find((entry) => entry.id === returnNpcId) : null;

        if (!npc) {
          return null;
        }

        return (
          <MissionMarker
            key={mission.id}
            position={npc.position}
            visible={missionStates[mission.id] === "ready_to_complete"}
          />
        );
      })}
    </>
  );
}
