export const AIMHARDER_TRACKS = [
  { key: 'athx', color: '239,36,242', programName: 'ATHX' },
  { key: 'hyrox', color: '239,247,10', programName: 'Hyrox' },
  { key: 'hype', color: '250,148,80', programName: 'Hype' },
  { key: 'crosstraining', color: '180,184,183', programName: 'Crosstraining' },
  { key: 'calistenia', color: '62,209,65', programName: 'Calistenia' },
  { key: 'basico', color: '36,228,242', programName: 'Básico' },
];

const TRACK_BY_COLOR = new Map(AIMHARDER_TRACKS.map((track) => [track.color, track]));

export function getTrackByColor(color) {
  return TRACK_BY_COLOR.get(color) ?? null;
}

export function resolveTrackRates(dayData) {
  const ids = dayData.rates?.ids ?? [];
  const colors = dayData.rates?.colors ?? [];

  return ids
    .map((rateId, index) => ({
      rateId,
      color: colors[index],
      track: getTrackByColor(colors[index]),
    }))
    .filter((item) => item.track);
}
