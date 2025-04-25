import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS} from '../../constants/colors';
import theme from '../../styles/theme';

interface GradientLayoutProps {
  children: React.ReactNode;
  contentStyle?: ViewStyle;
}

export const GradientLayout: React.FC<GradientLayoutProps> = ({
  children,
  contentStyle,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.YELLOW.GRADIENT_START, COLORS.YELLOW.GRADIENT_END]}
        style={styles.gradient}>
        <View style={[styles.content, contentStyle]}>{children}</View>
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
});
