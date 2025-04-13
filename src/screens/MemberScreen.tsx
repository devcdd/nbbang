import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';
import theme from '../styles/theme';
import {useMemberStore} from '../store/memberStore';

type MemberScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Member'>;
};

export const MemberScreen = ({navigation}: MemberScreenProps) => {
  const members = useMemberStore(state => state.members);
  const addMember = useMemberStore(state => state.addMember);
  const removeMember = useMemberStore(state => state.removeMember);
  const [newMember, setNewMember] = useState('');

  const handleAddMember = () => {
    if (newMember.trim()) {
      addMember(newMember.trim());
      setNewMember('');
    }
  };

  const handleRemoveMember = (member: string) => {
    removeMember(member);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['rgba(245, 201, 27, 0.1)', 'rgba(245, 201, 27, 0)']}
        style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>구성원 입력하기 👥</Text>
            <Text style={styles.subtitle}>
              정산에 참여할 구성원을 입력하세요
            </Text>
          </View>

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
              />
              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleAddMember}>
                <Text style={styles.buttonText}>추가</Text>
              </TouchableOpacity>
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
                    <Icon name="close" size={20} color="#666666" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {members.length < 2 && (
            <View style={styles.warningContainer}>
              <Icon name="info" size={20} color="#F5C91B" />
              <Text style={styles.warningText}>
                최소 2명 이상의 구성원이 필요합니다
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                backgroundColor:
                  members.length >= 2 ? theme.colors.primary : '#E0E0E0',
              },
            ]}
            disabled={members.length < 2}
            onPress={() => navigation.navigate('Settlement')}>
            <Text
              style={[
                styles.nextButtonText,
                {color: members.length >= 2 ? theme.colors.white : '#666666'},
              ]}>
              다음
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
    padding: theme.spacing.lg,
  },
  header: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.title,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.subtitle,
  },
  inputContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: 16,
  },
  button: {
    paddingHorizontal: theme.spacing.lg,
    height: 44,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  memberList: {
    marginTop: theme.spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  memberItem: {
    marginBottom: theme.spacing.sm,
  },
  memberTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.sm,
  },
  memberName: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  removeButton: {
    padding: 2,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 201, 27, 0.1)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  warningText: {
    color: theme.colors.text.primary,
    fontSize: 14,
  },
  nextButton: {
    marginTop: 'auto',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MemberScreen;
