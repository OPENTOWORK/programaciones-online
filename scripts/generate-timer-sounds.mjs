#!/usr/bin/env node
/**
 * Genera los pitidos del cronómetro en assets/sounds (WAV mono de 16 bits).
 * Uso: node scripts/generate-timer-sounds.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SAMPLE_RATE = 22050;
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds');

/** Cada nota es [frecuencia en Hz, duración en s, silencio posterior en s]. */
const SOUNDS = {
  'timer-tick': [[880, 0.12, 0]],
  'timer-phase': [[1320, 0.5, 0]],
  'timer-finish': [
    [1320, 0.16, 0.08],
    [1320, 0.16, 0.08],
    [1760, 0.6, 0],
  ],
};

function renderNote(frequency, duration) {
  const length = Math.round(duration * SAMPLE_RATE);
  const attack = 0.005 * SAMPLE_RATE;
  const release = Math.min(0.06, duration / 3) * SAMPLE_RATE;
  const samples = new Float32Array(length);

  for (let i = 0; i < length; i += 1) {
    const t = i / SAMPLE_RATE;
    const envelope = Math.min(1, i / attack, (length - i) / release);
    // El tercer armónico hace que el pitido se oiga por encima del ruido del box sin ser áspero.
    const wave =
      Math.sin(2 * Math.PI * frequency * t) + 0.25 * Math.sin(2 * Math.PI * 3 * frequency * t);
    samples[i] = (wave / 1.25) * envelope * 0.8;
  }
  return samples;
}

function renderSound(notes) {
  const parts = notes.flatMap(([frequency, duration, gap]) => [
    renderNote(frequency, duration),
    new Float32Array(Math.round(gap * SAMPLE_RATE)),
  ]);
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const samples = new Float32Array(total);
  let offset = 0;
  for (const part of parts) {
    samples.set(part, offset);
    offset += part.length;
  }
  return samples;
}

function encodeWav(samples) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  samples.forEach((sample, index) => {
    const clamped = Math.max(-1, Math.min(1, sample));
    buffer.writeInt16LE(Math.round(clamped * 0x7fff), 44 + index * 2);
  });
  return buffer;
}

mkdirSync(OUT_DIR, { recursive: true });
for (const [name, notes] of Object.entries(SOUNDS)) {
  const file = join(OUT_DIR, `${name}.wav`);
  writeFileSync(file, encodeWav(renderSound(notes)));
  console.log(`✓ ${file}`);
}
