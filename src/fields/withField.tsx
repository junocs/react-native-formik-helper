import { useCallback } from 'react'
import { useFormikContext } from 'formik'
import { WrappedComponentType, GenericFieldProps, FieldConfig } from '../types'

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
 * @see docs/withField.md
 *
 * @example
 * // A star-rating component whose change handler is called `onRatingChange`
 * const RatingField = withField<RatingProps, number>(StarRating, {
 *   changeProp: 'onRatingChange',
 * })
 * <RatingField name="rating" maxStars={5} />
 *
 * // A color picker with fully custom prop names
 * const ColorField = withField<ColorPickerProps, string>(ColorPicker, {
 *   valueProp: 'selectedColor',
 *   changeProp: 'onColorSelected',
 * })
 * <ColorField name="brandColor" />
 */
export function withField<T, V = any>(
  WrappedComponent: WrappedComponentType,
  { valueProp = 'value', changeProp = 'onChange', errorProp = 'error', touchedProp = 'touched' }: FieldConfig = {}
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
