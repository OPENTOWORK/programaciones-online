import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { crmViewStyles } from '@/components/crm/crmViewStyles';
import { GymMemberCrmCard } from '@/components/gym/GymMemberCrmCard';
import { AppIcon } from '@/components/ui/AppIcon';
import { borderRadius, colors, typography } from '@/constants/theme';
import {
  GYM_MEMBER_PIPELINE_STAGES,
  gymMemberCrmColumn,
  gymMemberFullName,
  type GymMember,
  type GymMemberPipelineStage,
} from '@/lib/gymTypes';

function stageLabel(stageKey: GymMemberPipelineStage) {
  return GYM_MEMBER_PIPELINE_STAGES.find((stage) => stage.key === stageKey)?.label ?? stageKey;
}

function GymMemberListRow({
  member,
  stageName,
  canOperate,
  onPress,
  onMovePrev,
  onMoveNext,
  bordered,
}: {
  member: GymMember;
  stageName: string;
  canOperate: boolean;
  onPress: () => void;
  onMovePrev?: () => void;
  onMoveNext?: () => void;
  bordered?: boolean;
}) {
  return (
    <View style={[crmViewStyles.listRow, bordered && crmViewStyles.listRowBorder]}>
      <View style={crmViewStyles.stagePill}>
        <Text style={crmViewStyles.stagePillText} numberOfLines={1}>
          {stageName}
        </Text>
      </View>
      <Pressable onPress={onPress} style={crmViewStyles.listRowCopy}>
        <Text style={crmViewStyles.listRowTitle} numberOfLines={1}>
          {gymMemberFullName(member)}
        </Text>
        <Text style={crmViewStyles.listRowMeta} numberOfLines={1}>
          {member.email ?? member.phone ?? 'Sin contacto'}
        </Text>
      </Pressable>
      {canOperate ? (
        <View style={styles.listActions}>
          <Pressable onPress={onMovePrev} disabled={!onMovePrev} style={crmViewStyles.iconBtn}>
            <AppIcon name="chevronLeft" size={16} color={onMovePrev ? colors.textSecondary : colors.textMuted} />
          </Pressable>
          <Pressable onPress={onMoveNext} disabled={!onMoveNext} style={crmViewStyles.iconBtn}>
            <AppIcon name="chevronRight" size={16} color={onMoveNext ? colors.textSecondary : colors.textMuted} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export function GymMemberCrmListView({
  members,
  canOperate,
  onOpenMember,
  onMoveMember,
}: {
  members: GymMember[];
  canOperate: boolean;
  onOpenMember: (memberId: string) => void;
  onMoveMember: (member: GymMember, direction: -1 | 1) => void;
}) {
  const grouped = GYM_MEMBER_PIPELINE_STAGES.map((stage) => ({
    stage,
    members: members.filter((member) => gymMemberCrmColumn(member) === stage.key),
  }));

  return (
    <ScrollView style={crmViewStyles.scroll} contentContainerStyle={crmViewStyles.scrollContent}>
      {grouped.map(({ stage, members: stageMembers }) => {
        const stageIndex = GYM_MEMBER_PIPELINE_STAGES.findIndex((entry) => entry.key === stage.key);

        return (
          <View key={stage.key} style={crmViewStyles.section}>
            <View style={crmViewStyles.sectionHead}>
              <Text style={crmViewStyles.sectionTitle}>{stage.label}</Text>
              <Text style={crmViewStyles.sectionCount}>{stageMembers.length}</Text>
            </View>

            {stageMembers.length === 0 ? (
              <Text style={crmViewStyles.sectionEmpty}>Nadie en esta fase</Text>
            ) : (
              <View style={crmViewStyles.list}>
                {stageMembers.map((member, index) => (
                  <GymMemberListRow
                    key={member.id}
                    member={member}
                    stageName={stage.label}
                    canOperate={canOperate}
                    onPress={() => onOpenMember(member.id)}
                    onMovePrev={
                      canOperate && stageIndex > 0
                        ? () => onMoveMember(member, -1)
                        : undefined
                    }
                    onMoveNext={
                      canOperate && stageIndex < GYM_MEMBER_PIPELINE_STAGES.length - 1
                        ? () => onMoveMember(member, 1)
                        : undefined
                    }
                    bordered={index > 0}
                  />
                ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

export function GymMemberCrmGridView({
  members,
  canOperate,
  onOpenMember,
  onMoveMember,
}: {
  members: GymMember[];
  canOperate: boolean;
  onOpenMember: (memberId: string) => void;
  onMoveMember: (member: GymMember, direction: -1 | 1) => void;
}) {
  return (
    <ScrollView style={crmViewStyles.scroll} contentContainerStyle={crmViewStyles.scrollContent}>
      <View style={crmViewStyles.grid}>
        {members.map((member) => {
          const stageKey = gymMemberCrmColumn(member);
          const stageIndex = GYM_MEMBER_PIPELINE_STAGES.findIndex((stage) => stage.key === stageKey);

          return (
            <View key={member.id} style={crmViewStyles.gridItem}>
              <View style={[crmViewStyles.stagePill, crmViewStyles.gridStage]}>
                <Text style={crmViewStyles.stagePillText} numberOfLines={1}>
                  {stageLabel(stageKey)}
                </Text>
              </View>
              <GymMemberCrmCard
                member={member}
                canOperate={canOperate}
                canMovePrev={canOperate && stageIndex > 0}
                canMoveNext={canOperate && stageIndex < GYM_MEMBER_PIPELINE_STAGES.length - 1}
                onPress={() => onOpenMember(member.id)}
                onMovePrev={() => onMoveMember(member, -1)}
                onMoveNext={() => onMoveMember(member, 1)}
              />
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  listActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
