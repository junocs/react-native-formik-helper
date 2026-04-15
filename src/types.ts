import type { FormikConfig, FormikValues } from 'formik'
import { ElementType, ForwardRefExoticComponent, FunctionComponent, PropsWithoutRef, RefAttributes } from 'react'
import type { ViewStyle, StyleProp, ReturnKeyTypeOptions } from 'react-native'
import { NativeMethods } from 'react-native'
import { ImageStyle } from 'react-native'
import { TouchableOpacityProps } from 'react-native'
import { TextStyle } from 'react-native'
import { ImageSourcePropType } from 'react-native'

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export interface Styles {
  containerStyle?: StyleProp<ViewStyle>
  errorContainerStyle?: StyleProp<ViewStyle>
  errorMessageStyle?: StyleProp<TextStyle>
  errorIconStyle?: StyleProp<ImageStyle>
  submitButtonStyle?: StyleProp<ViewStyle>
  submitButtonTitleStyle?: StyleProp<ViewStyle>
}

export interface FormErrorProps extends Pick<Styles, 'errorContainerStyle' | 'errorMessageStyle' | 'errorIconStyle'> {
  isError?: boolean
  error?: Record<string, any> | Record<string, any>[] | string | null
  genericErrorMessage?: string
  errorIcon?: ImageSourcePropType
}

export interface SubmitButtonProps
  extends Pick<TouchableOpacityProps, 'disabled'>, Pick<Styles, 'submitButtonStyle' | 'submitButtonTitleStyle'> {
  isLoading?: boolean
  submitButtonTitle?: string
  onPress?: () => void
}

export interface FormProps<T extends FormikValues>
  extends Omit<FormikConfig<T>, 'children'>, FormErrorProps, SubmitButtonProps, Pick<Styles, 'containerStyle'> {
  useDefaultFormError?: boolean
  useDefaultSubmitButton?: boolean
  renderHeader?: FormikConfig<T>['children']
  renderFooter?: FormikConfig<T>['children']
  FormError?: FunctionComponent<FormErrorProps>
  SubmitButton?: FunctionComponent<SubmitButtonProps>
}

export interface InputRef extends Partial<Pick<NativeMethods, 'focus' | 'blur'>> {}

export type WrappedComponentType =
  | ElementType
  | FunctionComponent
  | ForwardRefExoticComponent<PropsWithoutRef<any> & RefAttributes<InputRef>>

export interface GenericFieldProps {
  name: string
}

export type AutoFocusProps = Partial<
  Pick<InputFieldEnhancementProps, 'fieldRegistrationRef' | 'returnKeyType' | 'blurOnSubmit' | 'onSubmitEditing'>
>

export type HasTextInputTypeProps = {
  keyboardType?: string
  secureTextEntry?: boolean
  autoCorrect?: boolean
  autoCapitalize?: string
  onChangeText?: (text: string) => void
  onBlur?: (...args: any[]) => void
}

export type HasSelectTypeProps = {
  onValueChange?: (value: any) => void
}

export type HasDateTypeProps = {
  onChange?: (date: Date) => void
  value?: Date
}

export interface TextInputFieldProps extends GenericFieldProps {
  type?: 'email' | 'password' | 'digits' | 'name'
}

export interface SelectOption<T = string> {
  label: string
  value: T
}

export interface SelectFieldProps<T = string> extends GenericFieldProps {
  options?: SelectOption<T>[]
  onValueChange?: (value: T) => void
}

export interface DateTimeFieldProps extends GenericFieldProps {
  /** Whether to show a date picker, time picker, or both */
  mode?: 'date' | 'time' | 'datetime'
  /** Minimum selectable date/time */
  minimumDate?: Date
  /** Maximum selectable date/time */
  maximumDate?: Date
  onChange?: (date: Date) => void
}

export type FieldRegistrationMap = Map<number, { focus?: () => void }>

export interface InputFieldEnhancementProps {
  returnKeyType: ReturnKeyTypeOptions
  blurOnSubmit: boolean
  onSubmitEditing: () => void
  fieldRegistrationRef: (instance: { focus?: () => void } | null) => void
}

// ---------------------------------------------------------------------------
// withField generic HOC config
// ---------------------------------------------------------------------------

/**
 * Prop-name mapping for `withField`. Override any key to match the prop names
 * your component uses.
 *
 * @default { valueProp: 'value', changeProp: 'onChange', errorProp: 'error', touchedProp: 'touched' }
 */
export interface FieldConfig {
  /** Prop the component uses to receive the current value. @default 'value' */
  valueProp?: string
  /** Prop the component calls when the value changes. @default 'onChange' */
  changeProp?: string
  /** Prop the component uses to display a validation error. @default 'error' */
  errorProp?: string
  /** Prop the component uses to know whether it has been touched. @default 'touched' */
  touchedProp?: string
}
