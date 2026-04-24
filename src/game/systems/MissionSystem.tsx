import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MissionMarker } from "../components/MissionMarker";
import { WaypointRing } from "../components/WaypointRing";
import { EntityRegistry } from "../core/EntityRegistry";
import { useGameStore } from "../core/gameStore";

const DEFAULT_REACH_RADIUS = 4;
const _playerPos = new THREE.Vector3();
const _targetPos = new THREE.Vector3();

function distance2D(a: [number, number, number], b: [number, number, number]) {
  const dx = a[0] - b[0];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dz * dz);
}

function ReachLocationTracker() {
  useFrame(() => {
    const state = useGameStore.getState();

    for (const mission of state.missions) {
      if (mission.type !== "reach_location") continue;
      if (state.missionStates[mission.id] !== "active") continue;

      const target = mission.target;
      if (!target.locationPosition) continue;

      const playerPos = EntityRegistry.getPosition("player") ?? state.playerPosition;
      const radius = target.locationRadius ?? DEFAULT_REACH_RADIUS;

      _playerPos.set(playerPos[0], 0, playerPos[2]);
      _targetPos.set(target.locationPosition[0], 0, target.locationPosition[2]);

      if (_playerPos.distanceTo(_targetPos) <= radius) {
        if (mission.completion?.returnToNpcId) {
          useGameStore.setState((s) => ({
            missionStates: { ...s.missionStates, [mission.id]: "ready_to_complete" },
            activeMissionId: mission.id,
          }));
        } else {
          useGameStore.getState().completeMission(mission.id);
        }
      }
    }
  });

  return null;
}

function WaypointTracker() {
  useFrame(() => {
    const state = useGameStore.getState();

    for (const mission of state.missions) {
      if (!mission.waypoints?.length) continue;
      if (state.missionStates[mission.id] !== "active") continue;

      const waypointIdx = state.waypointProgress[mission.id] ?? 0;
      if (waypointIdx >= mission.waypoints.length) continue;

      const waypoint = mission.waypoints[waypointIdx];
      const playerPos = EntityRegistry.getPosition("player") ?? state.playerPosition;
      const dist = distance2D(playerPos, waypoint.position);

      if (dist <= waypoint.radius) {
        useGameStore.getState().advanceWaypoint(mission.id);
      }
    }
  });

  return null;
}

function MissionVisuals() {
  const world = useGameStore((state) => state.world);
  const missions = useGameStore((state) => state.missions);
  const missionStates = useGameStore((state) => state.missionStates);
  const npcRuntime = useGameStore((state) => state.npcRuntime);
  const waypointProgress = useGameStore((state) => state.waypointProgress);

  return (
    <>
      {missions.flatMap((mission) => {
        const state = missionStates[mission.id];
        const elements: React.ReactNode[] = [];

        // Waypoints — show rings for active + upcoming waypoints
        if (mission.waypoints?.length && state === "active") {
          const waypointIdx = waypointProgress[mission.id] ?? 0;
          mission.waypoints.forEach((wp, i) => {
            if (i >= waypointIdx) {
              elements.push(
                <WaypointRing
                  key={`${mission.id}_wp_${i}`}
                  position={wp.position}
                  active={i === waypointIdx}
                  label={wp.label}
                />,
              );
            }
          });
          return elements;
        }

        // reach_location marker — show target position when active
        if (mission.type === "reach_location" && mission.target.locationPosition && state === "active") {
          elements.push(
            <MissionMarker
              key={`${mission.id}_reach`}
              position={mission.target.locationPosition}
              visible
            />,
          );
          return elements;
        }

        // collect / talk_to_npc return marker — show on ready_to_complete
        const returnNpcId = mission.completion?.returnToNpcId;
        const npc = returnNpcId ? world.npcs.find((entry) => entry.id === returnNpcId) : null;

        if (npc && state === "ready_to_complete") {
          const livePosition = npcRuntime[npc.id]?.position ?? npc.position;
          elements.push(
            <MissionMarker
              key={`${mission.id}_return`}
              position={livePosition}
              visible
            />,
          );
        }

        return elements;
      })}
    </>
  );
}

export function MissionSystem() {
  return (
    <>
      <ReachLocationTracker />
      <WaypointTracker />
      <MissionVisuals />
    </>
  );
}
