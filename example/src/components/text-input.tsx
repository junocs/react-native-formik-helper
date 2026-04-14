import { Ref, forwardRef, useCallback, useState } from 'react'
import { StyleProp, StyleSheet, TextInput as RNTextInput, View, ViewStyle } from 'react-native'
import { HelperText, TextInput as MUITextInput, TextInputProps } from 'react-native-paper'

export interface Props extends Omit<TextInputProps, 'error'> {
  error?: string
  containerStyle?: StyleProp<ViewStyle>
}

export const TextInput = forwardRef(
  (
    {
      error,
      containerStyle,
      mode = 'outlined',
      underlineColorAndroid = 'transparent',
      onBlur: propOnBlur,
      onFocus: propOnFocus,
      ...rest
    }: Props,
    ref: Ref<RNTextInput>
  ) => {
    const [, setFocused] = useState(false)
    const [touched, setTouched] = useState(false)

    const onBlur = useCallback(
      (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
        setFocused(false)
        setTouched(true)
        propOnBlur?.(e as any)
      },
      [propOnBlur]
    )

    const onFocus = useCallback(
      (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
        setFocused(true)
        propOnFocus?.(e as any)
      },
      [propOnFocus]
    )

    return (
      <View style={[styles.container, containerStyle]}>
        <MUITextInput
          ref={ref}
          mode={mode}
          underlineColorAndroid={underlineColorAndroid}
          onFocus={onFocus}
          onBlur={onBlur}
          {...rest}
        />
        {!!error && touched && (
          <HelperText visible type="error">
            {error}
          </HelperText>
        )}
      </View>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
})
