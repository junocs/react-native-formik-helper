import { useCallback } from 'react'
import * as yup from 'yup'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native'
import {
  Form,
  SelectOption,
  SubmitButtonProps,
  withBooleanField,
  withDateTimeField,
  withSelectField,
  withTextInputField,
} from 'react-native-formik-helper'

import {
  Checkbox,
  CheckboxProps,
  DateTimePicker,
  DateTimePickerProps,
  Select,
  SelectProps,
  SubmitButton,
  TextInput,
  TextInputProps,
} from './components'

// ---------------------------------------------------------------------------
// Field factories
// ---------------------------------------------------------------------------

const EmailField = withTextInputField<TextInputProps>(TextInput)
const PasswordField = withTextInputField<TextInputProps>(TextInput)
const NameField = withTextInputField<TextInputProps>(TextInput)

const CountryField = withSelectField<SelectProps>(Select)
const BirthDateField = withDateTimeField<DateTimePickerProps>(DateTimePicker)

const CheckboxField = withBooleanField<CheckboxProps>(Checkbox)

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const COUNTRY_OPTIONS: SelectOption[] = [
  { label: '🇺🇸  United States', value: 'us' },
  { label: '🇬🇧  United Kingdom', value: 'gb' },
  { label: '🇨🇦  Canada', value: 'ca' },
  { label: '🇦🇺  Australia', value: 'au' },
  { label: '🇩🇪  Germany', value: 'de' },
  { label: '🇫🇷  France', value: 'fr' },
]

const Fields = {
  name: 'name',
  email: 'email',
  password: 'password',
  country: 'country',
  birthDate: 'birthDate',
  acceptedTos: 'acceptedTos',
}

type FormValues = {
  name: string
  email: string
  password: string
  country: string
  birthDate: Date | undefined
  acceptedTos: boolean
}

const MAX_BIRTH_DATE = new Date()
MAX_BIRTH_DATE.setFullYear(MAX_BIRTH_DATE.getFullYear() - 18) // must be 18+

const validationSchema = yup.object().shape({
  [Fields.name]: yup.string().min(2).max(64).required('Full name is required'),
  [Fields.email]: yup.string().email('Invalid email').required('Email is required'),
  [Fields.password]: yup.string().min(8, 'At least 8 characters').max(50).required('Password is required'),
  [Fields.country]: yup.string().required('Please select your country'),
  [Fields.birthDate]: yup
    .date()
    .max(MAX_BIRTH_DATE, 'You must be at least 18 years old')
    .required('Date of birth is required'),
  [Fields.acceptedTos]: yup.boolean().oneOf([true], 'You must accept the terms').required(),
})

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  const renderSubmitButton = useCallback(
    ({ isLoading, disabled, onPress }: SubmitButtonProps) => (
      <SubmitButton loading={isLoading} disabled={disabled} onPress={onPress} style={styles.submitButton}>
        {'Create Account'}
      </SubmitButton>
    ),
    []
  )

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Form<FormValues>
          validateOnMount
          initialValues={
            {
              [Fields.name]: '',
              [Fields.email]: '',
              [Fields.password]: '',
              [Fields.country]: '',
              [Fields.birthDate]: undefined,
              [Fields.acceptedTos]: false,
            } as FormValues
          }
          validationSchema={validationSchema}
          onSubmit={() => {}}
          SubmitButton={renderSubmitButton}
        >
          {/* Text inputs — participate in keyboard focus chain */}
          <NameField name={Fields.name} label="Full name" textContentType="name" type="name" />
          <EmailField name={Fields.email} type="email" label="Email address" />
          <PasswordField name={Fields.password} type="password" label="Password" />

          {/* Select field — demonstrates withSelectField */}
          <CountryField name={Fields.country} label="Country" options={COUNTRY_OPTIONS} />

          {/* Date field — demonstrates withDateTimeField */}
          <BirthDateField
            name={Fields.birthDate}
            label="Date of birth"
            maximumDate={MAX_BIRTH_DATE}
            minimumDate={new Date('1900-01-01')}
          />

          {/* Boolean field */}
          <CheckboxField name={Fields.acceptedTos} label="I agree to the terms and conditions" />
        </Form>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  submitButton: {
    marginTop: 32,
  },
})
