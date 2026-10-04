// Temperatura de un lead. Valores canónicos en minúscula y sin tilde, que es
// como los devuelve el clasificador de n8n.
const CLASIFICACIONES = ['frio', 'tibio', 'caliente'];

// Acepta variantes de escritura ("Frío", " CALIENTE ") y devuelve el valor
// canónico, o null si no es una clasificación válida.
function normalizeClasificacion(value) {
  if (typeof value !== 'string') return null;
  const sinTildes = value.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const v = sinTildes.trim().toLowerCase();
  return CLASIFICACIONES.includes(v) ? v : null;
}

module.exports = { CLASIFICACIONES, normalizeClasificacion };
