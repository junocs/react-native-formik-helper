# withField

Generic escape-hatch HOC for connecting any component to Formik when the four
specific field HOCs don't fit. Maps Formik state to the component's own prop
names via a `FieldConfig` object.

## `FieldConfig` options

| Option        | Type     | Default      | Description                                    |
| ------------- | -------- | ------------ | ---------------------------------------------- |
| `valueProp`   | `string` | `'value'`    | Prop the component uses to receive the value   |
| `changeProp`  | `string` | `'onChange'` | Prop called when the value changes             |
| `errorProp`   | `string` | `'error'`    | Prop for displaying the validation error       |
| `touchedProp` | `string` | `'touched'`  | Prop for the touched boolean                   |

## Props injected automatically

The component receives Formik state under the configured prop names:

| Formik concept | Default prop | Description                                   |
| -------------- | ------------ | --------------------------------------------- |
| `values[name]` | `value`      | Current value from Formik state               |
| Change handler | `onChange`   | Calls `setFieldValue` + `setFieldTouched`     |
| `errors[name]` | `error`      | Validation error string                       |
| `touched[name]`| `touched`    | Whether the field has been interacted with    |

## Field props

| Prop   | Type     | Description               |
| ------ | -------- | ------------------------- |
| `name` | `string` | Formik field name (required) |

## When to use

Use `withField` when your component:
- Uses non-standard prop names (e.g. `onRatingChange` instead of `onChange`)
- Holds an arbitrary value type (number, enum, colour string, etc.)
- Doesn't need keyboard focus chain participation

For text inputs, checkboxes, dropdowns, or date pickers prefer the dedicated
HOCs — they provide richer integration (auto-focus, keyboard presets, etc.).

## Examples

### Star rating (custom change prop)

```tsx
import { withField } from 'react-native-formik-helper'
import { StarRating, StarRatingProps } from './components/StarRating'

const RatingField = withField<StarRatingProps, number>(StarRating, {
  changeProp: 'onRatingChange',
})

<RatingField name="rating" maxStars={5} />
```

### Colour picker (fully custom prop names)

```tsx
import { withField } from 'react-native-formik-helper'
import { ColorPicker, ColorPickerProps } from './components/ColorPicker'

const ColorField = withField<ColorPickerProps, string>(ColorPicker, {
  valueProp: 'selectedColor',
  changeProp: 'onColorSelected',
  errorProp: 'errorMessage',
})

<ColorField name="brandColor" palette={MY_PALETTE} />
```

### Numeric slider

```tsx
const SliderField = withField<SliderProps, number>(Slider)
// Uses all defaults: value / onChange / error / touched
<SliderField name="budget" minimumValue={0} maximumValue={10000} step={100} />
```
