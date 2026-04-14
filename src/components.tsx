import { useMemo } from 'react'
import { View } from 'react-native'
import { FormErrorProps, SubmitButtonProps } from './types'
import { getErrorMessageRecursively } from './utils'
import styles from './styles'
import { Text } from 'react-native'
import { Image } from 'react-native'
import { TouchableOpacity } from 'react-native'

export const DefaultFormError: React.FC<FormErrorProps> = ({
  error,
  isError,
  genericErrorMessage,
  errorIcon,
  errorContainerStyle,
  errorMessageStyle,
  errorIconStyle,
}) => {
  const errorMessage = useMemo(() => {
    if (isError) {
      return getErrorMessageRecursively(error) || genericErrorMessage
    }
    return null
  }, [error, isError, genericErrorMessage])
  if (!errorMessage) return null
  return (
    <View style={[styles.errorContainer, errorContainerStyle]}>
      {errorIcon && <Image style={[styles.errorIcon, errorIconStyle]} source={errorIcon} resizeMode="contain" />}
      <Text style={[styles.errorText, errorMessageStyle]}>{errorMessage}</Text>
    </View>
  )
}

export const DefaultSubmitButton: React.FC<SubmitButtonProps> = ({
  submitButtonStyle,
  submitButtonTitleStyle,
  submitButtonTitle,
  ...rest
}) => {
  return (
    <TouchableOpacity style={[styles.submitButton, submitButtonStyle]} {...rest}>
      <Text style={[styles.submitButtonTitle, submitButtonTitleStyle]}>{submitButtonTitle}</Text>
    </TouchableOpacity>
  )
}
