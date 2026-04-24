type PlayerProps = {
  visible: boolean;
  yaw: number;
};

export function Player({ visible, yaw }: PlayerProps) {
  return (
    <group visible={visible} rotation={[0, yaw, 0]}>
      <mesh castShadow position={[0, 0.55, 0]}>
        <capsuleGeometry args={[0.42, 0.72, 5, 8]} />
        <meshStandardMaterial color="#FF8C5A" flatShading />
      </mesh>
      <mesh castShadow position={[0, 1.27, 0]}>
        <sphereGeometry args={[0.42, 12, 8]} />
        <meshStandardMaterial color="#FFE2B8" flatShading />
      </mesh>
      <mesh castShadow position={[0, 1.52, -0.08]} rotation={[0.35, 0, 0]}>
        <coneGeometry args={[0.38, 0.55, 8]} />
        <meshStandardMaterial color="#5E5AEF" flatShading />
      </mesh>
      <mesh castShadow position={[-0.26, 0.75, -0.02]} rotation={[0, 0, 0.2]}>
        <capsuleGeometry args={[0.12, 0.36, 4, 6]} />
        <meshStandardMaterial color="#FFCF7A" flatShading />
      </mesh>
      <mesh castShadow position={[0.26, 0.75, -0.02]} rotation={[0, 0, -0.2]}>
        <capsuleGeometry args={[0.12, 0.36, 4, 6]} />
        <meshStandardMaterial color="#FFCF7A" flatShading />
      </mesh>
      <mesh castShadow position={[-0.14, 0.06, 0]} rotation={[0, 0, 0.1]}>
        <capsuleGeometry args={[0.12, 0.38, 4, 6]} />
        <meshStandardMaterial color="#406CC7" flatShading />
      </mesh>
      <mesh castShadow position={[0.14, 0.06, 0]} rotation={[0, 0, -0.1]}>
        <capsuleGeometry args={[0.12, 0.38, 4, 6]} />
        <meshStandardMaterial color="#406CC7" flatShading />
      </mesh>
    </group>
  );
}
