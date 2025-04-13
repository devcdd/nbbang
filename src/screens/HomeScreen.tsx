import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import theme from '../styles/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../App';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const MenuButton = ({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) => (
  <View style={styles.menuItem}>
    <Icon name={icon} size={24} color={theme.colors.primary} />
    <View style={styles.menuTextContainer}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuSubtitle}>{subtitle}</Text>
    </View>
  </View>
);

export const HomeScreen = ({navigation}: HomeScreenProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['rgba(245, 201, 27, 0.1)', 'rgba(245, 201, 27, 0)']}
        style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>엔빵치자</Text>
            <Text style={styles.subtitle}>간편하게 더치페이 정산하기</Text>
          </View>

          <View style={styles.menuContainer}>
            <MenuButton
              icon="group"
              title="구성원 입력"
              subtitle="모임 구성원을 추가해주세요"
            />
            <MenuButton
              icon="attach-money"
              title="금액 입력"
              subtitle="N차 별로 금액을 입력하세요"
            />
            <MenuButton
              icon="calculate"
              title="정산 방식 선택"
              subtitle="N빵, 랜덤, 룰렛 중 선택하세요"
            />
            <MenuButton
              icon="share"
              title="결과 공유"
              subtitle="이미지로 저장하고 공유하세요"
            />
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate('Member')}>
            <Text style={styles.startButtonText}>시작하기</Text>
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
    marginTop: theme.spacing.xl * 2,
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.title,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.subtitle,
  },
  menuContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.xl,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  menuTextContainer: {
    marginLeft: theme.spacing.md,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  menuSubtitle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  startButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },
});

export default HomeScreen;
