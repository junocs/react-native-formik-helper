import { ForwardRefRenderFunction, Ref, forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { useFormikContext } from 'formik'
import { Keyboard } from 'react-native'
import { WrappedComponentType, SelectFieldProps, InputRef, AutoFocusProps, HasSelectTypeProps } from '../types'

/**
 * HOC that connects a picker / dropdown component to a Formik field.
 *
 * The wrapped component receives:
 * - `value`         — the currently selected value from Formik state
 * - `onValueChange` — fires `setFieldValue` + `setFieldTouched` on selection
 * - `error`         — the Formik validation error string for this field
 * - `touched`       — whether the field has been touched
 * - `options`       — passed straight through (not consumed by the HOC)
 *
 * The wrapped component should expose a `focus()` imperative handle (e.g.
 * via `forwardRef` + `useImperativeHandle`) that opens the dropdown. When it
 * does, this field will automatically participate in the `<Form>` keyboard
 * focus chain — tapping "Next" on the previous text field will open the picker.
 * The keyboard is automatically dismissed before the picker opens.
 *
 * @see docs/withSelectField.md
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
