import {
  ForwardRefExoticComponent,
  PropsWithoutRef,
  Ref,
  RefAttributes,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { HelperText, Menu, TextInput, TouchableRipple } from 'react-native-paper'
import type { InputRef, SelectOption } from 'react-native-formik-helper'

export interface Props<T = string> {
  label?: string
  value?: T
  options?: SelectOption<T>[]
  onValueChange?: (value: T) => void
  error?: string
  containerStyle?: StyleProp<ViewStyle>
  placeholder?: string
}

function SelectInner<T = string>(
  { label, value, options = [], onValueChange, error, containerStyle, placeholder = 'Select an option' }: Props<T>,
  ref: Ref<InputRef>
) {
  const [visible, setVisible] = useState(false)

  useImperativeHandle(ref, () => ({ focus: () => setVisible(true) }))
  const open = useCallback(() => setVisible(true), [])
  const close = useCallback(() => setVisible(false), [])

  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder

  const handleSelect = useCallback(
    (option: SelectOption<T>) => {
      onValueChange?.(option.value)
      close()
    },
    [onValueChange, close]
  )

  return (
    <View style={[styles.container, containerStyle]}>
      <Menu
        visible={visible}
        onDismiss={close}
        anchor={
          <TouchableRipple onPress={open}>
            <View pointerEvents="none">
              <TextInput
                label={label}
                value={selectedLabel}
                mode="outlined"
                editable={false}
                right={<TextInput.Icon icon={visible ? 'chevron-up' : 'chevron-down'} />}
                error={!!error}
              />
            </View>
          </TouchableRipple>
        }
      >
        {options.map((option) => (
          <Menu.Item key={String(option.value)} title={option.label} onPress={() => handleSelect(option)} />
        ))}
      </Menu>
      {!!error && (
        <HelperText visible type="error">
          {error}
        </HelperText>
      )}
    </View>
  )
}

export const Select = forwardRef(SelectInner) as ForwardRefExoticComponent<
  PropsWithoutRef<Props<any>> & RefAttributes<InputRef>
>

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
})
