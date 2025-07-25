import React from 'react'
import { View, StyleSheet } from 'react-native'
import {
  Button,
  Card,
  Title,
  Paragraph,
  FAB,
  Chip,
  Surface,
  IconButton,
  Text,
  Divider,
} from 'react-native-paper'
import { AppColors } from '@/constants/Colors'

export const PaperComponentsDemo = () => {
  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <Title>React Native Paper Components</Title>
        <Paragraph>These components use our UniSync theme</Paragraph>

        <Divider style={styles.divider} />

        <View style={styles.buttonRow}>
          <Button mode="contained" onPress={() => {}}>
            Primary Button
          </Button>
          <Button mode="outlined" onPress={() => {}}>
            Outlined Button
          </Button>
        </View>

        <View style={styles.chipRow}>
          <Chip icon="information">Info Chip</Chip>
          <Chip mode="outlined">Outlined Chip</Chip>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Card Title</Title>
            <Paragraph>This is a Material Design card</Paragraph>
          </Card.Content>
        </Card>

        <IconButton icon="heart" mode="contained" onPress={() => {}} />
      </Surface>

      <FAB icon="plus" style={styles.fab} onPress={() => {}} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  surface: {
    padding: 20,
    borderRadius: 8,
    elevation: 2,
  },
  divider: {
    marginVertical: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  card: {
    marginVertical: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: AppColors.primary,
  },
})
