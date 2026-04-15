import { ForwardRefRenderFunction, Ref, forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { useFormikContext } from 'formik'
import { Keyboard } from 'react-native'
import { WrappedComponentType, DateTimeFieldProps, InputRef, AutoFocusProps, HasDateTypeProps } from '../types'

/**
 * HOC that connects a date/time picker component to a Formik field.
 *
 * The wrapped component receives:
 * - `value`    — the current Date from Formik state (or `undefined`)
 * - `onChange` — fires `setFieldValue` + `setFieldTouched` when a value is picked
 * - `error`    — the Formik validation error string for this field
 * - `touched`  — whether the field has been touched
 * - `mode`     — passed straight through: `'date'` | `'time'` | `'datetime'`
 *
 * The wrapped component should expose a `focus()` imperative handle (e.g.
 * via `forwardRef` + `useImperativeHandle`) that opens the picker. When it
 * does, this field will automatically participate in the `<Form>` keyboard
 * focus chain — tapping "Next" on the previous text field will open the picker.
 * The keyboard is automatically dismissed before the picker opens.
 *
 * @see docs/withDateTimeField.md
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
