import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';
import theme from '../styles/theme';
import {useMemberStore} from '../store/memberStore';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Header} from '../components/common/Header';
import {Button} from '../components/common/Button';
import {useToast} from '../contexts/ToastContext';

type MemberScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Member'>;
};

export const MemberScreen = ({navigation}: MemberScreenProps) => {
  const members = useMemberStore(state => state.members);
  const addMember = useMemberStore(state => state.addMember);
  const removeMember = useMemberStore(state => state.removeMember);
  const [newMember, setNewMember] = useState('');
  const {showToast} = useToast();

  const handleAddMember = () => {
    const trimmedMember = newMember.trim();
    if (!trimmedMember) {
      return;
    }

    if (members.includes(trimmedMember)) {
      showToast('이미 존재하는 참여자입니다.', 'error');
      return;
    }

    addMember(trimmedMember);
    setNewMember('');
    showToast('참여자가 추가되었습니다.', 'success');
  };

  const handleRemoveMember = (member: string) => {
    Alert.alert('참여자 삭제', `${member}님을 삭제하시겠습니까?`, [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '삭제',
        onPress: () => {
          removeMember(member);
          showToast('참여자가 삭제되었습니다.', 'info');
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Header
          title="구성원 입력하기"
          subtitle="정산에 참여할 구성원을 입력하세요"
          icon={{
            name: 'group',
            color: theme.colors.primary,
            backgroundColor: 'rgba(245, 201, 27, 0.1)',
          }}
        />

        <View style={styles.inputContainer}>
          <Text style={styles.sectionTitle}>구성원 목록 👥</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="이름 입력"
              value={newMember}
              onChangeText={setNewMember}
              onSubmitEditing={handleAddMember}
              returnKeyType="done"
              placeholderTextColor={theme.colors.gray[300]}
            />
            <Button
              title="추가"
              onPress={handleAddMember}
              containerStyle={styles.addButton}
            />
          </View>
        </View>

        <View style={styles.memberList}>
          {members.map((member, index) => (
            <View key={index} style={styles.memberItem}>
              <View style={styles.memberTag}>
                <Text style={styles.memberName}>{member}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveMember(member)}
                  style={styles.removeButton}>
                  <Icon name="close" size={16} color="rgba(0, 0, 0, 0.4)" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {members.length < 2 && (
          <View style={styles.warningContainer}>
            <Icon name="info" size={20} color={theme.colors.primary} />
            <Text style={styles.warningText}>
              최소 2명 이상의 구성원이 필요합니다
            </Text>
          </View>
        )}

        <Button
          title="다음"
          size="large"
          onPress={() => navigation.navigate('Settlement')}
          disabled={members.length < 2}
          containerStyle={styles.nextButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  content: {
    flex: 1,
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  inputContainer: {
    backgroundColor: 'rgba(245, 201, 27, 0.08)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.text.medium.fontSize,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: 'rgba(0, 0, 0, 0.9)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.text.medium.fontSize,
    color: 'rgba(0, 0, 0, 0.7)',
  },
  addButton: {
    height: 44,
    paddingHorizontal: theme.spacing.lg,
  },
  memberList: {
    marginTop: theme.spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  memberItem: {
    flexShrink: 0,
  },
  memberTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 201, 27, 0.3)',
  },
  memberName: {
    fontSize: theme.typography.text.regular.fontSize,
    color: 'rgba(0, 0, 0, 0.7)',
    fontWeight: '500',
  },
  removeButton: {
    padding: 2,
    marginLeft: theme.spacing.xs,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 201, 27, 0.08)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  warningText: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: theme.typography.text.regular.fontSize,
  },
  nextButton: {
    marginTop: 'auto',
    marginBottom: theme.spacing.lg,
  },
});

export default MemberScreen;
