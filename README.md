# react-native-formik-helper

[![npm version](https://img.shields.io/npm/v/react-native-formik-helper.svg)](https://www.npmjs.com/package/react-native-formik-helper)
[![npm downloads](https://img.shields.io/npm/dm/react-native-formik-helper.svg)](https://www.npmjs.com/package/react-native-formik-helper)

Forms in React/React Native can be verbose, but [Formik](https://github.com/jaredpalmer/formik) simplifies the three most annoying aspects:

1. Getting values in and out of form state
2. Validation and error messages
3. Handling form submission

Inspired by [React Native Formik](https://github.com/bamlab/react-native-formik), this library makes forms even more abstract by providing higher-order components that wire your existing inputs directly into Formik with zero boilerplate.

**Features**

- Automatically advance focus to the next input on submit (`returnKeyType="next"` / `"done"` set automatically)
- Convert any React Native input into a `Formik` field with `withTextInputField` or `withBooleanField`
- Drop-in `Form` component that handles submission, error display, and keyboard dismissal
- Fully typed with TypeScript

## Requirements

| Dependency   | Version  |
| ------------ | -------- |
| React Native | ≥ 0.73   |
| React        | ≥ 18     |
| Formik       | ≥ 2      |
| Node         | ≥ 20 LTS |

## Installation

```sh
yarn add formik react-native-formik-helper
```

## Usage

### 1. Wrap your inputs with a field HoC

```tsx
import { withTextInputField, withBooleanField } from 'react-native-formik-helper'
import { TextInput, TextInputProps } from './components/TextInput'
import { Checkbox, CheckboxProps } from './components/Checkbox'

// Create typed field components once, reuse everywhere
const EmailField = withTextInputField<TextInputProps>(TextInput)
const PasswordField = withTextInputField<TextInputProps>(TextInput)
const NameField = withTextInputField<TextInputProps>(TextInput)
const CheckboxField = withBooleanField<CheckboxProps>(Checkbox)
```

Your wrapped component receives `value`, `error`, `onChangeText`, and `onBlur` from Formik automatically.
Any extra props you pass are forwarded to the underlying component unchanged.

### 2. Use `<Form>` to compose them

```tsx
import React, { useCallback } from 'react'
import * as yup from 'yup'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native'
import { Form } from 'react-native-formik-helper'

const Fields = {
  name: 'name',
  email: 'email',
  password: 'password',
  acceptedTos: 'acceptedTos',
}

type FormValues = {
  name: string
  email: string
  password: string
  acceptedTos: boolean
}

const validationSchema = yup.object().shape({
  [Fields.name]: yup.string().min(4).max(32).required(),
  [Fields.email]: yup.string().email().required(),
  [Fields.password]: yup.string().min(8).max(50).required(),
  [Fields.acceptedTos]: yup.boolean().oneOf([true]).required(),
})

export default function SignUpScreen() {
  const handleSubmit = useCallback((values: FormValues) => {
    console.log(values)
  }, [])

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Form<FormValues>
          validateOnMount
          initialValues={{ name: '', email: '', password: '', acceptedTos: false }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <NameField name={Fields.name} label="Full name" textContentType="name" />
          <EmailField name={Fields.email} type="email" label="Email address" />
          <PasswordField name={Fields.password} type="password" label="Password" />
          <CheckboxField name={Fields.acceptedTos} label="I agree to terms and conditions" />
        </Form>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({ container: { flex: 1 } })
```

Focus advances from one field to the next automatically — no `ref` wiring required.

---

## API

### `<Form>`

Wraps `<Formik>` and provides auto-focus chaining, error display, and a submit button.

| Prop                       | Type                        | Default  | Description                                               |
| -------------------------- | --------------------------- | -------- | --------------------------------------------------------- |
| `initialValues`            | `T`                         | —        | Initial Formik values (required)                          |
| `validationSchema`         | `yup.Schema`                | —        | Yup validation schema                                     |
| `onSubmit`                 | `(values, helpers) => void` | —        | Submit handler (required)                                 |
| `isLoading`                | `boolean`                   | `false`  | Disables the submit button and shows a loading indicator  |
| `isError`                  | `boolean`                   | `false`  | Whether to show the error banner                          |
| `error`                    | `object \| string \| null`  | —        | Error value forwarded to the error component              |
| `genericErrorMessage`      | `string`                    | —        | Fallback message when `error` can't be displayed directly |
| `useDefaultFormError`      | `boolean`                   | `true`   | Mount the built-in error banner                           |
| `useDefaultSubmitButton`   | `boolean`                   | `true`   | Mount the built-in submit button                          |
| `FormError`                | `FC<FormErrorProps>`        | built-in | Replace the error component entirely                      |
| `SubmitButton`             | `FC<SubmitButtonProps>`     | built-in | Replace the submit button entirely                        |
| `renderHeader`             | `FormikConfig['children']`  | —        | Render prop / node inserted above the fields              |
| `renderFooter`             | `FormikConfig['children']`  | —        | Render prop / node inserted below the submit button       |
| `containerStyle`           | `StyleProp<ViewStyle>`      | —        | Style for the outer `SafeAreaView`                        |
| + all `FormikConfig` props |                             |          | e.g. `validateOnMount`, `enableReinitialize`, …           |

#### Custom submit button

```tsx
import { SubmitButtonProps } from 'react-native-formik-helper'

<Form
  SubmitButton={({ isLoading, disabled, onPress }: SubmitButtonProps) => (
    <MyButton loading={isLoading} disabled={disabled} onPress={onPress}>
      Sign up
    </MyButton>
  )}
  ...
>
```

#### Custom error banner

```tsx
import { FormErrorProps } from 'react-native-formik-helper'

<Form
  FormError={({ error, isError }: FormErrorProps) => (
    isError ? <MyErrorBanner message={String(error)} /> : null
  )}
  ...
>
```

---

### `withTextInputField<T>(Component)`

Higher-order component that connects any `TextInput`-compatible component to Formik.

**Props injected into the wrapped component automatically:**

| Prop              | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| `value`           | Current field value from Formik state                             |
| `error`           | Formik validation error string for this field                     |
| `onChangeText`    | Updates Formik state on every keystroke                           |
| `onBlur`          | Marks the field as touched in Formik                              |
| `returnKeyType`   | `"next"` or `"done"` — set automatically by `<Form>`              |
| `blurOnSubmit`    | `false` for all fields except the last, prevents keyboard flicker |
| `onSubmitEditing` | Advances focus to the next field automatically                    |

**Additional props on the field component:**

| Prop   | Type                                          | Description                                                         |
| ------ | --------------------------------------------- | ------------------------------------------------------------------- |
| `name` | `string`                                      | Formik field name (required)                                        |
| `type` | `'email' \| 'password' \| 'digits' \| 'name'` | Applies sensible defaults (`secureTextEntry`, `keyboardType`, etc.) |

**`type` presets:**

| Value      | Effect                                                                         |
| ---------- | ------------------------------------------------------------------------------ |
| `email`    | `keyboardType="email-address"`, `autoCapitalize="none"`, `autoCorrect={false}` |
| `password` | `secureTextEntry={true}`, `autoCapitalize="none"`, `autoCorrect={false}`       |
| `digits`   | `keyboardType="phone-pad"`                                                     |
| `name`     | `autoCorrect={false}`                                                          |

---

### `withBooleanField<T>(Component)`

Higher-order component for toggle/checkbox inputs.

**Props injected automatically:**

| Prop      | Description                             |
| --------- | --------------------------------------- |
| `value`   | Current boolean value from Formik state |
| `error`   | Validation error string                 |
| `onPress` | Toggles the field value                 |

**Required prop:**

| Prop   | Type     | Description       |
| ------ | -------- | ----------------- |
| `name` | `string` | Formik field name |

---

### `Metrics`

A set of consistent spacing constants exported for convenience.

```ts
import { Metrics } from 'react-native-formik-helper'

// Available values (in dp):
// tiny: 4, xxxs: 6, xxs: 8, xs: 12, small: 16, smedium: 18,
// medium: 20, large: 24, xl: 28, xxl: 32, xxxl: 40, huge: 48, massive: 64
// iconHeight: 24
```

---

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
