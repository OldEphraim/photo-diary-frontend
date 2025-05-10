import { View, StyleSheet } from 'react-native'
import CameraCapture from '../../components/CameraCapture'

export default function DiaryEntryScreen() {
  return (
    <View style={styles.container}>
      <CameraCapture />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
})
