import type { SessionTemplate } from '@/lib/sessionTemplateService';
import {
  isSessionTemplateFormatTag,
  isSessionTemplateModalityTag,
  isSessionTemplateTag,
  UNTAGGED_FORMAT_LABEL,
  UNTAGGED_MODALITY_LABEL,
  UNTAGGED_TEMPLATE_LABEL,
  type SessionTemplateFormatTag,
  type SessionTemplateModalityTag,
  type SessionTemplateTag,
} from '@/lib/sessionTemplateTags';

export type TemplateGroupViewMode = 'zone' | 'format' | 'modality';

export function templateGroupKey(template: SessionTemplate, groupMode: TemplateGroupViewMode) {
  if (groupMode === 'format') {
    return template.formatTag ?? UNTAGGED_FORMAT_LABEL;
  }
  if (groupMode === 'modality') {
    return template.modalityTag ?? UNTAGGED_MODALITY_LABEL;
  }
  return template.tag ?? UNTAGGED_TEMPLATE_LABEL;
}

export function resolveTemplateDropTarget(
  groupMode: TemplateGroupViewMode,
  groupLabel: string,
): {
  tag?: SessionTemplateTag | null;
  formatTag?: SessionTemplateFormatTag | null;
  modalityTag?: SessionTemplateModalityTag | null;
} | null {
  if (groupMode === 'format') {
    if (groupLabel === UNTAGGED_FORMAT_LABEL) return { formatTag: null };
    if (isSessionTemplateFormatTag(groupLabel)) return { formatTag: groupLabel };
    return null;
  }

  if (groupMode === 'modality') {
    if (groupLabel === UNTAGGED_MODALITY_LABEL) return { modalityTag: null };
    if (isSessionTemplateModalityTag(groupLabel)) return { modalityTag: groupLabel };
    return null;
  }

  if (groupLabel === UNTAGGED_TEMPLATE_LABEL) return null;
  if (isSessionTemplateTag(groupLabel)) return { tag: groupLabel };
  return null;
}
