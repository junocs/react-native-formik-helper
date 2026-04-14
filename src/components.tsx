import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { FormErrorProps, SubmitButtonProps } from './types'
import { getErrorMessageRecursively } from './utils'
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

const styles = StyleSheet.create({
  errorText: {
    flex: 1,
    color: 'white',
  },
  errorIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B22D1D',
  },
  submitButton: {
    marginTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    padding: 16,
    backgroundColor: 'forestgreen',
  },
  submitButtonTitle: {
    color: 'white',
  },
})
