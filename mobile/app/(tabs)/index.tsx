import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useAuth } from '@/contexts/Auth'
import { ThemedText } from '@/components/ThemedText'
import { AppColors } from '@/constants/Colors'

const HomeScreen = () => {
  const { logout } = useAuth()
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Welcome to UniSync
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Your university synchronization platform
          </ThemedText>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              📅 Today's Overview
            </ThemedText>
            <ThemedText style={styles.cardContent}>
              • Next class: Mathematics at 9:00 AM
            </ThemedText>
            <ThemedText style={styles.cardContent}>
              • 2 assignments due this week
            </ThemedText>
            <ThemedText style={styles.cardContent}>
              • 1 lab report pending
            </ThemedText>
          </View>

          <View style={styles.card}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              🔔 Recent Announcements
            </ThemedText>
            <ThemedText style={styles.cardContent}>
              • Spring semester exam schedule released
            </ThemedText>
            <ThemedText style={styles.cardContent}>
              • Library hours extended for finals
            </ThemedText>
            <ThemedText style={styles.cardContent}>
              • New course registration opens Monday
            </ThemedText>
          </View>

          <View style={styles.card}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              🚀 Quick Actions
            </ThemedText>
            <ThemedText style={styles.cardContent}>
              • View today's schedule
            </ThemedText>
            <ThemedText style={styles.cardContent}>
              • Check pending tasks
            </ThemedText>
            <ThemedText style={styles.cardContent}>
              • Update profile information
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default HomeScreen

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
    marginBottom: 12,
    color: AppColors.primary,
  },
  cardContent: {
    marginBottom: 8,
    fontSize: 14,
  },
  logoutButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: AppColors.primary,
    borderRadius: 20,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
})
