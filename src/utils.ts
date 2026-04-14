import { Children, ReactElement, ReactNode, cloneElement, isValidElement } from 'react'
import { FormErrorProps, InputFieldEnhancementProps } from './types'

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
