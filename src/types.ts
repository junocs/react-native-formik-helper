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

export interface TextInputFieldProps extends GenericFieldProps {
  type?: 'email' | 'password' | 'digits' | 'name'
}

export type FieldRegistrationMap = Map<number, { focus?: () => void }>

export interface InputFieldEnhancementProps {
  returnKeyType: ReturnKeyTypeOptions
  blurOnSubmit: boolean
  onSubmitEditing: () => void
  fieldRegistrationRef: (instance: { focus?: () => void } | null) => void
}
