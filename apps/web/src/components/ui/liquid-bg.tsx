/**
 * Camada de fundo Liquid Civic:
 *   - base sólida em --background
 *   - 3 blobs radiais coloridos (verde, azul, dourado)
 *   - dot pattern sutil
 *
 * Uso: posicione como primeiro filho de um container `relative overflow-hidden`.
 */
export function LiquidBg() {
  return (
    <>
      {/* Base */}
      <div className="absolute inset-0 bg-background" aria-hidden />

      {/* Blobs ambientais */}
      <div className="page-gradient absolute inset-0 opacity-95" aria-hidden />

      {/* Dot pattern */}
      <div className="dot-pattern absolute inset-0 opacity-100" aria-hidden />
    </>
  );
}
