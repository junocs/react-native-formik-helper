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
import {
  WrappedComponentType,
  TextInputFieldProps,
  InputRef,
  GenericFieldProps,
  SelectFieldProps,
  DateTimeFieldProps,
  AutoFocusProps,
  HasTextInputTypeProps,
  HasSelectTypeProps,
  HasDateTypeProps,
} from './types'
import { useFormikContext } from 'formik'
import { Keyboard } from 'react-native'
import type { NativeSyntheticEvent, TextInputChangeEventData } from 'react-native'

/**
 * HOC that connects a text input component to a Formik field.
 *
 * The wrapped component receives:
 * - `value`        — the current string value from Formik state
 * - `onChangeText` — fires `setFieldValue` on every keystroke
 * - `onBlur`       — fires `setFieldTouched` when the field loses focus
 * - `error`        — the Formik validation error string for this field
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

/**
 * HOC that connects a toggle / checkbox component to a Formik boolean field.
 *
 * The wrapped component receives:
 * - `value`   — the current boolean from Formik state
 * - `onPress` — toggles the boolean value and marks the field as touched
 * - `error`   — the Formik validation error string for this field
 *
 * @example
 * const AcceptTosField = withBooleanField<CheckboxProps>(Checkbox)
 * <AcceptTosField name="acceptedTos" label="I agree to the terms and conditions" />
 *
 * const NotificationsField = withBooleanField<SwitchProps>(Switch)
 * <NotificationsField name="notificationsEnabled" label="Enable notifications" />
 */
export function withBooleanField<T extends any>(WrappedComponent: WrappedComponentType) {
  return ({ name, ...rest }: GenericFieldProps & T) => {
    const { errors, values, touched, setFieldValue, setFieldTouched } = useFormikContext<Record<string, boolean>>()

    const onValueChanged = useCallback(() => {
      const next = !values[name]
      setFieldValue(name, next)
      setFieldTouched(name, true, false)
    }, [setFieldValue, setFieldTouched, values, name])

    return (
      <WrappedComponent
        {...rest}
        error={errors[name]}
        touched={touched[name]}
        value={values[name]}
        onPress={onValueChanged}
      />
    )
  }
}

/**
 * HOC that connects a picker / dropdown component to a Formik field.
 *
 * The wrapped component receives:
 * - `value`         — the currently selected value from Formik state
 * - `onValueChange` — fires `setFieldValue` + `setFieldTouched` on selection
 * - `error`         — the Formik validation error string for this field
 * - `options`       — passed straight through (not consumed by the HOC)
 *
 * The wrapped component should expose a `focus()` imperative handle (e.g.
 * via `forwardRef` + `useImperativeHandle`) that opens the dropdown. When it
 * does, this field will automatically participate in the `<Form>` keyboard
 * focus chain — tapping "Next" on the previous text field will open the picker.
 *
 * @example
 * const CountryField = withSelectField<PickerProps>(CountryPicker)
 * <CountryField name="country" options={COUNTRY_OPTIONS} />
 */
export function withSelectField<T extends HasSelectTypeProps>(WrappedComponent: WrappedComponentType) {
  const RenderFn = <V = string,>(
    { name, onValueChange: propOnValueChange, fieldRegistrationRef, ...rest }: SelectFieldProps<V> & T & AutoFocusProps,
    externalRef: Ref<InputRef>
  ) => {
    const { errors, values, touched, setFieldValue, setFieldTouched } = useFormikContext<Record<string, V>>()

    const innerRef = useRef<InputRef>(null)

    useImperativeHandle(externalRef, () => ({
      focus: () => {
        Keyboard.dismiss()
        innerRef.current?.focus?.()
      },
    }))

    useEffect(() => {
      if (!fieldRegistrationRef) return
      fieldRegistrationRef({
        focus: () => {
          Keyboard.dismiss()
          innerRef.current?.focus?.()
        },
      })
      return () => {
        fieldRegistrationRef(null)
      }
    }, [fieldRegistrationRef])

    const onValueChange = useCallback(
      (value: V) => {
        setFieldValue(name, value)
        setFieldTouched(name, true, false)
        propOnValueChange?.(value)
      },
      [propOnValueChange, name, setFieldValue, setFieldTouched]
    )

    return (
      <WrappedComponent
        ref={innerRef}
        {...rest}
        error={errors[name]}
        touched={touched[name]}
        value={values[name]}
        onValueChange={onValueChange}
      />
    )
  }

  return forwardRef(RenderFn as unknown as ForwardRefRenderFunction<InputRef, any>)
}

/**
 * HOC that connects a date/time picker component to a Formik field.
 *
 * The wrapped component receives:
 * - `value`    — the current Date from Formik state (or `undefined`)
 * - `onChange` — fires `setFieldValue` + `setFieldTouched` when a value is picked
 * - `error`    — the Formik validation error string for this field
 * - `mode`     — passed straight through: `'date'` | `'time'` | `'datetime'`
 *
 * The wrapped component should expose a `focus()` imperative handle (e.g.
 * via `forwardRef` + `useImperativeHandle`) that opens the picker. When it
 * does, this field will automatically participate in the `<Form>` keyboard
 * focus chain — tapping "Next" on the previous text field will open the picker.
 *
 * @example
 * const BirthDateField = withDateTimeField<DateTimePickerProps>(DateTimePicker)
 * <BirthDateField name="birthDate" mode="date" minimumDate={new Date('1900-01-01')} />
 *
 * const AppointmentField = withDateTimeField<DateTimePickerProps>(DateTimePicker)
 * <AppointmentField name="appointmentAt" mode="datetime" />
 */
export function withDateTimeField<T extends HasDateTypeProps>(WrappedComponent: WrappedComponentType) {
  const RenderFn = (
    { name, onChange: propOnChange, fieldRegistrationRef, ...rest }: DateTimeFieldProps & T & AutoFocusProps,
    externalRef: Ref<InputRef>
  ) => {
    const { errors, values, touched, setFieldValue, setFieldTouched } =
      useFormikContext<Record<string, Date | undefined>>()

    const innerRef = useRef<InputRef>(null)

    useImperativeHandle(externalRef, () => ({
      focus: () => {
        Keyboard.dismiss()
        innerRef.current?.focus?.()
      },
    }))

    useEffect(() => {
      if (!fieldRegistrationRef) return
      fieldRegistrationRef({
        focus: () => {
          Keyboard.dismiss()
          innerRef.current?.focus?.()
        },
      })
      return () => {
        fieldRegistrationRef(null)
      }
    }, [fieldRegistrationRef])

    const onChange = useCallback(
      (date: Date) => {
        setFieldValue(name, date)
        setFieldTouched(name, true, false)
        propOnChange?.(date)
      },
      [propOnChange, name, setFieldValue, setFieldTouched]
    )

    return (
      <WrappedComponent
        ref={innerRef}
        {...rest}
        error={errors[name]}
        touched={touched[name]}
        value={values[name]}
        onChange={onChange}
      />
    )
  }

  return forwardRef(RenderFn as unknown as ForwardRefRenderFunction<InputRef, any>)
}

/**
 * Generic escape-hatch HOC for components that don't fit the four specific
 * field patterns. Connects any component to Formik by mapping its prop names
 * to Formik state via `FieldConfig`.
 *
 * The wrapped component receives:
 * - `[valueProp]`   — current value from Formik state            (default: `'value'`)
 * - `[changeProp]`  — calls `setFieldValue` + `setFieldTouched`  (default: `'onChange'`)
 * - `[errorProp]`   — Formik validation error string             (default: `'error'`)
 * - `[touchedProp]` — whether the field has been touched         (default: `'touched'`)
 *
 * @example
 * // A star-rating component whose change handler is called `onRatingChange`
 * const RatingField = withField<RatingProps, number>(StarRating, {
 *   changeProp: 'onRatingChange',
 * })
 * <RatingField name="rating" maxStars={5} />
 *
 * // A colour picker with fully custom prop names
 * const ColorField = withField<ColorPickerProps, string>(ColorPicker, {
 *   valueProp: 'selectedColor',
 *   changeProp: 'onColorSelected',
 * })
 * <ColorField name="brandColor" />
 */
export function withField<T, V = any>(
  WrappedComponent: WrappedComponentType,
  {
    valueProp = 'value',
    changeProp = 'onChange',
    errorProp = 'error',
    touchedProp = 'touched',
  }: import('./types').FieldConfig = {}
) {
  return ({ name, ...rest }: GenericFieldProps & T) => {
    const { values, errors, touched, setFieldValue, setFieldTouched } = useFormikContext<Record<string, V>>()

    const onChange = useCallback(
      (value: V) => {
        setFieldValue(name, value)
        setFieldTouched(name, true, false)
      },
      [name, setFieldValue, setFieldTouched]
    )

    return (
      <WrappedComponent
        {...(rest as any)}
        {...{ [valueProp]: values[name] }}
        {...{ [changeProp]: onChange }}
        {...{ [errorProp]: errors[name] }}
        {...{ [touchedProp]: touched[name] }}
      />
    )
  }
}
