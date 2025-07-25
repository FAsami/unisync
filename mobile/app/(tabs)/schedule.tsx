import { StyleSheet, ScrollView, View } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { AppColors } from '@/constants/Colors'

export default function ScheduleScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Schedule
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Your daily and weekly class timetable
          </ThemedText>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              📅 Today's Classes
            </ThemedText>
            <ThemedText style={styles.cardContent}>
              • 9:00 AM - Mathematics (Room 101)
            </ThemedText>
            <ThemedText style={styles.cardContent}>
              • 11:00 AM - Physics (Lab 203)
            </ThemedText>
            <ThemedText style={styles.cardContent}>
              • 2:00 PM - Computer Science (Room 305)
            </ThemedText>
          </View>

          <View style={styles.card}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              📊 Weekly Overview
            </ThemedText>
            <ThemedText style={styles.cardContent}>
              Monday: 4 classes scheduled
            </ThemedText>
            <ThemedText style={styles.cardContent}>
              Tuesday: 3 classes scheduled
            </ThemedText>
            <ThemedText style={styles.cardContent}>
              Wednesday: 5 classes scheduled
            </ThemedText>
          </View>

          <View style={styles.card}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              🕐 Next Class
            </ThemedText>
            <ThemedText style={styles.cardContent}>
              Mathematics - Room 101
            </ThemedText>
            <ThemedText style={styles.cardContent}>
              Starts in 45 minutes
            </ThemedText>
            <ThemedText style={styles.cardContent}>Prof. Dr. Smith</ThemedText>
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
    marginBottom: 12,
    color: AppColors.primary,
  },
  cardContent: {
    marginBottom: 8,
    fontSize: 14,
  },
})
