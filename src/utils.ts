import { Children, ReactElement, ReactNode, cloneElement, isValidElement } from 'react'
import { FormErrorProps, InputFieldEnhancementProps } from './types'

/**
 * Collects all named form field elements from the children tree.
 * This feeds both the auto-focus enhancement system (for text inputs
 * that call `fieldRegistrationRef`) and the `propsMap` injection via
 * `enhanceFormChildren`. Non-focusable fields (select, date-picker, etc.)
 * receive enhancement props but simply ignore them — they never register
 * via `fieldRegistrationRef` so they are transparently skipped in the
 * keyboard focus chain inside `form.tsx`.
 */
export const getInputFields = (children?: ReactNode | ReactNode[]): ReactElement[] =>
  Children.toArray(children).reduce<ReactElement[]>((partialInputs, childUnknown) => {
    const child = childUnknown as ReactElement
    const childProps = child?.props as { name?: string; children?: ReactNode } | undefined
    if (childProps) {
      if (childProps.name) {
        return partialInputs.concat(child)
      }
      if (childProps.children) {
        return partialInputs.concat(getInputFields(childProps.children))
      }
    }
    return partialInputs
  }, [])

/**
 * Recursively walks the `<Form>` children tree and injects auto-focus
 * enhancement props into every named field element.
 *
 * `propsMap` is built by `form.tsx` and keyed by field `name`. For each
 * matching element it spreads in:
 * - `returnKeyType`       — `'next'` for all but the last focusable field, `'done'` for the last
 * - `blurOnSubmit`        — `false` for intermediate fields (prevents keyboard flicker on advance)
 * - `onSubmitEditing`     — advances focus to the next registered field, or dismisses the keyboard
 * - `fieldRegistrationRef` — callback the field uses to register its `focus()` handle with the Form
 *
 * Fields that don't use the keyboard (e.g. created with `withSelectField` or
 * `withDateTimeField`) receive the same props but use only `fieldRegistrationRef`
 * to register a `focus()` that opens their native picker; the rest are ignored.
 *
 * Wrapper elements (e.g. `<View>`) that have no `name` but do have `children`
 * are cloned with their enhanced subtree so nesting is fully supported.
 */
export const enhanceFormChildren = (
  children: ReactNode | ReactNode[] | undefined,
  propsMap: Map<string, InputFieldEnhancementProps>
): ReactNode[] =>
  Children.toArray(children).map((child) => {
    if (!isValidElement(child)) return child

    const element = child as ReactElement
    const elementProps = element.props as { name?: string; children?: ReactNode } | undefined

    if (elementProps?.name && propsMap.has(elementProps.name)) {
      return cloneElement(element, {
        key: elementProps.name,
        ...propsMap.get(elementProps.name),
      })
    }

    if (elementProps?.children) {
      const enhanced = enhanceFormChildren(elementProps.children, propsMap)
      return cloneElement(element, {}, ...enhanced)
    }

    return child
  })

/**
 * Extracts the first human-readable error string from a Formik/Yup error value,
 * which can arrive in several shapes depending on the validation schema:
 *
 * - `string`   — returned directly (base case)
 * - `string[]` — first element is returned (e.g. array field errors)
 * - `object`   — recursively unwraps the first key's value (e.g. nested object schemas)
 *
 * The function recurses until it finds a plain string or exhausts the structure,
 * returning `null` if no message can be extracted.
 *
 * @example
 * getErrorMessageRecursively('Required')                   // → 'Required'
 * getErrorMessageRecursively(['Too short', 'Invalid'])     // → 'Too short'
 * getErrorMessageRecursively({ street: { city: 'Required' } }) // → 'Required'
 */
export const getErrorMessageRecursively = (error: FormErrorProps['error']): string | null => {
  if (typeof error === 'string') {
    return error
  }
  if (Array.isArray(error) && error.length > 0) {
    const firstError = error[0]
    return typeof firstError === 'string' ? firstError : getErrorMessageRecursively(firstError)
  }
  if (typeof error === 'object' && error !== null) {
    const firstKey = Object.keys(error)[0]
    if (firstKey) {
      const firstError = (error as Record<string, any>)[firstKey]
      return getErrorMessageRecursively(firstError)
    }
  }
  return null
}
