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
  LayoutChangeEvent,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import theme from '../styles/theme';
import {Settlement} from '../types';
import {useMemberStore} from '../store/memberStore';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import {useToast} from '../contexts/ToastContext';

interface SettlementItemProps {
  settlement: Settlement;
  onUpdateTitle: (id: string, title: string) => void;
  onSelectMembers: (id: string) => void;
  onUpdateAmount: (id: string, amount: string) => void;
  onDelete: (id: string) => void;
  onFocus: () => void;
  onRandomize: (id: string, memberAmounts: {[key: string]: number}) => void;
}

const formatAmount = (amount: number): string => {
  return amount.toLocaleString('ko-KR') + '원';
};

const formatNumberWithCommas = (num: string | number) => {
  const numStr = typeof num === 'string' ? num : num.toString();
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const SettlementItem: React.FC<SettlementItemProps> = ({
  settlement,
  onUpdateTitle,
  onSelectMembers,
  onUpdateAmount,
  onDelete,
  onFocus,
  onRandomize,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAmountEditing, setIsAmountEditing] = useState(false);
  const [title, setTitle] = useState(settlement.title);
  const [amount, setAmount] = useState(
    settlement.amount === 0 ? '' : settlement.amount.toString(),
  );
  const inputRef = useRef<TextInput>(null);
  const amountInputRef = useRef<TextInput>(null);

  const handleStartEditing = () => {
    setIsEditing(true);
    onFocus();
  };

  const handleStartAmountEditing = () => {
    setIsAmountEditing(true);
    if (settlement.amount === 0) {
      setAmount('');
    }
    onFocus();
  };

  const handleAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setAmount(numericValue);
    const parsedAmount = numericValue === '' ? 0 : parseInt(numericValue, 10);
    onUpdateAmount(settlement.id, parsedAmount.toString());
    onRandomize(settlement.id, {});
  };

  const handleAmountSubmit = () => {
    setIsAmountEditing(false);
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
                placeholderTextColor="#999"
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
          <Icon name="delete" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.amountContainer}
          onPress={handleStartAmountEditing}
          activeOpacity={0.7}>
          {isAmountEditing ? (
            <View style={styles.amountInputContainer}>
              <TextInput
                ref={amountInputRef}
                style={styles.amountInput}
                value={amount === '' ? '' : formatNumberWithCommas(amount)}
                onChangeText={handleAmountChange}
                onBlur={handleAmountSubmit}
                onSubmitEditing={handleAmountSubmit}
                keyboardType="numeric"
                autoFocus
                placeholder="금액 입력"
                placeholderTextColor="#999"
              />
              <Text style={styles.amountUnit}>원</Text>
            </View>
          ) : (
            <View style={styles.amountWrapper}>
              <Text style={styles.amountText}>
                {settlement.amount > 0
                  ? `${formatNumberWithCommas(settlement.amount)}원`
                  : '금액 입력'}
              </Text>
              <Icon
                name="edit"
                size={16}
                color="#4CAF50"
                style={styles.editIcon}
              />
            </View>
          )}
        </TouchableOpacity>
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

interface SettlementSummaryProps {
  settlements: Settlement[];
  totalAmount: number;
}

const SettlementSummary: React.FC<SettlementSummaryProps> = ({
  settlements,
  totalAmount,
}) => {
  const members = useMemberStore(state => state.members);

  // 각 멤버별 총액 계산
  const memberTotalAmounts = members.reduce((acc, member) => {
    const total = settlements.reduce((sum, settlement) => {
      if (settlement.members.includes(member)) {
        // 랜덤 분배된 금액이 있으면 그 금액을, 없으면 균등 분배 금액을 사용
        const amount =
          settlement.memberAmounts?.[member] ||
          Math.ceil(settlement.amount / settlement.members.length);
        return sum + amount;
      }
      return sum;
    }, 0);
    return {...acc, [member]: total};
  }, {} as {[key: string]: number});

  return (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>정산 내역 요약</Text>

      <View style={styles.settlementDetails}>
        <Text style={styles.sectionTitle}>상세 내역</Text>
        {settlements.map(item => (
          <View key={item.id} style={styles.settlementDetailItem}>
            <View style={styles.settlementDetailHeader}>
              <Text style={styles.detailTitle}>{item.title}</Text>
              <Text style={styles.detailAmount}>
                {item.amount.toLocaleString()}원
              </Text>
            </View>
            <Text style={styles.detailMembers}>
              참여자: {item.members.join(', ')}
            </Text>
            <View style={styles.detailMemberAmounts}>
              {item.members.map(member => (
                <View key={member} style={styles.detailMemberRow}>
                  <Text style={styles.detailMemberName}>{member}</Text>
                  <Text style={styles.detailMemberAmount}>
                    {(
                      item.memberAmounts?.[member] ||
                      Math.ceil(item.amount / item.members.length)
                    ).toLocaleString()}
                    원
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.summaryContent}>
        <Text style={styles.totalAmountLabel}>총 금액</Text>
        <Text style={styles.totalAmountValue}>
          {totalAmount.toLocaleString()}원
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.memberAmounts}>
        <Text style={styles.memberAmountsTitle}>인원별 정산 금액</Text>
        {members.map(member => (
          <View key={member} style={styles.memberAmountRow}>
            <Text style={styles.memberNameText}>{member}</Text>
            <Text style={styles.memberAmountText}>
              {memberTotalAmounts[member].toLocaleString()}원
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

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
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const itemRefs = useRef<{[key: string]: number}>({});
  const {showToast} = useToast();
  const [isAddSectionCollapsed, setIsAddSectionCollapsed] = useState(false);

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
    showToast('정산 내역이 삭제되었습니다.', 'success');
  };

  const handleShare = async () => {
    try {
      const viewShot = viewShotRef.current;
      if (!viewShot?.capture || !isLayoutReady) {
        Alert.alert('오류', '공유 준비 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 100));

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

  const handleItemFocus = (id: string) => {
    const yOffset = itemRefs.current[id] || 0;
    scrollViewRef.current?.scrollTo({y: yOffset, animated: true});
  };

  const handleItemLayout = (id: string, event: LayoutChangeEvent) => {
    const {y} = event.nativeEvent.layout;
    itemRefs.current[id] = y;
  };

  const handleRandomizeAmounts = (
    id: string,
    memberAmounts: {[key: string]: number},
  ) => {
    setSettlements(prev =>
      prev.map(item => (item.id === id ? {...item, memberAmounts} : item)),
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.white, theme.colors.white]}
        style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Icon
                name="calculate"
                size={24}
                color={theme.colors.primary}
                style={styles.headerIcon}
              />
              <View>
                <Text style={styles.title}>정산 금액 입력</Text>
                <Text style={styles.subtitle}>각 차수별 금액을 입력하세요</Text>
              </View>
            </View>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.settlementList}
            keyboardShouldPersistTaps="handled">
            {settlements.map(item => (
              <View
                key={item.id}
                onLayout={event => handleItemLayout(item.id, event)}>
                <SettlementItem
                  settlement={item}
                  onUpdateTitle={handleUpdateTitle}
                  onSelectMembers={handleSelectMembers}
                  onUpdateAmount={handleUpdateAmount}
                  onDelete={handleDeleteSettlement}
                  onFocus={() => handleItemFocus(item.id)}
                  onRandomize={handleRandomizeAmounts}
                />
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.addButton,
              isAddSectionCollapsed && styles.addButtonCollapsed,
            ]}
            onPress={() => setIsAddSectionCollapsed(!isAddSectionCollapsed)}>
            <View style={styles.addButtonContent}>
              <Text style={styles.addButtonText}>정산 결과보기</Text>
              <Icon
                name={isAddSectionCollapsed ? 'expand-less' : 'expand-more'}
                size={24}
                color={theme.colors.primary}
              />
            </View>
          </TouchableOpacity>

          {!isAddSectionCollapsed && (
            <>
              <TouchableOpacity
                style={styles.addSettlementButton}
                onPress={handleAddSettlement}>
                <Text style={styles.addSettlementButtonText}>
                  + 새로운 차수 추가
                </Text>
              </TouchableOpacity>

              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>총 금액</Text>
                <Text style={styles.totalAmount}>
                  {formatAmount(totalAmount)}
                </Text>
              </View>

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
            </>
          )}

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
              result: 'tmpfile',
            }}
            style={styles.hidden}>
            <View
              style={styles.captureContainer}
              onLayout={() => setIsLayoutReady(true)}>
              <SettlementSummary
                settlements={settlements}
                totalAmount={totalAmount}
              />
            </View>
          </ViewShot>
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
    backgroundColor: theme.colors.white,
  },
  content: {
    flex: 1,
  },
  header: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerIcon: {
    backgroundColor: 'rgba(245, 201, 27, 0.1)',
    padding: theme.spacing.sm,
    borderRadius: 999,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
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
  amountContainer: {
    borderRadius: theme.borderRadius.sm,
    height: 44,
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  amountWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  amountText: {
    flex: 1,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  amountInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    padding: 0,
  },
  amountUnit: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
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
    paddingHorizontal: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: theme.colors.white,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonCollapsed: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  addButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  addSettlementButton: {
    backgroundColor: 'rgba(245, 201, 27, 0.1)',
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: 1,
  },
  addSettlementButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginVertical: theme.spacing.md,
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
    marginBottom: theme.spacing.md,
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
    color: '#4A4A4A',
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
  memberDetailsContainer: {
    backgroundColor: '#F8F8F8',
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
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  memberDetailAmount: {
    fontSize: 14,
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
    width: '100%',
  },
  captureContainer: {
    width: '100%',
    minHeight: 200,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    elevation: 0,
  },
  summaryContainer: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
    width: '100%',
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  settlementDetails: {
    gap: theme.spacing.sm,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: theme.spacing.xs,
  },
  settlementDetailItem: {
    backgroundColor: '#F8F8F8',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.xs,
    width: '100%',
  },
  settlementDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  detailAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  detailMembers: {
    fontSize: 14,
    color: '#666666',
  },
  summaryContent: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  totalAmountLabel: {
    fontSize: 16,
    color: '#666666',
  },
  totalAmountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: theme.spacing.sm,
  },
  memberAmounts: {
    gap: theme.spacing.sm,
  },
  memberAmountsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: theme.spacing.xs,
  },
  memberAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberNameText: {
    fontSize: 16,
    color: '#4A4A4A',
  },
  memberAmountText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  detailMemberAmounts: {
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    gap: theme.spacing.xs,
  },
  detailMemberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailMemberName: {
    fontSize: 14,
    color: '#666666',
  },
  detailMemberAmount: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  amountControlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginLeft: 'auto',
  },
  randomizeButton: {
    padding: theme.spacing.xs,
  },
});

export default SettlementScreen;
