import { StyleSheet, View } from 'react-native';

import { ProgramCard } from '@/components/program/ProgramCard';
import { spacing } from '@/constants/theme';
import type { Program } from '@/lib/types';

interface CatalogProgramListProps {
  programs: readonly Program[];
}

export function CatalogProgramList({ programs }: CatalogProgramListProps) {
  if (programs.length === 0) return null;

  return (
    <View style={styles.list}>
      {programs.map((program) => (
        <View key={program.id} style={styles.cardSlot}>
          <ProgramCard program={program} fillHeight />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    width: '100%',
    gap: spacing.xs,
    minHeight: 0,
  },
  cardSlot: {
    flex: 1,
    minHeight: 92,
    minWidth: 0,
  },
});
