import {
  ForwardRefRenderFunction,
  Ref,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import {
  WrappedComponentType,
  TextInputFieldProps,
  InputRef,
  GenericFieldProps,
  InputFieldEnhancementProps,
} from './types'
import { useFormikContext } from 'formik'
import type { NativeSyntheticEvent, TextInputChangeEventData } from 'react-native'

type AutoFocusProps = Partial<
  Pick<InputFieldEnhancementProps, 'fieldRegistrationRef' | 'returnKeyType' | 'blurOnSubmit' | 'onSubmitEditing'>
>

type HasTextInputTypeProps = {
  keyboardType?: string
  secureTextEntry?: boolean
  autoCorrect?: boolean
  autoCapitalize?: string
  onChangeText?: (text: string) => void
  onBlur?: (...args: any[]) => void
}

export function withTextInputField<T extends HasTextInputTypeProps>(WrappedComponent: WrappedComponentType) {
  const RenderFn = (
    {
      name,
      type,
      onChangeText: propOnChangeText,
      onBlur: propOnBlur,
      fieldRegistrationRef,
      returnKeyType,
      blurOnSubmit,
      onSubmitEditing,
      ...rest
    }: TextInputFieldProps & T & AutoFocusProps,
    externalRef: Ref<InputRef>
  ) => {
    const { errors, values, setFieldValue, setFieldTouched, isSubmitting } = useFormikContext<Record<string, string>>()

    const innerRef = useRef<InputRef>(null)

    useImperativeHandle(externalRef, () => ({
      focus: () => innerRef.current?.focus?.(),
      blur: () => innerRef.current?.blur?.(),
    }))

    useEffect(() => {
      if (!fieldRegistrationRef) return
      fieldRegistrationRef({ focus: () => innerRef.current?.focus?.() })
      return () => {
        fieldRegistrationRef(null)
      }
    }, [fieldRegistrationRef])

    const defaultProps = useMemo((): Pick<T, 'keyboardType' | 'secureTextEntry' | 'autoCorrect' | 'autoCapitalize'> => {
      if (type === 'email') {
        return { ...rest, autoCorrect: false, autoCapitalize: 'none', keyboardType: 'email-address' }
      }
      if (type === 'password') {
        return { ...rest, autoCorrect: false, autoCapitalize: 'none', secureTextEntry: true }
      }
      if (type === 'digits') {
        return { ...rest, keyboardType: 'phone-pad' }
      }
      if (type === 'name') {
        return { ...rest, autoCorrect: false }
      }
      return { ...rest }
    }, [type, rest])

    const onChangeText = useCallback(
      (text: string) => {
        setFieldValue(name, text)
        propOnChangeText?.(text)
      },
      [propOnChangeText, name, setFieldValue]
    )

    const onBlur = useCallback(
      (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
        setFieldTouched(name, true, !isSubmitting)
        propOnBlur?.(e as any)
      },
      [propOnBlur, name, setFieldTouched, isSubmitting]
    )

    return (
      <WrappedComponent
        ref={innerRef}
        error={errors[name]}
        value={values[name]}
        onChangeText={onChangeText}
        onBlur={onBlur}
        returnKeyType={returnKeyType}
        blurOnSubmit={blurOnSubmit}
        onSubmitEditing={onSubmitEditing}
        {...defaultProps}
      />
    )
  }

  return forwardRef(RenderFn as unknown as ForwardRefRenderFunction<InputRef, any>)
}

export function withBooleanField<T extends any>(WrappedComponent: WrappedComponentType) {
  return ({ name, ...rest }: GenericFieldProps & T) => {
    const { errors, values, setFieldValue } = useFormikContext<Record<string, boolean>>()

    const onValueChanged = useCallback(() => {
      setFieldValue(name, !values[name])
    }, [setFieldValue, values, name])

    return <WrappedComponent {...rest} error={errors[name]} value={values[name]} onPress={onValueChanged} />
  }
}
