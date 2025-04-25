import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import theme from '../../styles/theme';
import {Button} from '../common/Button';

interface MemberModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  members: string[];
  selectedMembers: string[];
  onToggleMember: (member: string) => void;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  visible,
  onClose,
  onConfirm,
  members,
  selectedMembers,
  onToggleMember,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>참여자 선택</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.memberList}>
            {members.map((member, index) => (
              <TouchableOpacity
                key={index}
                style={styles.memberItem}
                onPress={() => onToggleMember(member)}>
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
                      : theme.colors.gray[100]
                  }
                />
                <Text style={styles.memberName}>{member}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button
            title="저장"
            onPress={onConfirm}
            containerStyle={styles.confirmButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    fontSize: theme.typography.text.large.fontSize,
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
    fontSize: theme.typography.text.medium.fontSize,
    color: theme.colors.text.primary,
  },
  confirmButton: {
    marginTop: theme.spacing.md,
  },
});
