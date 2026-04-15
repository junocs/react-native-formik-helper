# withBooleanField

HOC that connects any toggle or checkbox component to a Formik boolean field.

## Props injected automatically

| Prop      | Type       | Description                                            |
| --------- | ---------- | ------------------------------------------------------ |
| `value`   | `boolean`  | Current boolean value from Formik state                |
| `error`   | `string?`  | Validation error string for this field                 |
| `touched` | `boolean?` | Whether the field has been touched                     |
| `onPress` | `fn`       | Toggles the field value and marks the field as touched |

## Field props

| Prop   | Type     | Description               |
| ------ | -------- | ------------------------- |
| `name` | `string` | Formik field name (required) |

## Example

```tsx
import { withBooleanField } from 'react-native-formik-helper'
import { Checkbox } from './components/Checkbox'
import { Switch } from 'react-native'

const AcceptTosField      = withBooleanField<CheckboxProps>(Checkbox)
const NotificationsToggle = withBooleanField<SwitchProps>(Switch)

<Form ...>
  <AcceptTosField      name="acceptedTos"           label="I agree to the terms and conditions" />
  <NotificationsToggle name="notificationsEnabled"  label="Enable push notifications" />
</Form>
```

## Touched-gated error display

```tsx
// In your Checkbox component:
function Checkbox({ value, onPress, error, touched }) {
  return (
    <View>
      <TouchableOpacity onPress={onPress}>
        {value ? <CheckIcon /> : <EmptyBox />}
      </TouchableOpacity>
      {touched && error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}
```
