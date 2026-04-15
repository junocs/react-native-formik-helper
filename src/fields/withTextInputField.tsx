import {
  ForwardRefRenderFunction,
  Ref,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import { useFormikContext } from 'formik'
import type { NativeSyntheticEvent, TextInputChangeEventData } from 'react-native'
import { WrappedComponentType, TextInputFieldProps, InputRef, AutoFocusProps, HasTextInputTypeProps } from '../types'

/**
 * HOC that connects a text input component to a Formik field.
 *
 * The wrapped component receives:
 * - `value`        — the current string value from Formik state
 * - `onChangeText` — fires `setFieldValue` on every keystroke
 * - `onBlur`       — fires `setFieldTouched` when the field loses focus
 * - `error`        — the Formik validation error string for this field
 * - `touched`      — whether the field has been touched
 *
 * The optional `type` prop automatically applies sensible input props:
 * - `'email'`    → `keyboardType: 'email-address'`, `autoCapitalize: 'none'`, `autoCorrect: false`
 * - `'password'` → `secureTextEntry: true`, `autoCapitalize: 'none'`, `autoCorrect: false`
 * - `'digits'`   → `keyboardType: 'phone-pad'`
 * - `'name'`     → `autoCorrect: false`
 *
 * Fields created with this HOC automatically participate in the `<Form>`
 * keyboard focus chain (returnKeyType / onSubmitEditing / blurOnSubmit).
 *
 * @see docs/withTextInputField.md
 *
 * @example
 * const EmailField = withTextInputField<TextInputProps>(TextInput)
 * <EmailField name="email" type="email" label="Email address" />
 *
 * const PasswordField = withTextInputField<TextInputProps>(TextInput)
 * <PasswordField name="password" type="password" label="Password" />
 */
export function withTextInputField<T extends HasTextInputTypeProps>(WrappedComponent: WrappedComponentType) {
  const RenderFn = (
    {
      name,
      type,
      onChangeText: propOnChangeText,
      onBlur: propOnBlur,
      fieldRegistrationRef,
      returnKeyType,
      blurOnSubmit,
      onSubmitEditing,
      ...rest
    }: TextInputFieldProps & T & AutoFocusProps,
    externalRef: Ref<InputRef>
  ) => {
    const { errors, values, touched, setFieldValue, setFieldTouched, isSubmitting } =
      useFormikContext<Record<string, string>>()

    const innerRef = useRef<InputRef>(null)

    useImperativeHandle(externalRef, () => ({
      focus: () => innerRef.current?.focus?.(),
      blur: () => innerRef.current?.blur?.(),
    }))

    useEffect(() => {
      if (!fieldRegistrationRef) return
      fieldRegistrationRef({ focus: () => innerRef.current?.focus?.() })
      return () => {
        fieldRegistrationRef(null)
      }
    }, [fieldRegistrationRef])

    const defaultProps = useMemo((): Pick<T, 'keyboardType' | 'secureTextEntry' | 'autoCorrect' | 'autoCapitalize'> => {
      if (type === 'email') {
        return { ...rest, autoCorrect: false, autoCapitalize: 'none', keyboardType: 'email-address' }
      }
      if (type === 'password') {
        return { ...rest, autoCorrect: false, autoCapitalize: 'none', secureTextEntry: true }
      }
      if (type === 'digits') {
        return { ...rest, keyboardType: 'phone-pad' }
      }
      if (type === 'name') {
        return { ...rest, autoCorrect: false }
      }
      return { ...rest }
    }, [type, rest])

    const onChangeText = useCallback(
      (text: string) => {
        setFieldValue(name, text)
        propOnChangeText?.(text)
      },
      [propOnChangeText, name, setFieldValue]
    )

    const onBlur = useCallback(
      (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
        setFieldTouched(name, true, !isSubmitting)
        propOnBlur?.(e as any)
      },
      [propOnBlur, name, setFieldTouched, isSubmitting]
    )

    return (
      <WrappedComponent
        ref={innerRef}
        error={errors[name]}
        touched={touched[name]}
        value={values[name]}
        onChangeText={onChangeText}
        onBlur={onBlur}
        returnKeyType={returnKeyType}
        blurOnSubmit={blurOnSubmit}
        onSubmitEditing={onSubmitEditing}
        {...defaultProps}
      />
    )
  }

  return forwardRef(RenderFn as unknown as ForwardRefRenderFunction<InputRef, any>)
}
