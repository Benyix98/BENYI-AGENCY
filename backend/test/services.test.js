const { test } = require('node:test');
const assert = require('node:assert/strict');
const { SERVICES, normalizeMaintenance } = require('../config/services');

test('SERVICES tiene los 6 servicios con importes correctos', () => {
  assert.equal(SERVICES['automatizacion'].baseCents, 35000);
  assert.equal(SERVICES['automatizacion'].recurringCents, 3000);
  assert.equal(SERVICES['landings'].baseCents, 20000);
  assert.equal(SERVICES['landings'].recurringCents, 2000);
  assert.equal(SERVICES['soluciones-premium'].baseCents, 10000);
  assert.equal(SERVICES['soluciones-premium'].recurringCents, null);
  assert.equal(SERVICES['mentorias-1h'].baseCents, 6500);
  assert.equal(SERVICES['mentorias-3h'].baseCents, 17000);
});

test('normalizeMaintenance true solo si el servicio tiene cuota', () => {
  assert.equal(normalizeMaintenance('automatizacion', true), true);
  assert.equal(normalizeMaintenance('automatizacion', false), false);
  assert.equal(normalizeMaintenance('landings', 'on'), true);
  assert.equal(normalizeMaintenance('mentorias-1h', true), false);
  assert.equal(normalizeMaintenance('soluciones-premium', true), false);
});

test('normalizeMaintenance con servicio inexistente devuelve false', () => {
  assert.equal(normalizeMaintenance('no-existe', true), false);
});
