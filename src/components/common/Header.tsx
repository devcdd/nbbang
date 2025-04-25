import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import theme from '../../styles/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  icon?: {
    name: string;
    color?: string;
    backgroundColor?: string;
  };
}

export const Header: React.FC<HeaderProps> = ({title, subtitle, icon}) => {
  return (
    <View style={styles.header}>
      {icon && (
        <View
          style={[
            styles.iconContainer,
            icon.backgroundColor && {backgroundColor: icon.backgroundColor},
          ]}>
          <Icon name={icon.name} size={24} color={icon.color} />
        </View>
      )}
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  iconContainer: {
    padding: theme.spacing.sm,
    borderRadius: 999,
  },
  title: {
    fontSize: theme.typography.title.fontSize,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.text.regular.fontSize,
    color: theme.colors.text.secondary,
  },
});
