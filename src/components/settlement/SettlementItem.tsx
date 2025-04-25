import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import theme from '../../styles/theme';
import {Settlement} from '../../types';
import {formatAmount} from '../../utils/format';

interface SettlementItemProps {
  settlement: Settlement;
  onUpdateTitle: (id: string, title: string) => void;
  onSelectMembers: (id: string) => void;
  onUpdateAmount: (id: string, amount: string) => void;
  onDelete: (id: string) => void;
  onFocus: () => void;
  onRandomize: (id: string, memberAmounts: {[key: string]: number}) => void;
}

export const SettlementItem: React.FC<SettlementItemProps> = ({
  settlement,
  onUpdateTitle,
  onSelectMembers,
  onUpdateAmount,
  onDelete,
  onFocus,
  onRandomize,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(settlement.title);
  const inputRef = useRef<TextInput>(null);

  const handleStartEditing = () => {
    setIsEditing(true);
    onFocus();
  };

  const handleAmountFocus = () => {
    onFocus();
  };

  const handleSubmitTitle = () => {
    onUpdateTitle(settlement.id, title);
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert('정산 항목 삭제', `${settlement.title}를 삭제하시겠습니까?`, [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        onPress: () => onDelete(settlement.id),
        style: 'destructive',
      },
    ]);
  };

  const perPersonAmount =
    settlement.members.length > 0
      ? Math.ceil(settlement.amount / settlement.members.length)
      : 0;

  const handleRandomizeAmounts = () => {
    if (settlement.amount === 0 || settlement.members.length === 0) return;

    const totalAmount = settlement.amount;
    const memberCount = settlement.members.length;
    let remainingAmount = totalAmount;
    const newMemberAmounts: {[key: string]: number} = {};

    settlement.members.slice(0, -1).forEach(member => {
      const averagePerPerson =
        remainingAmount / (memberCount - Object.keys(newMemberAmounts).length);
      const minAmount = Math.floor(averagePerPerson * 0.3);
      const maxAmount = Math.floor(averagePerPerson * 1.7);
      const randomAmount =
        Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount;

      newMemberAmounts[member] = randomAmount;
      remainingAmount -= randomAmount;
    });

    const lastMember = settlement.members[settlement.members.length - 1];
    newMemberAmounts[lastMember] = remainingAmount;

    onRandomize(settlement.id, newMemberAmounts);
  };

  const handleResetAmounts = () => {
    onRandomize(settlement.id, {});
  };

  return (
    <View style={styles.settlementItem}>
      <View style={styles.settlementHeader}>
        <TouchableOpacity
          style={styles.titleSection}
          onPress={handleStartEditing}
          activeOpacity={0.7}>
          <View style={styles.titleContainer}>
            {isEditing ? (
              <TextInput
                ref={inputRef}
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                onBlur={handleSubmitTitle}
                onSubmitEditing={handleSubmitTitle}
                autoFocus
                placeholder="제목 입력"
                placeholderTextColor={theme.colors.gray[300]}
              />
            ) : (
              <View style={styles.titleWrapper}>
                <Text style={styles.settlementTitle}>{settlement.title}</Text>
                <Icon
                  name="edit"
                  size={16}
                  color={theme.colors.text.secondary}
                  style={styles.editIcon}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Icon name="delete" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.amountInput}
          placeholder="금액 입력"
          placeholderTextColor={theme.colors.gray[300]}
          keyboardType="numeric"
          value={settlement.amount > 0 ? settlement.amount.toString() : ''}
          onChangeText={text => onUpdateAmount(settlement.id, text)}
          onFocus={handleAmountFocus}
        />
        <TouchableOpacity
          style={styles.memberSelector}
          onPress={() => onSelectMembers(settlement.id)}>
          <Icon name="group" size={20} color={theme.colors.text.secondary} />
          <Text style={styles.memberCount}>
            참여자 {settlement.members.length}명
          </Text>
          <Icon
            name="chevron-right"
            size={20}
            color={theme.colors.text.secondary}
          />
        </TouchableOpacity>
        {settlement.amount > 0 && settlement.members.length > 0 && (
          <>
            <View style={styles.perPersonContainer}>
              <Text style={styles.perPersonLabel}>1인당 금액</Text>
              <Text style={styles.perPersonAmount}>
                {formatAmount(perPersonAmount)}
              </Text>
            </View>
            <View
              style={[
                styles.memberDetailsContainer,
                {marginTop: theme.spacing.xs},
              ]}>
              {settlement.members.map(member => (
                <View key={member} style={styles.memberDetailItem}>
                  <Text style={styles.memberDetailName}>{member}</Text>
                  <Text style={styles.memberDetailAmount}>
                    {formatAmount(
                      settlement.memberAmounts?.[member] || perPersonAmount,
                    )}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
        {settlement.members.length > 0 && (
          <View style={styles.memberNames}>
            <Text style={styles.memberNamesLabel}>참여자: </Text>
            <Text style={styles.memberNamesList}>
              {settlement.members.join(', ')}
            </Text>
            <View style={styles.amountControlButtons}>
              <TouchableOpacity
                onPress={handleRandomizeAmounts}
                style={styles.randomizeButton}>
                <Icon name="casino" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleResetAmounts}
                style={styles.randomizeButton}>
                <Icon
                  name="refresh"
                  size={18}
                  color={theme.colors.text.secondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  settlementItem: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[100],
  },
  settlementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  titleSection: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  titleContainer: {
    flex: 1,
  },
  settlementTitle: {
    fontSize: theme.typography.text.large.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  titleInput: {
    flex: 1,
    fontSize: theme.typography.text.large.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  editIcon: {
    opacity: 0.5,
  },
  inputContainer: {
    gap: theme.spacing.sm,
  },
  amountInput: {
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.text.medium.fontSize,
  },
  memberSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.sm,
  },
  memberCount: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.text.regular.fontSize,
    color: theme.colors.text.secondary,
  },
  perPersonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[50],
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.xs,
  },
  perPersonLabel: {
    fontSize: theme.typography.text.regular.fontSize,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  perPersonAmount: {
    fontSize: theme.typography.text.medium.fontSize,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  memberDetailsContainer: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
  },
  memberDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  memberDetailName: {
    fontSize: theme.typography.text.regular.fontSize,
    color: theme.colors.text.primary,
  },
  memberDetailAmount: {
    fontSize: theme.typography.text.regular.fontSize,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  memberNames: {
    flexDirection: 'row',
    marginTop: theme.spacing.xs,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  memberNamesLabel: {
    fontSize: theme.typography.text.regular.fontSize,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.xs,
  },
  memberNamesList: {
    flex: 1,
    fontSize: theme.typography.text.regular.fontSize,
    color: theme.colors.text.primary,
  },
  deleteButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  amountControlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  randomizeButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
});
