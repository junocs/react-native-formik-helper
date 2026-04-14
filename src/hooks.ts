import { useCallback, useMemo } from 'react'
import { useFormikContext } from 'formik'
import type {
  TextInputFieldProps,
  UseBooleanFieldResult,
  UseDateTimeFieldResult,
  UseSelectFieldResult,
  UseTextInputFieldResult,
} from './types'

// ---------------------------------------------------------------------------
// useTextInputField
// ---------------------------------------------------------------------------

/**
 * Hook alternative to `withTextInputField`. Returns Formik-connected props
 * ready to spread onto any text input component.
 *
 * Supports the same `type` presets as the HOC (`'email'`, `'password'`,
 * `'digits'`, `'name'`) to automatically apply sensible keyboard props.
 *
 * @example
 * function EmailInput({ name }: { name: string }) {
 *   const fieldProps = useTextInputField(name, { type: 'email' })
 *   return <TextInput {...fieldProps} label="Email" />
 * }
 */
export function useTextInputField(name: string, options?: Pick<TextInputFieldProps, 'type'>): UseTextInputFieldResult {
  const { values, errors, touched, setFieldValue, setFieldTouched, isSubmitting } =
    useFormikContext<Record<string, string>>()

  const onChangeText = useCallback(
    (text: string) => {
      setFieldValue(name, text)
    },
    [name, setFieldValue]
  )

  const onBlur = useCallback(() => {
    setFieldTouched(name, true, !isSubmitting)
  }, [name, setFieldTouched, isSubmitting])

  const typeProps = useMemo(() => {
    const type = options?.type
    if (type === 'email')
      return { autoCorrect: false as const, autoCapitalize: 'none' as const, keyboardType: 'email-address' as const }
    if (type === 'password')
      return { autoCorrect: false as const, autoCapitalize: 'none' as const, secureTextEntry: true }
    if (type === 'digits') return { keyboardType: 'phone-pad' as const }
    if (type === 'name') return { autoCorrect: false as const }
    return {}
  }, [options?.type])

  return {
    value: values[name] ?? '',
    error: errors[name] as string | undefined,
    touched: touched[name] as boolean | undefined,
    onChangeText,
    onBlur,
    ...typeProps,
  }
}

// ---------------------------------------------------------------------------
// useBooleanField
// ---------------------------------------------------------------------------

/**
 * Hook alternative to `withBooleanField`. Returns Formik-connected props
 * ready to spread onto any toggle or checkbox component.
 *
 * @example
 * function TosCheckbox({ name }: { name: string }) {
 *   const { value, onPress, error, touched } = useBooleanField(name)
 *   return <Checkbox checked={value} onPress={onPress} error={touched ? error : undefined} />
 * }
 */
export function useBooleanField(name: string): UseBooleanFieldResult {
  const { values, errors, touched, setFieldValue, setFieldTouched } = useFormikContext<Record<string, boolean>>()

  const onPress = useCallback(() => {
    setFieldValue(name, !values[name])
    setFieldTouched(name, true, false)
  }, [name, values, setFieldValue, setFieldTouched])

  return {
    value: values[name] ?? false,
    error: errors[name] as string | undefined,
    touched: touched[name] as boolean | undefined,
    onPress,
  }
}

// ---------------------------------------------------------------------------
// useSelectField
// ---------------------------------------------------------------------------

/**
 * Hook alternative to `withSelectField`. Returns Formik-connected props
 * ready to spread onto any picker or dropdown component.
 *
 * The value type `V` defaults to `string` but can be any serialisable type.
 *
 * @example
 * function CountryPicker({ name }: { name: string }) {
 *   const { value, onValueChange, error, touched } = useSelectField<string>(name)
 *   return <Select value={value} onValueChange={onValueChange} options={COUNTRY_OPTIONS} />
 * }
 */
export function useSelectField<V = string>(name: string): UseSelectFieldResult<V> {
  const { values, errors, touched, setFieldValue, setFieldTouched } = useFormikContext<Record<string, V>>()

  const onValueChange = useCallback(
    (value: V) => {
      setFieldValue(name, value)
      setFieldTouched(name, true, false)
    },
    [name, setFieldValue, setFieldTouched]
  )

  return {
    value: values[name],
    error: errors[name] as string | undefined,
    touched: touched[name] as boolean | undefined,
    onValueChange,
  }
}

// ---------------------------------------------------------------------------
// useDateTimeField
// ---------------------------------------------------------------------------

/**
 * Hook alternative to `withDateTimeField`. Returns Formik-connected props
 * ready to spread onto any date or time picker component.
 *
 * @example
 * function BirthDateInput({ name }: { name: string }) {
 *   const { value, onChange, error, touched } = useDateTimeField(name)
 *   return <DatePicker value={value} onChange={onChange} mode="date" />
 * }
 */
export function useDateTimeField(name: string): UseDateTimeFieldResult {
  const { values, errors, touched, setFieldValue, setFieldTouched } =
    useFormikContext<Record<string, Date | undefined>>()

  const onChange = useCallback(
    (date: Date) => {
      setFieldValue(name, date)
      setFieldTouched(name, true, false)
    },
    [name, setFieldValue, setFieldTouched]
  )

  return {
    value: values[name],
    error: errors[name] as string | undefined,
    touched: touched[name] as boolean | undefined,
    onChange,
  }
}
