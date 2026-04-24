import { NPC } from "../components/NPC";
import type { NPCConfig } from "../types/world.types";

type NPCSystemProps = {
  npcs: NPCConfig[];
};

export function NPCSystem({ npcs }: NPCSystemProps) {
  return (
    <>
      {npcs.map((npc) => (
        <NPC key={npc.id} npc={npc} />
      ))}
    </>
  );
}
