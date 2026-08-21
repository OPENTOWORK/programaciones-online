import type { SessionTemplate } from '@/lib/sessionTemplateService';
import {
  isSessionTemplateFormatTag,
  isSessionTemplateTag,
  UNTAGGED_FORMAT_LABEL,
  UNTAGGED_TEMPLATE_LABEL,
  type SessionTemplateFormatTag,
  type SessionTemplateTag,
} from '@/lib/sessionTemplateTags';

export type TemplateGroupViewMode = 'zone' | 'format';

export function templateGroupKey(template: SessionTemplate, groupMode: TemplateGroupViewMode) {
  if (groupMode === 'format') {
    return template.formatTag ?? UNTAGGED_FORMAT_LABEL;
  }
  return template.tag ?? UNTAGGED_TEMPLATE_LABEL;
}

export function resolveTemplateDropTarget(
  groupMode: TemplateGroupViewMode,
  groupLabel: string,
): { tag?: SessionTemplateTag | null; formatTag?: SessionTemplateFormatTag | null } | null {
  if (groupMode === 'format') {
    if (groupLabel === UNTAGGED_FORMAT_LABEL) return { formatTag: null };
    if (isSessionTemplateFormatTag(groupLabel)) return { formatTag: groupLabel };
    return null;
  }

  if (groupLabel === UNTAGGED_TEMPLATE_LABEL) return null;
  if (isSessionTemplateTag(groupLabel)) return { tag: groupLabel };
  return null;
}
