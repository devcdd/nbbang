import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import theme from '../../styles/theme';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onHide: () => void;
  duration?: number;
  style?: any;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onHide,
  duration = 2000,
  style,
}) => {
  const translateY = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    const showAnimation = Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    });

    const hideAnimation = Animated.timing(translateY, {
      toValue: 100,
      duration: 300,
      useNativeDriver: true,
    });

    showAnimation.start();

    const hideTimeout = setTimeout(() => {
      hideAnimation.start(() => onHide());
    }, duration);

    return () => {
      clearTimeout(hideTimeout);
      showAnimation.stop();
      hideAnimation.stop();
    };
  }, [duration, onHide, translateY]);

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      default:
        return 'check-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.white;
      case 'error':
        return theme.colors.white;
      case 'info':
        return theme.colors.white;
      default:
        return theme.colors.white;
    }
  };

  return (
    <Modal
      visible={true}
      transparent
      animationType="none"
      onRequestClose={onHide}>
      <View style={styles.modalContainer}>
        <Animated.View
          style={[styles.container, {transform: [{translateY}]}, style]}>
          <View style={styles.content}>
            <Icon name={getIconName()} size={20} color={getIconColor()} />
            <Text style={styles.message}>{message}</Text>
          </View>
          <TouchableOpacity onPress={onHide} style={styles.closeButton}>
            <Icon name="close" size={20} color={theme.colors.white} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  message: {
    color: theme.colors.white,
    fontSize: theme.typography.text.medium.fontSize,
    fontWeight: '500',
    flex: 1,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
});
