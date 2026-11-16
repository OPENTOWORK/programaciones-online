import { HorizontalPager } from '@/components/program/HorizontalPager';
import { ProgramCard } from '@/components/program/ProgramCard';
import type { Program } from '@/lib/types';

interface CatalogProgramListProps {
  programs: readonly Program[];
}

export function CatalogProgramList({ programs }: CatalogProgramListProps) {
  return (
    <HorizontalPager
      items={programs}
      label={(program) => program.name}
      renderPage={(program) => <ProgramCard program={program} layout="page" />}
    />
  );
}
