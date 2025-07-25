import { StyleSheet, ScrollView, View } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { AppColors } from '@/constants/Colors'

export default function AccountScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Account
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Profile and app settings
          </ThemedText>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              👤 Profile Information
            </ThemedText>
            <View style={styles.profileItem}>
              <ThemedText style={styles.profileLabel}>Name:</ThemedText>
              <ThemedText style={styles.profileValue}>John Doe</ThemedText>
            </View>
            <View style={styles.profileItem}>
              <ThemedText style={styles.profileLabel}>Student ID:</ThemedText>
              <ThemedText style={styles.profileValue}>2024-CS-001</ThemedText>
            </View>
            <View style={styles.profileItem}>
              <ThemedText style={styles.profileLabel}>Department:</ThemedText>
              <ThemedText style={styles.profileValue}>
                Computer Science
              </ThemedText>
            </View>
            <View style={styles.profileItem}>
              <ThemedText style={styles.profileLabel}>Batch:</ThemedText>
              <ThemedText style={styles.profileValue}>2024-2025</ThemedText>
            </View>
          </View>

          <View style={styles.card}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              📧 Contact Information
            </ThemedText>
            <View style={styles.profileItem}>
              <ThemedText style={styles.profileLabel}>Email:</ThemedText>
              <ThemedText style={styles.profileValue}>
                john.doe@university.edu
              </ThemedText>
            </View>
            <View style={styles.profileItem}>
              <ThemedText style={styles.profileLabel}>Phone:</ThemedText>
              <ThemedText style={styles.profileValue}>
                +1 234 567 8900
              </ThemedText>
            </View>
          </View>

          <View style={styles.card}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              ⚙️ App Settings
            </ThemedText>
            <ThemedText style={styles.settingItem}>• Notifications</ThemedText>
            <ThemedText style={styles.settingItem}>• Dark Mode</ThemedText>
            <ThemedText style={styles.settingItem}>• Language</ThemedText>
            <ThemedText style={styles.settingItem}>• Privacy</ThemedText>
            <ThemedText style={styles.settingItem}>• About</ThemedText>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  content: {
    gap: 16,
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 16,
    color: AppColors.primary,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.divider,
    marginBottom: 8,
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: AppColors.textSecondary,
  },
  profileValue: {
    fontSize: 14,
    fontWeight: '400',
  },
  settingItem: {
    fontSize: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.divider,
    marginBottom: 4,
  },
})
