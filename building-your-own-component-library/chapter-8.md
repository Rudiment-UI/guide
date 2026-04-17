---
title: 'Form components'
description: This chapter builds Select, Checkbox, CheckboxGroup, RadioGroup, and Switch. Each one follows the React Aria hook pattern from the previous chapter.
order: 8
---

This chapter builds Select, Checkbox, CheckboxGroup, RadioGroup, and Switch. Each one follows the React Aria hook pattern from the previous chapter. The implementations get progressively more complex: Select involves a popover, Checkbox supports indeterminate state, and RadioGroup handles arrow key navigation within a group.

## Select

Select is the most complex form component in the library. It combines multiple React Aria hooks: `useSelect` for the trigger button, `useListBox` for the options list, `useOption` for each individual option, and `usePopover` for the floating panel that contains the list. It also uses `useSelectState` from `react-stately`, which manages the open/closed state of the popover and tracks the currently selected option.

```tsx
// src/components/Select/Select.tsx (simplified structure)
// Note: this example references Popover, ListBox, ChevronIcon, and DismissButton
// as helper components internal to the Select implementation. The companion
// repository contains the complete implementations. Here we focus on the hook
// wiring pattern.
import { useRef } from 'react'
import { useSelectState, type SelectState } from 'react-stately'
import {
  useSelect,
  useButton,
  useListBox,
  useOption,
  usePopover,
  HiddenSelect,
} from 'react-aria'
import type { RefObject } from 'react'
import type { Key } from 'react-aria'
import { cn } from '@/utils/cn'
import './select.css'

export interface SelectProps<T extends object> {
  label: string
  items: Iterable<T>
  children: (item: T) => React.ReactNode
  selectedKey?: Key | null
  defaultSelectedKey?: Key | null
  onSelectionChange?: (key: Key | null) => void
  placeholder?: string
  description?: string
  errorMessage?: string
  isRequired?: boolean
  isDisabled?: boolean
  className?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

interface PopoverInternalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: SelectState<any>
  triggerRef: RefObject<HTMLButtonElement | null>
  popoverRef: RefObject<HTMLDivElement | null>
  children: React.ReactNode
}

function Popover({
  state,
  triggerRef,
  popoverRef,
  children,
}: PopoverInternalProps) {
  const { popoverProps } = usePopover({ triggerRef, popoverRef }, state)
  return (
    <div
      {...popoverProps}
      ref={popoverRef}
      className="rudiment-select__popover"
    >
      {children}
    </div>
  )
}

interface ListBoxInternalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: SelectState<any>
  listBoxRef: RefObject<HTMLUListElement | null>
  [key: string]: unknown
}

function ListBox({ state, listBoxRef, ...props }: ListBoxInternalProps) {
  const { listBoxProps } = useListBox(props, state, listBoxRef)
  return (
    <ul {...listBoxProps} ref={listBoxRef} className="rudiment-select__listbox">
      {[...state.collection].map((item) => (
        <Option key={item.key} item={item} state={state} />
      ))}
    </ul>
  )
}

interface OptionInternalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: SelectState<any>
}

function Option({ item, state }: OptionInternalProps) {
  const optionRef = useRef<HTMLLIElement>(null)
  const { optionProps, isSelected, isFocused } = useOption(
    { key: item.key },
    state,
    optionRef,
  )
  return (
    <li
      {...optionProps}
      ref={optionRef}
      className="rudiment-select__option"
      data-focused={isFocused}
      aria-selected={isSelected}
    >
      {item.rendered}
    </li>
  )
}

export function Select<T extends object>(props: SelectProps<T>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const state = useSelectState(props as any)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const listBoxRef = useRef<HTMLUListElement>(null)

  const {
    labelProps,
    triggerProps,
    valueProps,
    menuProps,
    descriptionProps,
    errorMessageProps,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useSelect(props as any, state, triggerRef)

  const { buttonProps } = useButton(triggerProps, triggerRef)

  return (
    <div className={cn('rudiment-select', props.className)}>
      <label {...labelProps} className="rudiment-select__label">
        {props.label}
      </label>
      <HiddenSelect state={state} triggerRef={triggerRef} label={props.label} />
      <button
        {...buttonProps}
        ref={triggerRef}
        className={cn(
          'rudiment-select__trigger',
          props.errorMessage && 'rudiment-select__trigger--error',
        )}
      >
        <span {...valueProps}>
          {state.selectedItem
            ? state.selectedItem.rendered
            : props.placeholder || 'Select an option'}
        </span>
        <ChevronIcon aria-hidden="true" />
      </button>
      {state.isOpen && (
        <Popover state={state} triggerRef={triggerRef} popoverRef={popoverRef}>
          <ListBox {...menuProps} state={state} listBoxRef={listBoxRef} />
        </Popover>
      )}
      {props.description && !props.errorMessage && (
        <p {...descriptionProps} className="rudiment-select__description">
          {props.description}
        </p>
      )}
      {props.errorMessage && (
        <p {...errorMessageProps} className="rudiment-select__error">
          {props.errorMessage}
        </p>
      )}
    </div>
  )
}
```

The `HiddenSelect` component from React Aria renders a hidden native `<select>` element for form submission compatibility. Unlike the hooks imported alongside it, `HiddenSelect` is a React component — the first time a component is imported directly from `react-aria` in this guide rather than following the hook-only pattern. The visible trigger is a `<button>` that opens the popover. The listbox inside the popover handles arrow key navigation, typeahead (type a letter to jump to matching options), and `Home`/`End` to jump to the first/last option.

This is a lot of code for a select input. That's the point. Getting keyboard navigation, ARIA attributes, popover positioning, and focus management right for a select is genuinely difficult. React Aria handles the behavioral complexity so your component code is mostly rendering and styling.

Here's the finished Select rendered from the companion repository's Storybook. Open the popover to exercise the keyboard navigation, typeahead, and focus behavior described above.

::Storybook{url="https://rudiment-ui.netlify.app/?path=/story/components-select--with-description" title="Select in Storybook"}
::

## Checkbox and CheckboxGroup

`useToggleState` from `react-stately` tracks a single boolean on/off value — it's the state layer for any component that toggles between selected and not selected. Checkbox and Switch both use it.

```tsx
// src/components/Checkbox/Checkbox.tsx
import { forwardRef } from 'react'
import { useCheckbox } from 'react-aria'
import { useObjectRef } from '@react-aria/utils'
import { useToggleState } from 'react-stately'
import { cn } from '@/utils/cn'

export interface CheckboxProps {
  children: React.ReactNode
  isSelected?: boolean
  defaultSelected?: boolean
  isIndeterminate?: boolean
  onChange?: (isSelected: boolean) => void
  isDisabled?: boolean
  value?: string
  className?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(props, forwardedRef) {
    const ref = useObjectRef(forwardedRef)
    const state = useToggleState(props)
    const { inputProps } = useCheckbox(props, state, ref)

    return (
      <label
        className={cn(
          'rudiment-checkbox',
          props.isDisabled && 'rudiment-checkbox--disabled',
          props.className,
        )}
      >
        <input {...inputProps} ref={ref} className="rudiment-checkbox__input" />
        <span
          className={cn(
            'rudiment-checkbox__control',
            state.isSelected && 'rudiment-checkbox__control--checked',
            props.isIndeterminate &&
              'rudiment-checkbox__control--indeterminate',
          )}
          aria-hidden="true"
        />
        <span className="rudiment-checkbox__label">{props.children}</span>
      </label>
    )
  },
)
```

The hidden native `<input>` provides the actual checkbox behavior. The `rudiment-checkbox__control` span is the visual indicator, styled via CSS to show a checkmark, dash (indeterminate), or empty box. The `aria-hidden="true"` on the visual indicator prevents screen readers from announcing it twice (once for the hidden input, once for the visual).

Using `forwardRef` here lets a parent component call `.focus()` on the underlying input directly, which matters when you need to programmatically focus a checkbox, for example after form validation reveals an error. The React Aria hooks expect a `RefObject<T>`, but `forwardRef` gives you a `ForwardedRef<T>`, which can be either an object ref or a callback ref. `useObjectRef` from `@react-aria/utils` normalizes both forms into the `RefObject` the hooks need, so you get full compatibility without extra boilerplate. `@react-aria/utils` is already a transitive dependency of `react-aria`, so no new package is required.

`CheckboxGroup` wraps multiple checkboxes with a group label. It uses `useCheckboxGroupState` from `react-stately`, which manages the array of currently selected values across the group.

```tsx
// src/components/Checkbox/CheckboxGroup.tsx
import { useCheckboxGroup } from 'react-aria'
import { useCheckboxGroupState } from 'react-stately'
import { cn } from '@/utils/cn'

export interface CheckboxGroupProps {
  label: string
  description?: string
  value?: string[]
  defaultValue?: string[]
  onChange?: (value: string[]) => void
  isDisabled?: boolean
  errorMessage?: string
  children: React.ReactNode
  className?: string
}

export function CheckboxGroup(props: CheckboxGroupProps) {
  const state = useCheckboxGroupState(props)
  const { groupProps, labelProps, descriptionProps, errorMessageProps } =
    useCheckboxGroup(props, state)

  return (
    <div
      {...groupProps}
      className={cn('rudiment-checkbox-group', props.className)}
    >
      <span {...labelProps} className="rudiment-checkbox-group__label">
        {props.label}
      </span>
      {props.children}
      {props.description && !props.errorMessage && (
        <p
          {...descriptionProps}
          className="rudiment-checkbox-group__description"
        >
          {props.description}
        </p>
      )}
      {props.errorMessage && (
        <p {...errorMessageProps} className="rudiment-checkbox-group__error">
          {props.errorMessage}
        </p>
      )}
    </div>
  )
}
```

Here's the finished Checkbox rendered from the companion repository's Storybook, including the indeterminate state and grouped variants.

::Storybook{url="https://rudiment-ui.netlify.app/?path=/story/components-checkbox--group" title="Checkbox in Storybook"}
::

## RadioGroup

RadioGroup has an important keyboard behavior difference from individual checkboxes: arrow keys move the selection between radio options within the group, while Tab moves focus into and out of the group (not between options). React Aria handles this automatically. `useRadioGroupState` from `react-stately` tracks the currently selected value within the group.

```tsx
// src/components/RadioGroup/RadioGroup.tsx
import { useRadioGroup } from 'react-aria'
import { useRadioGroupState } from 'react-stately'
import { cn } from '@/utils/cn'

export interface RadioGroupProps {
  label: string
  description?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  isDisabled?: boolean
  errorMessage?: string
  children: React.ReactNode
  className?: string
}

export function RadioGroup(props: RadioGroupProps) {
  const state = useRadioGroupState(props)
  const { radioGroupProps, labelProps, descriptionProps, errorMessageProps } =
    useRadioGroup(props, state)

  return (
    <div
      {...radioGroupProps}
      className={cn('rudiment-radio-group', props.className)}
    >
      <span {...labelProps} className="rudiment-radio-group__label">
        {props.label}
      </span>
      <div
        className={cn(
          'rudiment-radio-group__options',
          props.orientation === 'horizontal' &&
            'rudiment-radio-group__options--horizontal',
        )}
      >
        {props.children}
      </div>
      {props.description && !props.errorMessage && (
        <p {...descriptionProps} className="rudiment-radio-group__description">
          {props.description}
        </p>
      )}
      {props.errorMessage && (
        <p {...errorMessageProps} className="rudiment-radio-group__error">
          {props.errorMessage}
        </p>
      )}
    </div>
  )
}
```

The individual `Radio` component uses `useRadio` and receives the group state via React context (set up internally by React Aria). The implementation follows the same hidden-input-plus-visual-indicator pattern as Checkbox.

Both `CheckboxGroup` and `RadioGroup` include a `description` prop and spread `descriptionProps` onto a visible element, following the same pattern established in Chapter 7's Input. The description is hidden when an error is active, so screen readers don't announce both simultaneously.

Here's the finished RadioGroup rendered from the companion repository's Storybook. Use the arrow keys once focus is inside the group to see the keyboard behavior described above.

::Storybook{url="https://rudiment-ui.netlify.app/?path=/story/components-radiogroup--with-description" title="RadioGroup in Storybook"}
::

## Switch

Switch is semantically distinct from Checkbox. A checkbox is a selection control ("agree to terms"). A switch is a toggle control ("enable notifications"). The distinction matters for screen reader users: `role="switch"` communicates a different interaction model than `role="checkbox"`.

```tsx
// src/components/Switch/Switch.tsx
import { forwardRef } from 'react'
import { useSwitch, VisuallyHidden } from 'react-aria'
import { useObjectRef } from '@react-aria/utils'
import { useToggleState } from 'react-stately'
import { cn } from '@/utils/cn'

export interface SwitchProps {
  children: React.ReactNode
  isSelected?: boolean
  defaultSelected?: boolean
  onChange?: (isSelected: boolean) => void
  isDisabled?: boolean
  className?: string
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  function Switch(props, forwardedRef) {
    const ref = useObjectRef(forwardedRef)
    const state = useToggleState(props)
    const { inputProps } = useSwitch(props, state, ref)

    return (
      <label
        className={cn(
          'rudiment-switch',
          props.isDisabled && 'rudiment-switch--disabled',
          props.className,
        )}
      >
        <VisuallyHidden>
          <input {...inputProps} ref={ref} />
        </VisuallyHidden>
        <span
          className={cn(
            'rudiment-switch__track',
            state.isSelected && 'rudiment-switch__track--on',
          )}
          aria-hidden="true"
        >
          <span className="rudiment-switch__thumb" />
        </span>
        <span className="rudiment-switch__label">{props.children}</span>
      </label>
    )
  },
)
```

`VisuallyHidden` is a React Aria utility that hides the native input from sight while keeping it accessible to screen readers. The visible switch track and thumb are styled via CSS to animate between on and off positions.

Here's the finished Switch rendered from the companion repository's Storybook. Toggle it to see the track-and-thumb animation described above.

::Storybook{url="https://rudiment-ui.netlify.app/?path=/story/components-switch--all-states" title="Switch in Storybook"}
::

## What you have now

All form components are built: Button, IconButton, Input, Select, Checkbox, CheckboxGroup, RadioGroup, Switch. Each uses React Aria for behavior and accessibility, with your token-driven CSS handling the visual layer. You can compose a complete form using these components inside a Stack:

```tsx
// Example roles data for the Select component
const roles = [
  { id: 'design', name: 'Design' },
  { id: 'engineering', name: 'Engineering' },
  { id: 'product', name: 'Product' },
]

;<Stack space="1.5rem" style={{ maxWidth: '24rem' }}>
  <Input label="Name" isRequired />
  <Input label="Email" type="email" isRequired />
  <Select label="Role" placeholder="Choose a role" items={roles}>
    {(role) => <span key={role.id}>{role.name}</span>}
  </Select>
  <CheckboxGroup label="Interests">
    <Checkbox value="design">Design</Checkbox>
    <Checkbox value="engineering">Engineering</Checkbox>
    <Checkbox value="product">Product</Checkbox>
  </CheckboxGroup>
  <Switch>Receive email updates</Switch>
  <Button variant="primary">Submit</Button>
</Stack>
```

Every form element now behaves the same way: a React Aria hook supplies the accessibility layer, your CSS supplies the visuals, and layout primitives from chapters 4 and 5 arrange them on the page without any form-specific layout code. The next chapter steps beyond forms into the overlays and feedback surfaces — Dialog, Tooltip, Alert, Badge, Card, and Tabs — that sit on top of this interactive layer.
