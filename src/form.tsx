import { Formik, FormikHelpers, FormikProps, FormikValues } from 'formik'
import { PropsWithChildren, ReactElement, useCallback, useMemo, useRef } from 'react'

import { FieldRegistrationMap, FormProps, InputFieldEnhancementProps } from './types'
import { Keyboard, ReturnKeyTypeOptions, View } from 'react-native'
import { enhanceFormChildren, getInputFields } from './utils'
import { DefaultFormError, DefaultSubmitButton } from './components'

export function Form<T extends FormikValues>({
  useDefaultFormError = true,
  useDefaultSubmitButton = true,
  onSubmit: propOnSubmit,
  children,
  isLoading,
  error,
  isError,
  genericErrorMessage,
  containerStyle,
  errorContainerStyle,
  errorMessageStyle,
  errorIconStyle,
  submitButtonTitle,
  submitButtonStyle,
  submitButtonTitleStyle,
  FormError = DefaultFormError,
  SubmitButton = DefaultSubmitButton,
  renderHeader,
  renderFooter,
  ...rest
}: PropsWithChildren<FormProps<T>>) {
  const formikRef = useRef<FormikProps<T>>(null)
  const fieldRegistrationMapRef = useRef<FieldRegistrationMap>(new Map())

  const inputFields = useMemo(() => getInputFields(children), [children])

  const onSubmit = useCallback(
    (values: T, formikHelpers: FormikHelpers<T>) => {
      Keyboard.dismiss()
      propOnSubmit?.(values, formikHelpers)
    },
    [propOnSubmit]
  )

  const enhancedChildren = useMemo(() => {
    let lastFocusableIndex = inputFields.length - 1
    if (fieldRegistrationMapRef.current.size > 0) {
      for (let idx = inputFields.length - 1; idx >= 0; idx -= 1) {
        if (fieldRegistrationMapRef.current.has(idx)) {
          lastFocusableIndex = idx
          break
        }
      }
    }

    const propsMap = new Map<string, InputFieldEnhancementProps>()
    inputFields.forEach((field: ReactElement, index: number) => {
      const fieldProps = field.props as {
        name: string
        returnKeyType?: ReturnKeyTypeOptions
        onSubmitEditing?: () => void
      }
      const isLastFocusable = index >= lastFocusableIndex
      const returnKeyType = isLastFocusable ? 'done' : 'next'
      propsMap.set(fieldProps.name, {
        returnKeyType: fieldProps.returnKeyType || returnKeyType,
        blurOnSubmit: isLastFocusable,
        onSubmitEditing: () => {
          for (let nextIdx = index + 1; nextIdx < inputFields.length; nextIdx += 1) {
            const nextInstance = fieldRegistrationMapRef.current.get(nextIdx)
            if (nextInstance?.focus) {
              nextInstance.focus()
              return
            }
          }
          Keyboard.dismiss()
          if (fieldProps.onSubmitEditing) {
            fieldProps.onSubmitEditing()
          }
        },
        fieldRegistrationRef: (instance: { focus?: () => void } | null) => {
          if (instance?.focus) {
            fieldRegistrationMapRef.current.set(index, instance)
          } else {
            fieldRegistrationMapRef.current.delete(index)
          }
        },
      })
    })

    return enhanceFormChildren(children, propsMap)
  }, [inputFields, children])

  return (
    <Formik<T> {...rest} innerRef={formikRef} onSubmit={onSubmit}>
      {({ isValid, handleSubmit, ...props }) => (
        <View style={containerStyle}>
          {typeof renderHeader === 'function' ? renderHeader({ isValid, handleSubmit, ...props }) : renderHeader}
          {enhancedChildren}
          {useDefaultFormError && (
            <FormError
              error={error}
              isError={isError}
              genericErrorMessage={genericErrorMessage}
              errorContainerStyle={errorContainerStyle}
              errorMessageStyle={errorMessageStyle}
              errorIconStyle={errorIconStyle}
            />
          )}
          {useDefaultSubmitButton && (
            <SubmitButton
              disabled={!isValid || isLoading}
              isLoading={isLoading}
              onPress={handleSubmit}
              submitButtonTitle={submitButtonTitle}
              submitButtonStyle={submitButtonStyle}
              submitButtonTitleStyle={submitButtonTitleStyle}
            />
          )}
          {typeof renderFooter === 'function' ? renderFooter({ isValid, handleSubmit, ...props }) : renderFooter}
        </View>
      )}
    </Formik>
  )
}
