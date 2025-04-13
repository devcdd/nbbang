import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import theme from '../styles/theme';
import {Settlement} from '../types';
import {useMemberStore} from '../store/memberStore';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';

interface SettlementItemProps {
  settlement: Settlement;
  onUpdateTitle: (id: string, title: string) => void;
  onSelectMembers: (id: string) => void;
  onUpdateAmount: (id: string, amount: string) => void;
  onDelete: (id: string) => void;
}

const formatAmount = (amount: number): string => {
  return amount.toLocaleString('ko-KR') + '원';
};

const SettlementItem: React.FC<SettlementItemProps> = ({
  settlement,
  onUpdateTitle,
  onSelectMembers,
  onUpdateAmount,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(settlement.title);
  const inputRef = useRef<TextInput>(null);

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

  return (
    <View style={styles.settlementItem}>
      <View style={styles.settlementHeader}>
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
            />
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={styles.settlementTitle}>{settlement.title}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Icon
              name={isEditing ? 'check' : 'edit'}
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Icon name="delete" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.amountInput}
          placeholder="금액 입력"
          keyboardType="numeric"
          value={settlement.amount > 0 ? settlement.amount.toString() : ''}
          onChangeText={text => onUpdateAmount(settlement.id, text)}
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
          <View style={styles.perPersonContainer}>
            <Text style={styles.perPersonLabel}>1인당 금액</Text>
            <Text style={styles.perPersonAmount}>
              {formatAmount(perPersonAmount)}
            </Text>
          </View>
        )}
        {settlement.members.length > 0 && (
          <View style={styles.memberNames}>
            <Text style={styles.memberNamesLabel}>참여자: </Text>
            <Text style={styles.memberNamesList}>
              {settlement.members.join(', ')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

interface SettlementSummaryProps {
  settlements: Settlement[];
  totalAmount: number;
}

const SettlementSummary: React.FC<SettlementSummaryProps> = ({
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
        <Text style={styles.summaryItemPerPerson}>
          1인당: {formatAmount(Math.ceil(item.amount / item.members.length))}
        </Text>
      </View>
    ))}
    <View style={styles.summaryTotal}>
      <Text style={styles.summaryTotalLabel}>총 금액</Text>
      <Text style={styles.summaryTotalAmount}>{formatAmount(totalAmount)}</Text>
    </View>
  </View>
);

export const SettlementScreen = () => {
  const members = useMemberStore(state => state.members);
  const [settlements, setSettlements] = useState<Settlement[]>([
    {
      id: '1',
      title: '1차',
      members: members,
      amount: 0,
    },
    {
      id: '2',
      title: '2차',
      members: members,
      amount: 0,
    },
  ]);

  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [currentSettlementId, setCurrentSettlementId] = useState<string>('');
  const viewShotRef = useRef<ViewShot | null>(null);

  React.useEffect(() => {
    setSettlements(prev =>
      prev.map(item => ({
        ...item,
        members: members,
      })),
    );
  }, [members]);

  const totalAmount = settlements.reduce((sum, item) => sum + item.amount, 0);

  const handleUpdateTitle = (id: string, newTitle: string) => {
    setSettlements(prev =>
      prev.map(item =>
        item.id === id ? {...item, title: newTitle.trim() || item.title} : item,
      ),
    );
  };

  const handleUpdateAmount = (id: string, amount: string) => {
    const numericAmount = parseInt(amount.replace(/[^0-9]/g, '') || '0', 10);
    setSettlements(prev =>
      prev.map(item =>
        item.id === id ? {...item, amount: numericAmount} : item,
      ),
    );
  };

  const handleSelectMembers = (id: string) => {
    const settlement = settlements.find(item => item.id === id);
    if (settlement) {
      setSelectedMembers(settlement.members);
      setCurrentSettlementId(id);
      setShowMemberModal(true);
    }
  };

  const handleAddSettlement = () => {
    const newId = (settlements.length + 1).toString();
    setSettlements(prev => [
      ...prev,
      {
        id: newId,
        title: `${newId}차`,
        members: members,
        amount: 0,
      },
    ]);
  };

  const handleConfirmMembers = () => {
    setSettlements(prev =>
      prev.map(item =>
        item.id === currentSettlementId
          ? {...item, members: selectedMembers}
          : item,
      ),
    );
    setShowMemberModal(false);
  };

  const handleDeleteSettlement = (id: string) => {
    setSettlements(prev => prev.filter(item => item.id !== id));
  };

  const handleShare = async () => {
    try {
      const viewShot = viewShotRef.current;
      if (!viewShot?.capture) return;

      const uri = await viewShot.capture();

      const shareOptions = {
        title: '정산 내역 공유',
        message: '정산 내역을 공유합니다.',
        url: Platform.OS === 'ios' ? `file://${uri}` : uri,
        type: 'image/png',
      };

      await Share.open(shareOptions);
    } catch (error) {
      console.error('공유 실패:', error);
      Alert.alert('오류', '정산 내역 공유에 실패했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['rgba(245, 201, 27, 0.1)', 'rgba(245, 201, 27, 0)']}
        style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>정산 금액 입력</Text>
            <Text style={styles.subtitle}>각 차수별 금액을 입력하세요</Text>
          </View>

          <ScrollView style={styles.settlementList}>
            {settlements.map(item => (
              <SettlementItem
                key={item.id}
                settlement={item}
                onUpdateTitle={handleUpdateTitle}
                onSelectMembers={handleSelectMembers}
                onUpdateAmount={handleUpdateAmount}
                onDelete={handleDeleteSettlement}
              />
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddSettlement}>
            <Text style={styles.addButtonText}>+ 차수 추가하기</Text>
          </TouchableOpacity>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>총 금액</Text>
            <Text style={styles.totalAmount}>{formatAmount(totalAmount)}</Text>
          </View>

          <Modal
            visible={showMemberModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowMemberModal(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>참여자 선택</Text>
                  <TouchableOpacity onPress={() => setShowMemberModal(false)}>
                    <Icon
                      name="close"
                      size={24}
                      color={theme.colors.text.primary}
                    />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.memberList}>
                  {members.map((member, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.memberItem}
                      onPress={() => {
                        if (selectedMembers.includes(member)) {
                          setSelectedMembers(prev =>
                            prev.filter(item => item !== member),
                          );
                        } else {
                          setSelectedMembers(prev => [...prev, member]);
                        }
                      }}>
                      <Icon
                        name={
                          selectedMembers.includes(member)
                            ? 'check-circle'
                            : 'radio-button-unchecked'
                        }
                        size={24}
                        color={
                          selectedMembers.includes(member)
                            ? theme.colors.primary
                            : '#E0E0E0'
                        }
                      />
                      <Text style={styles.memberName}>{member}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirmMembers}>
                  <Text style={styles.confirmButtonText}>저장</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <ViewShot
            ref={viewShotRef}
            options={{
              format: 'png',
              quality: 1.0,
            }}
            style={styles.hidden}>
            <View style={styles.captureContainer}>
              <SettlementSummary
                settlements={settlements}
                totalAmount={totalAmount}
              />
            </View>
          </ViewShot>

          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                backgroundColor:
                  totalAmount > 0 ? theme.colors.primary : '#E0E0E0',
              },
            ]}
            disabled={totalAmount === 0}
            onPress={handleShare}>
            <Text
              style={[
                styles.nextButtonText,
                {color: totalAmount > 0 ? theme.colors.white : '#666666'},
              ]}>
              공유하기
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    ...theme.typography.title,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.subtitle,
  },
  settlementList: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  settlementItem: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  settlementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  settlementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    padding: 0,
  },
  inputContainer: {
    gap: theme.spacing.sm,
  },
  amountInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: 16,
  },
  memberSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: '#F5F5F5',
    borderRadius: theme.borderRadius.sm,
  },
  memberCount: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  addButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  addButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginVertical: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  nextButton: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  memberList: {
    marginBottom: theme.spacing.lg,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  memberName: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  perPersonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 201, 27, 0.1)',
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.xs,
  },
  perPersonLabel: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  perPersonAmount: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  memberNames: {
    flexDirection: 'row',
    marginTop: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  memberNamesLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.xs,
  },
  memberNamesList: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  deleteButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  hidden: {
    position: 'absolute',
    left: -9999,
    backgroundColor: theme.colors.white,
  },
  captureContainer: {
    width: 400,
    minHeight: 200,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
  },
  summaryContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  summaryItem: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: '#F5F5F5',
    borderRadius: theme.borderRadius.sm,
  },
  summaryItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  summaryItemAmount: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  summaryItemMembers: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  summaryItemPerPerson: {
    fontSize: 14,
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
    borderTopColor: '#E0E0E0',
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  summaryTotalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});

export default SettlementScreen;
