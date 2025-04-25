import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Settlement} from '../../types';
import theme from '../../styles/theme';
import {formatAmount} from '../../utils/format';

interface SettlementSummaryProps {
  settlements: Settlement[];
  totalAmount: number;
}

export const SettlementSummary: React.FC<SettlementSummaryProps> = ({
  settlements,
  totalAmount,
}) => (
  <View style={styles.summaryContainer}>
    <Text style={styles.summaryTitle}>정산 내역 요약</Text>
    {settlements.map(item => (
      <View key={item.id} style={styles.summaryItem}>
        <Text style={styles.summaryItemTitle}>{item.title}</Text>
        <Text style={styles.summaryItemAmount}>
          {formatAmount(item.amount)}
        </Text>
        <Text style={styles.summaryItemMembers}>
          참여자 ({item.members.length}명): {item.members.join(', ')}
        </Text>
        {item.memberAmounts && Object.keys(item.memberAmounts).length > 0 ? (
          <View style={styles.summaryMemberAmounts}>
            {item.members.map(member => (
              <Text key={member} style={styles.summaryMemberAmount}>
                {member}:{' '}
                {formatAmount(
                  item.memberAmounts?.[member] ||
                    Math.ceil(item.amount / item.members.length),
                )}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.summaryItemPerPerson}>
            1인당: {formatAmount(Math.ceil(item.amount / item.members.length))}
          </Text>
        )}
      </View>
    ))}
    <View style={styles.summaryTotal}>
      <Text style={styles.summaryTotalLabel}>총 금액</Text>
      <Text style={styles.summaryTotalAmount}>{formatAmount(totalAmount)}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  summaryContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  summaryTitle: {
    fontSize: theme.typography.text.xxlarge.fontSize,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  summaryItem: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.sm,
  },
  summaryItemTitle: {
    fontSize: theme.typography.text.large.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  summaryItemAmount: {
    fontSize: theme.typography.text.medium.fontSize,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  summaryItemMembers: {
    fontSize: theme.typography.text.regular.fontSize,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  summaryItemPerPerson: {
    fontSize: theme.typography.text.regular.fontSize,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  summaryTotal: {
    marginTop: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[100],
  },
  summaryTotalLabel: {
    fontSize: theme.typography.text.large.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  summaryTotalAmount: {
    fontSize: theme.typography.text.xxlarge.fontSize,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  summaryMemberAmounts: {
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  summaryMemberAmount: {
    fontSize: theme.typography.text.regular.fontSize,
    color: theme.colors.text.primary,
    marginVertical: 2,
  },
});
