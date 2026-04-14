import { Ref, forwardRef, useCallback, useImperativeHandle, useState } from 'react'
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { HelperText, TextInput, TouchableRipple } from 'react-native-paper'
import RNDateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import type { InputRef } from 'react-native-formik-helper'

export interface Props {
  label?: string
  value?: Date
  onChange?: (date: Date) => void
  error?: string
  containerStyle?: StyleProp<ViewStyle>
  mode?: 'date' | 'time' | 'datetime'
  minimumDate?: Date
  maximumDate?: Date
  placeholder?: string
}

function DateTimePickerComponent(
  { label, value, onChange, error, containerStyle, mode = 'date', minimumDate, maximumDate, placeholder }: Props,
  ref: Ref<InputRef>
) {
  const [showPicker, setShowPicker] = useState(false)

  useImperativeHandle(ref, () => ({ focus: () => setShowPicker(true) }))
  const defaultPlaceholder =
    mode === 'time' ? 'Select a time' : mode === 'datetime' ? 'Select date & time' : 'Select a date'
  const openPicker = useCallback(() => setShowPicker(true), [])

  const onDateChange = useCallback(
    (event: DateTimePickerEvent, selected?: Date) => {
      if (Platform.OS === 'android') {
        setShowPicker(false)
      }
      if (event.type === 'set' && selected) {
        onChange?.(selected)
      }
      if (event.type === 'dismissed') {
        setShowPicker(false)
      }
    },
    [onChange]
  )

  const formatValue = (date: Date): string => {
    if (mode === 'time') {
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    }
    if (mode === 'datetime') {
      return (
        date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) +
        '  ' +
        date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      )
    }
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const displayValue = value ? formatValue(value) : (placeholder ?? defaultPlaceholder)

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableRipple onPress={openPicker}>
        <View pointerEvents="none">
          <TextInput
            label={label}
            value={displayValue}
            mode="outlined"
            editable={false}
            right={<TextInput.Icon icon="calendar" />}
            error={!!error}
          />
        </View>
      </TouchableRipple>
      {!!error && (
        <HelperText visible type="error">
          {error}
        </HelperText>
      )}
      {showPicker && (
        <RNDateTimePicker
          value={value ?? new Date()}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={onDateChange}
        />
      )}
    </View>
  )
}

export const DateTimePicker = forwardRef(DateTimePickerComponent)

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
})
