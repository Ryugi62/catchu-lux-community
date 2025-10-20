import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import { colors, spacing } from '../../theme';

interface Props {
  children: ReactNode;
  scrollable?: boolean;
  backgroundColor?: string;
}

export const Screen: React.FC<Props> = ({
  children,
  scrollable = true,
  backgroundColor = colors.backgroundPrimary,
}) => (
  <SafeAreaView style={[styles.safeArea, { backgroundColor }]}> 
    {scrollable ? (
      <ScrollView style={[styles.container, { backgroundColor }]} contentContainerStyle={styles.contentContainer}>
        {children}
      </ScrollView>
    ) : (
      <View style={[styles.container, styles.contentContainer, { backgroundColor }]}>{children}</View>
    )}
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing(5),
    gap: spacing(6),
  },
});
