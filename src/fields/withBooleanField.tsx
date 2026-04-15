import { useCallback } from 'react'
import { useFormikContext } from 'formik'
import { WrappedComponentType, GenericFieldProps } from '../types'

/**
 * HOC that connects a toggle / checkbox component to a Formik boolean field.
 *
 * The wrapped component receives:
 * - `value`   — the current boolean from Formik state
 * - `onPress` — toggles the boolean value and marks the field as touched
 * - `error`   — the Formik validation error string for this field
 * - `touched` — whether the field has been touched
 *
 * @see docs/withBooleanField.md
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
