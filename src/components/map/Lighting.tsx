'use client';

/**
 * Lighting tuned for the Cassandra console aesthetic:
 * - Restrained ambient so base colors read clearly
 * - One key light from upper-right with mild warm tint
 * - A cool blue rim from the back for separation
 * - NO warm point light flooding from below (that was washing everything gold)
 */
export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.62} color="#c0c8d6" />

      <directionalLight
        position={[12, 18, 10]}
        intensity={0.95}
        color="#f3eeda"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={70}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-bias={-0.0008}
        shadow-normalBias={0.02}
      />

      {/* Cool rim from behind — gives prisms a thin blue edge on dark side */}
      <directionalLight position={[-10, 6, -12]} intensity={0.35} color="#2554a6" />

      {/* Gentle top-down fill (no warmth) so vertical sides aren't too dark */}
      <directionalLight position={[0, 16, 0]} intensity={0.22} color="#a8b3c5" />
    </>
  );
}
