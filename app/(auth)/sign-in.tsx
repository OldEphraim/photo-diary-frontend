import React, { useState } from 'react'
import {
  SafeAreaView,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native'
import { useSignIn } from '@clerk/clerk-expo'
import { useRouter, Link } from 'expo-router'

export default function SignInScreen() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')

  const onSignInPress = async () => {
    if (!isLoaded) return

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('/')
      } else {
        console.log('Sign-in incomplete:', result)
        Alert.alert('Incomplete', 'Further steps may be required.')
      }
    } catch (err: any) {
      console.error('Sign-in error:', JSON.stringify(err, null, 2))
      Alert.alert('Error', err.errors?.[0]?.message || 'Sign-in failed.')
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={64}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Sign In</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            placeholder="Email"
            value={emailAddress}
            onChangeText={setEmailAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.button} onPress={onSignInPress}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
          <View style={styles.footer}>
            <Text>Don't have an account?</Text>
            <Link href="/(auth)/sign-up">
              <Text style={styles.link}>Sign up</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    marginBottom: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'center',
  },
  link: {
    marginLeft: 6,
    color: '#007AFF',
    fontWeight: '500',
  },
})