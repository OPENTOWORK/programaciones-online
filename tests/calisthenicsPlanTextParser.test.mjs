import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  isCalisthenicsPlanText,
  serializeCalisthenicsPlanMain,
} from '../scripts/lib/calisthenicsPlanTextParser.mjs';

const DAY_ONE =
  '→ FRONT (HOLD) Y PLANCHA SERIES Balance Aguantes de pino, haciendo diferentes figuras: abrir piernas, cerrar, budha… 15-20 mins Front Hold 4-6 secs de super adv-casi half (RIR 0 secs) x2-3 Front Hold 2-4 secs de super adv, 1-2 presses y 2-3 secs (RIR 0-1 secs) x2 Plancha Hold 6-10 secs de adv (RIR 0-1 secs) *Mantén altura* x2-3 Front Hold 6-10 secs de casi half Con goma de 15 kg (RIR 1 secs) x2 Empuje 2-4 Flexiones de pino (RIR 0) x2 Front 5-8 pull ups de adv y hold 3-4 secs (RIR perder rango de movimiento) *Agarre falso y si es necesario utiliza goma de 5 kg* O 6-10 Pull ups de tuck en anillas y 3-4 secs de adv (RIR perder rango de movimiento) x2 x12-14';

describe('calisthenicsPlanTextParser', () => {
  it('detects calisthenics PDF day text', () => {
    assert.equal(isCalisthenicsPlanText(DAY_ONE), true);
    assert.equal(isCalisthenicsPlanText('Back squat 5x5'), false);
  });

  it('serializes balance and strength blocks with exercise rows', () => {
    const main = serializeCalisthenicsPlanMain(DAY_ONE);

    assert.match(main, /^Técnica\/skills · Balance · 15-20 min/);
    assert.match(main, /• Aguante de pino: 15-20 min/);
    assert.match(main, /Fuerza · FRONT \(HOLD\) Y PLANCHA SERIES/);
    assert.match(main, /• Front Hold — super adv-casi half: 2-3 × 4-6 s · RIR 0 secs/);
    assert.match(main, /• Front Hold: 2 × 2-4 secs de super adv, 1-2 presses y 2-3 secs · RIR 0-1 secs/);
    assert.match(main, /• Plancha Hold — adv: 2-3 × 6-10 s · RIR 0-1 secs/);
    assert.match(main, /• \(Alt\) Front: 2 × 6-10 Pull ups de tuck en anillas/);
    assert.match(main, /Volumen total de tirón: 12-14 repeticiones/);
    assert.doesNotMatch(main, /texto libre/i);
  });
});
