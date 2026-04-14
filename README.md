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
- Convert any React Native input into a Formik field with `withTextInputField`, `withBooleanField`, `withSelectField`, `withDateTimeField`, or the generic `withField`
- Hook-based alternative: `useTextInputField`, `useBooleanField`, `useSelectField`, `useDateTimeField` for full rendering control
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
import { withTextInputField, withBooleanField, withSelectField, withDateTimeField } from 'react-native-formik-helper'
import { TextInput, TextInputProps } from './components/TextInput'
import { Checkbox, CheckboxProps } from './components/Checkbox'
import { Select, SelectProps } from './components/Select'
import { DateTimePicker, DateTimePickerProps } from './components/DateTimePicker'

// Create typed field components once, reuse everywhere
const NameField = withTextInputField<TextInputProps>(TextInput)
const EmailField = withTextInputField<TextInputProps>(TextInput)
const PasswordField = withTextInputField<TextInputProps>(TextInput)
const CheckboxField = withBooleanField<CheckboxProps>(Checkbox)
const CountryField = withSelectField<SelectProps>(Select)
const BirthDateField = withDateTimeField<DateTimePickerProps>(DateTimePicker)
```

Your wrapped component receives Formik-connected props (`value`, `error`, and the appropriate change handler) automatically. Any extra props you pass are forwarded to the underlying component unchanged.

### 2. Use `<Form>` to compose them

```tsx
import React, { useCallback } from 'react'
import * as yup from 'yup'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native'
import { Form, SelectOption } from 'react-native-formik-helper'

const COUNTRY_OPTIONS: SelectOption[] = [
  { label: 'United States', value: 'us' },
  { label: 'United Kingdom', value: 'gb' },
]

const Fields = {
  name: 'name',
  email: 'email',
  password: 'password',
  country: 'country',
  birthDate: 'birthDate',
  acceptedTos: 'acceptedTos',
}

type FormValues = {
  name: string
  email: string
  password: string
  country: string
  birthDate: Date | undefined
  acceptedTos: boolean
}

const validationSchema = yup.object().shape({
  [Fields.name]: yup.string().min(2).max(64).required(),
  [Fields.email]: yup.string().email().required(),
  [Fields.password]: yup.string().min(8).max(50).required(),
  [Fields.country]: yup.string().required('Please select your country'),
  [Fields.birthDate]: yup.date().required('Date of birth is required'),
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
          initialValues={{
            name: '',
            email: '',
            password: '',
            country: '',
            birthDate: undefined,
            acceptedTos: false,
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <NameField name={Fields.name} label="Full name" type="name" />
          <EmailField name={Fields.email} label="Email address" type="email" />
          <PasswordField name={Fields.password} label="Password" type="password" />
          <CountryField name={Fields.country} label="Country" options={COUNTRY_OPTIONS} />
          <BirthDateField name={Fields.birthDate} label="Date of birth" mode="date" />
          <CheckboxField name={Fields.acceptedTos} label="I agree to terms and conditions" />
        </Form>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({ container: { flex: 1 } })
```

Focus advances from one text field to the next automatically — no `ref` wiring required. Select and date fields are transparently skipped in the keyboard focus chain.

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
| `containerStyle`           | `StyleProp<ViewStyle>`      | —        | Style for the outer container `View`                      |
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
| `touched`         | Whether the field has been touched (`setFieldTouched` called)     |
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

| Prop      | Description                                            |
| --------- | ------------------------------------------------------ |
| `value`   | Current boolean value from Formik state                |
| `error`   | Validation error string                                |
| `touched` | Whether the field has been touched                     |
| `onPress` | Toggles the field value and marks the field as touched |

**Required prop:**

| Prop   | Type     | Description       |
| ------ | -------- | ----------------- |
| `name` | `string` | Formik field name |

---

### `withSelectField<T, V>(Component)`

Higher-order component for dropdown / picker inputs. The value type `V` defaults to `string` but can be any serialisable type.

**Props injected automatically:**

| Prop            | Description                                                 |
| --------------- | ----------------------------------------------------------- |
| `value`         | Currently selected value from Formik state                  |
| `error`         | Validation error string                                     |
| `touched`       | Whether the field has been touched                          |
| `onValueChange` | Updates Formik state and marks the field as touched on pick |

**Additional props on the field component:**

| Prop      | Type                | Description                                   |
| --------- | ------------------- | --------------------------------------------- |
| `name`    | `string`            | Formik field name (required)                  |
| `options` | `SelectOption<V>[]` | List of `{ label, value }` options to display |

**`SelectOption<V>` type:**

```ts
interface SelectOption<V = string> {
  label: string
  value: V
}
```

**Example:**

```tsx
const COUNTRY_OPTIONS: SelectOption[] = [
  { label: 'United States', value: 'us' },
  { label: 'Canada',        value: 'ca' },
]

const CountryField = withSelectField<SelectProps>(Select)
<CountryField name="country" label="Country" options={COUNTRY_OPTIONS} />
```

---

### `withDateTimeField<T>(Component)`

Higher-order component for date, time, or date-time picker inputs.

**Props injected automatically:**

| Prop       | Description                                                 |
| ---------- | ----------------------------------------------------------- |
| `value`    | Current `Date` (or `undefined`) from Formik state           |
| `error`    | Validation error string                                     |
| `touched`  | Whether the field has been touched                          |
| `onChange` | Updates Formik state and marks the field as touched on pick |

**Additional props on the field component:**

| Prop          | Type                             | Description                                   |
| ------------- | -------------------------------- | --------------------------------------------- |
| `name`        | `string`                         | Formik field name (required)                  |
| `mode`        | `'date' \| 'time' \| 'datetime'` | Picker mode (passed through to the component) |
| `minimumDate` | `Date`                           | Earliest selectable date/time                 |
| `maximumDate` | `Date`                           | Latest selectable date/time                   |

**Example:**

```tsx
const BirthDateField = withDateTimeField<DateTimePickerProps>(DateTimePicker)

// Date only
<BirthDateField name="birthDate" mode="date" maximumDate={new Date()} />

// Date + time (e.g. appointment booking)
const AppointmentField = withDateTimeField<DateTimePickerProps>(DateTimePicker)
<AppointmentField name="appointmentAt" mode="datetime" />
```

---

## Hooks

Every HOC has a hook equivalent for when you want full control over rendering without wrapping a component.
All hooks return `touched` alongside `error` so you can gate error display on interaction.

### `useTextInputField(name, options?)`

Returns Formik-connected props for a text input. Supports the same `type` presets as `withTextInputField`.

```tsx
function EmailInput({ name }: { name: string }) {
  const { value, onChangeText, onBlur, error, touched, ...typeProps } = useTextInputField(name, { type: 'email' })

  return (
    <TextInput
      {...typeProps}
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      error={touched ? error : undefined}
    />
  )
}
```

**Returns:**

| Key               | Type                     | Description                             |
| ----------------- | ------------------------ | --------------------------------------- |
| `value`           | `string`                 | Current field value                     |
| `error`           | `string \| undefined`    | Validation error                        |
| `touched`         | `boolean \| undefined`   | Whether the field has been touched      |
| `onChangeText`    | `(text: string) => void` | Updates Formik state on every keystroke |
| `onBlur`          | `() => void`             | Marks the field as touched              |
| `keyboardType`    | `string?`                | Set by `type` preset                    |
| `secureTextEntry` | `boolean?`               | Set by `type: 'password'`               |
| `autoCorrect`     | `boolean?`               | Set by `type` preset                    |
| `autoCapitalize`  | `string?`                | Set by `type` preset                    |

---

### `useBooleanField(name)`

```tsx
function TosCheckbox({ name }: { name: string }) {
  const { value, onPress, error, touched } = useBooleanField(name)
  return <Checkbox checked={value} onPress={onPress} errorMessage={touched ? error : undefined} />
}
```

**Returns:** `value: boolean`, `onPress: () => void`, `error`, `touched`

---

### `useSelectField<V>(name)`

```tsx
function CountrySelect({ name }: { name: string }) {
  const { value, onValueChange, error, touched } = useSelectField<string>(name)
  return (
    <Select value={value} onValueChange={onValueChange} options={COUNTRY_OPTIONS} error={touched ? error : undefined} />
  )
}
```

**Returns:** `value: V | undefined`, `onValueChange: (v: V) => void`, `error`, `touched`

---

### `useDateTimeField(name)`

```tsx
function BirthDateInput({ name }: { name: string }) {
  const { value, onChange, error, touched } = useDateTimeField(name)
  return <DatePicker value={value} onChange={onChange} mode="date" error={touched ? error : undefined} />
}
```

**Returns:** `value: Date | undefined`, `onChange: (d: Date) => void`, `error`, `touched`

---

## `withField<T, V>(Component, config?)`

Generic escape-hatch HOC for components that don't fit the four specific patterns. Connects any component to Formik by mapping its prop names to Formik state.

**`FieldConfig` options:**

| Option        | Type     | Default      | Description                           |
| ------------- | -------- | ------------ | ------------------------------------- |
| `valueProp`   | `string` | `'value'`    | Prop the component uses to show value |
| `changeProp`  | `string` | `'onChange'` | Prop called when the value changes    |
| `errorProp`   | `string` | `'error'`    | Prop for displaying the error string  |
| `touchedProp` | `string` | `'touched'`  | Prop for the touched boolean          |

**Example:**

```tsx
// A star-rating component whose change handler is called onRatingChange
const RatingField = withField<RatingProps, number>(StarRating, {
  changeProp: 'onRatingChange',
})
<RatingField name="rating" maxStars={5} />

// A color picker with fully custom prop names
const ColorField = withField<ColorPickerProps, string>(ColorPicker, {
  valueProp: 'selectedColor',
  changeProp: 'onColorSelected',
})
<ColorField name="brandColor" />
```

---

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
