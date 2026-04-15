# withDateTimeField

HOC that connects any date, time, or date-time picker component to a Formik field.

## Props injected automatically

| Prop       | Type        | Description                                                 |
| ---------- | ----------- | ----------------------------------------------------------- |
| `value`    | `Date?`     | Current `Date` (or `undefined`) from Formik state           |
| `error`    | `string?`   | Validation error string for this field                      |
| `touched`  | `boolean?`  | Whether the field has been touched                          |
| `onChange` | `fn`        | Updates Formik state and marks the field as touched on pick |

## Field props

| Prop          | Type                             | Description                                    |
| ------------- | -------------------------------- | ---------------------------------------------- |
| `name`        | `string`                         | Formik field name (required)                   |
| `mode`        | `'date' \| 'time' \| 'datetime'` | Picker mode (passed through to the component)  |
| `minimumDate` | `Date`                           | Earliest selectable date/time                  |
| `maximumDate` | `Date`                           | Latest selectable date/time                    |

## Keyboard dismissal & focus chain

When the previous text field's "Next" key is tapped, `withDateTimeField` automatically:
1. Calls `Keyboard.dismiss()` — clears the software keyboard
2. Calls `focus()` on the wrapped component's imperative ref — opens the picker

For this to work, your component **must** expose a `focus()` handle via `forwardRef` + `useImperativeHandle`:

```tsx
const DateTimePicker = forwardRef((props, ref) => {
  const [showPicker, setShowPicker] = useState(false)
  useImperativeHandle(ref, () => ({ focus: () => setShowPicker(true) }))
  // ...
})
```

## Example

```tsx
import { withDateTimeField } from 'react-native-formik-helper'
import { DateTimePicker } from './components/DateTimePicker'

// Date only (e.g. date of birth)
const BirthDateField = withDateTimeField<DateTimePickerProps>(DateTimePicker)
<BirthDateField name="birthDate" mode="date" maximumDate={new Date()} />

// Date + time (e.g. appointment booking)
const AppointmentField = withDateTimeField<DateTimePickerProps>(DateTimePicker)
<AppointmentField name="appointmentAt" mode="datetime" minimumDate={new Date()} />

// Time only (e.g. reminder time)
const ReminderField = withDateTimeField<DateTimePickerProps>(DateTimePicker)
<ReminderField name="reminderTime" mode="time" />
```

## Yup validation

```ts
import * as yup from 'yup'

const schema = yup.object({
  birthDate:     yup.date().max(new Date(), 'Cannot be in the future').required(),
  appointmentAt: yup.date().min(new Date(), 'Must be in the future').required(),
})
```
