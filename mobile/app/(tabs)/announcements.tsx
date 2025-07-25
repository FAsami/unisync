import { StyleSheet, ScrollView, View } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { AppColors } from '@/constants/Colors'

export default function AnnouncementsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Announcements
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Latest updates and notifications
          </ThemedText>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              🎓 Academic Updates
            </ThemedText>
            <View style={styles.announcementItem}>
              <ThemedText style={styles.announcementTitle}>
                Spring Semester Exam Schedule Released
              </ThemedText>
              <ThemedText style={styles.announcementDate}>
                Posted: 2 hours ago
              </ThemedText>
              <ThemedText style={styles.announcementContent}>
                Final exam schedules for all departments are now available.
                Check your student portal for detailed timings.
              </ThemedText>
            </View>
            <View style={styles.announcementItem}>
              <ThemedText style={styles.announcementTitle}>
                Course Registration Opens Monday
              </ThemedText>
              <ThemedText style={styles.announcementDate}>
                Posted: 1 day ago
              </ThemedText>
              <ThemedText style={styles.announcementContent}>
                Registration for next semester courses will begin Monday at 9:00
                AM.
              </ThemedText>
            </View>
          </View>

          <View style={styles.card}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              📚 Library & Resources
            </ThemedText>
            <View style={styles.announcementItem}>
              <ThemedText style={styles.announcementTitle}>
                Extended Library Hours for Finals
              </ThemedText>
              <ThemedText style={styles.announcementDate}>
                Posted: 3 days ago
              </ThemedText>
              <ThemedText style={styles.announcementContent}>
                Library will remain open 24/7 during the final exam period from
                March 15-30.
              </ThemedText>
            </View>
          </View>

          <View style={styles.card}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              🎉 Campus Events
            </ThemedText>
            <View style={styles.announcementItem}>
              <ThemedText style={styles.announcementTitle}>
                Annual Tech Fest 2024
              </ThemedText>
              <ThemedText style={styles.announcementDate}>
                Posted: 5 days ago
              </ThemedText>
              <ThemedText style={styles.announcementContent}>
                Join us for the biggest tech event of the year! Registration
                deadline: March 20.
              </ThemedText>
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
  announcementItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.divider,
    marginBottom: 12,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  announcementDate: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  announcementContent: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
})
