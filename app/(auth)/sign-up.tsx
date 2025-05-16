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
  Platform,
  ScrollView,
} from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { useRouter, Link } from 'expo-router'

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)

  const onSignUpPress = async () => {
    if (!isLoaded) return

    try {
      await signUp.create({
        emailAddress,
        password,
      })

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (err: any) {
      console.error('Sign-up error:', JSON.stringify(err, null, 2))
      Alert.alert('Error', err.errors?.[0]?.message || 'Sign-up failed.')
    }
  }

  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      if (signUp.verifications.emailAddress.status === 'verified') {
        await setActive({ session: signUp.createdSessionId })
        router.replace('/')
        return
      }

      const result = await signUp.attemptEmailAddressVerification({ code })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('/')
      } else {
        console.log('Verification incomplete:', result)
        Alert.alert('Verification incomplete', 'Check your code and try again.')
      }
    } catch (err: any) {
      console.error('Verification error:', JSON.stringify(err, null, 2))
      Alert.alert('Error', err.errors?.[0]?.message || 'Verification failed.')
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
        {!pendingVerification ? (
        <>
          <Text style={styles.title}>Sign Up</Text>
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
          <TouchableOpacity style={styles.button} onPress={onSignUpPress}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
          <View style={styles.footer}>
            <Text>Already have an account?</Text>
            <Link href="/(auth)/sign-in">
              <Text style={styles.link}>Sign in</Text>
            </Link>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.title}>Enter Verification Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Code from email"
            value={code}
            onChangeText={setCode}
          />
          <TouchableOpacity style={styles.button} onPress={onVerifyPress}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  </KeyboardAvoidingView>
</SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
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
    gap: 6,
  },
  link: {
    marginLeft: 6,
    color: '#007AFF',
    fontWeight: '500',
  },
})