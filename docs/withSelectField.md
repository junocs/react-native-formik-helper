# withSelectField

HOC that connects any dropdown or picker component to a Formik field.
The value type `V` defaults to `string` but can be any serialisable type.

## Props injected automatically

| Prop            | Type       | Description                                                 |
| --------------- | ---------- | ----------------------------------------------------------- |
| `value`         | `V?`       | Currently selected value from Formik state                  |
| `error`         | `string?`  | Validation error string for this field                      |
| `touched`       | `boolean?` | Whether the field has been touched                          |
| `onValueChange` | `fn`       | Updates Formik state and marks the field as touched on pick |

## Field props

| Prop      | Type                | Description                                      |
| --------- | ------------------- | ------------------------------------------------ |
| `name`    | `string`            | Formik field name (required)                     |
| `options` | `SelectOption<V>[]` | List of `{ label, value }` options to display    |

## `SelectOption<V>` type

```ts
interface SelectOption<V = string> {
  label: string
  value: V
}
```

## Keyboard dismissal & focus chain

When the previous text field's "Next" key is tapped, `withSelectField` automatically:
1. Calls `Keyboard.dismiss()` — clears the software keyboard
2. Calls `focus()` on the wrapped component's imperative ref — opens the picker

For this to work, your component **must** expose a `focus()` handle via `forwardRef` + `useImperativeHandle`:

```tsx
const Select = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false)
  useImperativeHandle(ref, () => ({ focus: () => setVisible(true) }))
  // ...
})
```

## Example

```tsx
import { withSelectField, SelectOption } from 'react-native-formik-helper'
import { Select } from './components/Select'

const COUNTRY_OPTIONS: SelectOption[] = [
  { label: 'United States', value: 'us' },
  { label: 'Canada',        value: 'ca' },
]

const CountryField = withSelectField<SelectProps>(Select)

<Form ...>
  <CountryField name="country" label="Country" options={COUNTRY_OPTIONS} />
</Form>
```

## Generic value type

```tsx
type Priority = 'low' | 'medium' | 'high'

const PRIORITY_OPTIONS: SelectOption<Priority>[] = [
  { label: 'Low',    value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High',   value: 'high' },
]

// V is inferred from options
const PriorityField = withSelectField<SelectProps, Priority>(Select)
<PriorityField name="priority" options={PRIORITY_OPTIONS} />
```
