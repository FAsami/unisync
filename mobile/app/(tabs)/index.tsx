import React, { useState, useMemo, useEffect } from 'react'
import {
  View,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Dimensions,
} from 'react-native'
import {
  Text,
  ActivityIndicator,
  useTheme,
  Surface,
  Avatar,
} from 'react-native-paper'
import { useQuery } from '@apollo/client'
import {
  GET_EVENT_ROUTINES,
  GetEventRoutinesData,
  EventRoutine,
} from '@/lib/graphql-operations'
import { SafeAreaView } from 'react-native-safe-area-context'
import { format, getDay } from 'date-fns'

const screenWidth = Dimensions.get('window').width

const ClassCard = ({
  item,
  title,
  backgroundColor,
  accentColor,
}: {
  item: EventRoutine
  title: string
  backgroundColor: string
  accentColor: string
}) => {
  const formattedStartTime = item.start_time
    ? item.start_time.substring(0, 5)
    : 'N/A'
  const formattedEndTime = item.end_time ? item.end_time.substring(0, 5) : 'N/A'

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.cardHeaderRow}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {title}
        </Text>
      </View>

      <View style={[styles.cardContainer, { backgroundColor }]}>
        <View style={styles.cardContent}>
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <Text
                variant="titleMedium"
                style={[styles.cardText]}
                numberOfLines={2}
              >
                {item.name}
              </Text>

              <View style={styles.metaRow}>
                <View style={styles.eventTypePill}>
                  <Text
                    variant="labelSmall"
                    style={{
                      color: backgroundColor,
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.event_type}
                  </Text>
                </View>

                {item.course_offering?.section && (
                  <View style={styles.batchPill}>
                    <Text
                      variant="labelSmall"
                      style={{ color: backgroundColor, fontWeight: 'bold' }}
                    >
                      {item.course_offering.section.batch?.name
                        ? `Batch ${item.course_offering.section.batch.name} • `
                        : ''}
                      Section {item.course_offering.section.name}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            {/* <View
              style={[styles.iconPlaceholder, { backgroundColor: accentColor }]}
            >
              <Text
                style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}
              >
                {item.name.charAt(0)}
              </Text>
            </View> */}
          </View>

          <View style={styles.timeContainer}>
            <Text
              variant="bodyLarge"
              style={[styles.cardText, { fontWeight: 'bold' }]}
            >
              {formattedStartTime} - {formattedEndTime}
            </Text>
          </View>

          {item.course_offering?.course && (
            <Text
              variant="bodySmall"
              style={[styles.cardText, { opacity: 0.7, marginTop: 4 }]}
            >
              {item.course_offering.course.code} •{' '}
              {item.course_offering.course.name}
            </Text>
          )}
        </View>
      </View>
    </View>
  )
}

const HomeScreen = () => {
  const theme = useTheme()
  const { loading, error, data, refetch } =
    useQuery<GetEventRoutinesData>(GET_EVENT_ROUTINES)
  const [now, setNow] = useState(new Date())

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const { currentClass, nextClass, allClassesToday } = useMemo(() => {
    if (!data?.event_routine)
      return { currentClass: null, nextClass: null, allClassesToday: [] }

    const currentDayOfWeek = getDay(now) // 0 for Sunday, 1 for Monday, etc.
    const currentTimeStr = format(now, 'HH:mm:ss')

    const todaysRoutines = data.event_routine
      .filter((r) => r.day_of_week === currentDayOfWeek)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))

    let current = null
    let next = null

    for (const routine of todaysRoutines) {
      if (
        routine.start_time <= currentTimeStr &&
        routine.end_time >= currentTimeStr
      ) {
        current = routine
      } else if (routine.start_time > currentTimeStr) {
        if (!next) next = routine
      }
    }

    return {
      currentClass: current,
      nextClass: next,
      allClassesToday: todaysRoutines,
    }
  }, [data, now])

  if (loading && !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: theme.colors.error }}>
          Error loading routines: {error.message}
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
      >
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.greeting}>
            Today
          </Text>
          <Text
            variant="titleMedium"
            style={{ color: theme.colors.secondary, marginTop: 4 }}
          >
            {format(now, 'EEEE, MMMM do')}
          </Text>
        </View>

        {currentClass ? (
          <ClassCard
            item={currentClass}
            title="Current Class"
            backgroundColor="#2563EB" // A nice vibrant blue
            accentColor="#60A5FA"
          />
        ) : null}

        {nextClass ? (
          <ClassCard
            item={nextClass}
            title="Next Class"
            backgroundColor={currentClass ? '#059669' : '#2563EB'} // Green if current exists, otherwise Blue (primary)
            accentColor={currentClass ? '#34D399' : '#60A5FA'}
          />
        ) : (
          !currentClass && (
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIcon,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <Text style={{ fontSize: 40 }}>☕️</Text>
              </View>
              <Text
                variant="titleMedium"
                style={{ marginTop: 16, fontWeight: 'bold' }}
              >
                No classes right now
              </Text>
              <Text
                variant="bodyMedium"
                style={{ color: 'gray', textAlign: 'center', marginTop: 8 }}
              >
                Enjoy your free time! Check back later for upcoming sessions.
              </Text>
            </View>
          )
        )}

        {allClassesToday.length > 0 && (
          <View style={styles.allClassesContainer}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Schedule
            </Text>
            {allClassesToday.map((routine, index) => {
              const isCurrent = currentClass?.id === routine.id
              const isNext = nextClass?.id === routine.id

              return (
                <View key={routine.id} style={styles.simpleRow}>
                  <View style={styles.timeColumn}>
                    <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                      {routine.start_time.substring(0, 5)}
                    </Text>
                    <Text variant="bodySmall" style={{ color: 'gray' }}>
                      {routine.end_time.substring(0, 5)}
                    </Text>
                  </View>
                  <View
                    style={[styles.infoColumn, isCurrent && styles.activeRow]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        variant="bodyLarge"
                        style={{
                          fontWeight: isCurrent ? 'bold' : '500',
                          color: isCurrent
                            ? theme.colors.primary
                            : theme.colors.onSurface,
                        }}
                      >
                        {routine.name}
                      </Text>
                      <Text
                        variant="bodySmall"
                        style={{ color: theme.colors.outline }}
                      >
                        {routine.course_offering?.section?.name} •{' '}
                        {routine.event_type}
                      </Text>
                    </View>
                    {(isCurrent || isNext) && (
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: isCurrent
                              ? theme.colors.primaryContainer
                              : theme.colors.secondaryContainer,
                          },
                        ]}
                      >
                        <Text
                          variant="labelSmall"
                          style={{
                            color: isCurrent
                              ? theme.colors.onPrimaryContainer
                              : theme.colors.onSecondaryContainer,
                          }}
                        >
                          {isCurrent ? 'NOW' : 'NEXT'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontWeight: '800',
  },
  cardWrapper: {
    marginBottom: 24,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  batchPill: {
    backgroundColor: 'white',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
    opacity: 0.95,
  },
  eventTypePill: {
    backgroundColor: 'white',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
    opacity: 0.95,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontWeight: '700',
    opacity: 0.6,
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 1,
  },
  cardText: {
    color: 'white',
  },
  className: {
    fontWeight: '800',
    marginBottom: 4,
    lineHeight: 32,
  },
  timeContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 24,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  allClassesContainer: {
    marginTop: 16,
  },
  simpleRow: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  timeColumn: {
    width: 60,
    marginRight: 16,
    paddingTop: 4,
  },
  infoColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activeRow: {
    // Optional highlight style
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
})

export default HomeScreen
