# withTextInputField

HOC that connects any `TextInput`-compatible component to a Formik field.

## Props injected automatically

| Prop              | Type      | Description                                                       |
| ----------------- | --------- | ----------------------------------------------------------------- |
| `value`           | `string`  | Current field value from Formik state                             |
| `error`           | `string?` | Formik validation error string for this field                     |
| `touched`         | `boolean?`| Whether the field has been touched                                |
| `onChangeText`    | `fn`      | Updates Formik state on every keystroke                           |
| `onBlur`          | `fn`      | Marks the field as touched in Formik                              |
| `returnKeyType`   | `string`  | `"next"` or `"done"` — set automatically by `<Form>`              |
| `blurOnSubmit`    | `boolean` | `false` for all fields except the last (prevents keyboard flicker)|
| `onSubmitEditing` | `fn`      | Advances focus to the next field automatically                    |

## Field props

| Prop   | Type                                          | Description                                                         |
| ------ | --------------------------------------------- | ------------------------------------------------------------------- |
| `name` | `string`                                      | Formik field name (required)                                        |
| `type` | `'email' \| 'password' \| 'digits' \| 'name'` | Applies sensible keyboard defaults automatically                    |

## `type` presets

| Value      | Effect                                                                         |
| ---------- | ------------------------------------------------------------------------------ |
| `email`    | `keyboardType="email-address"`, `autoCapitalize="none"`, `autoCorrect={false}` |
| `password` | `secureTextEntry={true}`, `autoCapitalize="none"`, `autoCorrect={false}`       |
| `digits`   | `keyboardType="phone-pad"`                                                     |
| `name`     | `autoCorrect={false}`                                                          |

## Auto-focus chain

Fields created with this HOC automatically participate in `<Form>`'s keyboard focus chain. `returnKeyType`, `blurOnSubmit`, and `onSubmitEditing` are all handled internally — no manual `ref` wiring required.

## Example

```tsx
import { withTextInputField } from 'react-native-formik-helper'
import { TextInput } from './components/TextInput'

const EmailField    = withTextInputField<TextInputProps>(TextInput)
const PasswordField = withTextInputField<TextInputProps>(TextInput)
const NameField     = withTextInputField<TextInputProps>(TextInput)

<Form ...>
  <NameField     name="name"     type="name"     label="Full name" />
  <EmailField    name="email"    type="email"    label="Email address" />
  <PasswordField name="password" type="password" label="Password" />
</Form>
```

## Hook-based alternative

Use Formik's built-in [`useField`](https://formik.org/docs/api/useField) when you need full rendering control:

```tsx
import { useField } from 'formik'

function EmailInput({ name }: { name: string }) {
  const [, meta, helpers] = useField(name)
  return (
    <TextInput
      value={meta.value}
      onChangeText={helpers.setValue}
      onBlur={() => helpers.setTouched(true)}
      error={meta.touched ? meta.error : undefined}
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
    />
  )
}
```
