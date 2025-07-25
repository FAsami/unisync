import { StyleSheet, ScrollView, View } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { AppColors } from '@/constants/Colors'

export default function TasksScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Tasks
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Assignments, lab reports, and exams
          </ThemedText>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              📝 Assignments
            </ThemedText>
            <View style={styles.taskItem}>
              <ThemedText style={styles.taskTitle}>
                Mathematics Assignment 3
              </ThemedText>
              <ThemedText style={styles.taskDue}>Due: Tomorrow</ThemedText>
            </View>
            <View style={styles.taskItem}>
              <ThemedText style={styles.taskTitle}>
                Physics Problem Set
              </ThemedText>
              <ThemedText style={styles.taskDue}>Due: Friday</ThemedText>
            </View>
          </View>

          <View style={styles.card}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              🧪 Lab Reports
            </ThemedText>
            <View style={styles.taskItem}>
              <ThemedText style={styles.taskTitle}>
                Chemistry Lab Report
              </ThemedText>
              <ThemedText style={styles.taskDue}>Due: Next Week</ThemedText>
            </View>
            <View style={styles.taskItem}>
              <ThemedText style={styles.taskTitle}>
                Biology Experiment Analysis
              </ThemedText>
              <ThemedText style={styles.taskDue}>Due: Monday</ThemedText>
            </View>
          </View>

          <View style={styles.card}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              📚 Upcoming Exams
            </ThemedText>
            <View style={styles.taskItem}>
              <ThemedText style={styles.taskTitle}>
                Midterm Mathematics
              </ThemedText>
              <ThemedText style={styles.taskDue}>Date: March 15</ThemedText>
            </View>
            <View style={styles.taskItem}>
              <ThemedText style={styles.taskTitle}>Physics Quiz</ThemedText>
              <ThemedText style={styles.taskDue}>Date: March 10</ThemedText>
            </View>
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
  taskItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.divider,
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  taskDue: {
    fontSize: 14,
    color: AppColors.warning,
    fontWeight: '500',
  },
})
