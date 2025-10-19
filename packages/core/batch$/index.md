# batch$

Batch multiple Streams together for coordinated updates and combined state management.

## Signature

```typescript
function batch$<T extends any[]>(...streams: { [K in keyof T]: Stream<T[K]> }): Stream<T>

function createStreams<T extends Record<string, any>>(
  initialValues: T
): { [K in keyof T]: Stream<T[K]> }

function batchWithFactory<T extends Record<string, any>>(
  factory: () => T
): {
  streams: { [K in keyof T]: Stream<T[K]> }
  batch$: Stream<T>
}

function combineStreams<T extends Record<string, any>>(streams: {
  [K in keyof T]: Stream<T[K]>
}): Stream<T>
```

## Basic Usage

### Combine Multiple Streams

```tsx
import { batch$ } from 'pipel-react'
import { usePipel, useStream } from 'pipel-react'

function UserProfile() {
  const name$ = useStream('John')
  const age$ = useStream(25)
  const email$ = useStream('john@example.com')

  const user$ = batch$(name$, age$, email$)
  const [user] = usePipel(user$)

  const [name, age, email] = user

  return (
    <div>
      <p>Name: {name}</p>
      <p>Age: {age}</p>
      <p>Email: {email}</p>
      <button onClick={() => name$.next('Jane')}>Change Name</button>
    </div>
  )
}
```

### Create Multiple Streams

```tsx
import { createStreams } from 'pipel-react'

function Form() {
  const { name$, email$, message$ } = createStreams({
    name: '',
    email: '',
    message: '',
  })

  const [name] = usePipel(name$)
  const [email] = usePipel(email$)
  const [message] = usePipel(message$)

  return (
    <form>
      <input value={name} onChange={(e) => name$.next(e.target.value)} placeholder="Name" />
      <input value={email} onChange={(e) => email$.next(e.target.value)} placeholder="Email" />
      <textarea
        value={message}
        onChange={(e) => message$.next(e.target.value)}
        placeholder="Message"
      />
    </form>
  )
}
```

## Advanced Usage

### Batch with Factory

```tsx
import { batchWithFactory } from 'pipel-react'

function Settings() {
  const { streams, batch$ } = batchWithFactory(() => ({
    theme: 'light',
    fontSize: 14,
    language: 'en',
    notifications: true,
  }))

  const [settings] = usePipel(batch$)

  return (
    <div>
      <select value={settings.theme} onChange={(e) => streams.theme$.next(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>

      <input
        type="range"
        min="12"
        max="24"
        value={settings.fontSize}
        onChange={(e) => streams.fontSize$.next(Number(e.target.value))}
      />

      <label>
        <input
          type="checkbox"
          checked={settings.notifications}
          onChange={(e) => streams.notifications$.next(e.target.checked)}
        />
        Enable Notifications
      </label>
    </div>
  )
}
```

### Combine Existing Streams

```tsx
import { combineStreams } from 'pipel-react'

// Existing streams from different sources
const user$ = new Stream({ id: '1', name: 'John' })
const settings$ = new Stream({ theme: 'light' })
const permissions$ = new Stream({ canEdit: true })

function Dashboard() {
  const combined$ = combineStreams({
    user: user$,
    settings: settings$,
    permissions: permissions$,
  })

  const [state] = usePipel(combined$)

  return (
    <div className={state.settings.theme}>
      <h1>Welcome, {state.user.name}</h1>
      {state.permissions.canEdit && <EditButton />}
    </div>
  )
}
```

### Form State Management

```tsx
import { batchWithFactory } from 'pipel-react'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
}

function RegistrationForm() {
  const { streams, batch$ } = batchWithFactory<FormData>(() => ({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  }))

  const [form] = usePipel(batch$)

  const isValid =
    form.firstName.length > 0 &&
    form.lastName.length > 0 &&
    form.email.includes('@') &&
    form.phone.length >= 10

  const handleSubmit = () => {
    if (isValid) {
      submitForm(form)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={form.firstName}
        onChange={(e) => streams.firstName$.next(e.target.value)}
        placeholder="First Name"
      />
      <input
        value={form.lastName}
        onChange={(e) => streams.lastName$.next(e.target.value)}
        placeholder="Last Name"
      />
      <input
        value={form.email}
        onChange={(e) => streams.email$.next(e.target.value)}
        placeholder="Email"
      />
      <input
        value={form.phone}
        onChange={(e) => streams.phone$.next(e.target.value)}
        placeholder="Phone"
      />
      <button type="submit" disabled={!isValid}>
        Register
      </button>
    </form>
  )
}
```

### Coordinated Updates

```tsx
import { batch$ } from 'pipel-react'

function ColorPicker() {
  const r$ = useStream(255)
  const g$ = useStream(0)
  const b$ = useStream(0)

  const color$ = batch$(r$, g$, b$)
  const [color] = usePipel(color$)

  const [r, g, b] = color
  const rgb = `rgb(${r}, ${g}, ${b})`

  return (
    <div>
      <div
        style={{
          width: 100,
          height: 100,
          background: rgb,
        }}
      />
      <label>
        Red: {r}
        <input
          type="range"
          min="0"
          max="255"
          value={r}
          onChange={(e) => r$.next(Number(e.target.value))}
        />
      </label>
      <label>
        Green: {g}
        <input
          type="range"
          min="0"
          max="255"
          value={g}
          onChange={(e) => g$.next(Number(e.target.value))}
        />
      </label>
      <label>
        Blue: {b}
        <input
          type="range"
          min="0"
          max="255"
          value={b}
          onChange={(e) => b$.next(Number(e.target.value))}
        />
      </label>
    </div>
  )
}
```

### Multi-Step Form

```tsx
import { batchWithFactory } from 'pipel-react'

function MultiStepForm() {
  const { streams, batch$ } = batchWithFactory(() => ({
    step: 1,
    personalInfo: { name: '', age: 0 },
    contactInfo: { email: '', phone: '' },
    preferences: { newsletter: false, theme: 'light' },
  }))

  const [state] = usePipel(batch$)

  const nextStep = () => {
    streams.step$.next(state.step + 1)
  }

  const prevStep = () => {
    streams.step$.next(state.step - 1)
  }

  return (
    <div>
      {state.step === 1 && (
        <PersonalInfoStep
          data={state.personalInfo}
          onChange={(data) => streams.personalInfo$.next(data)}
        />
      )}
      {state.step === 2 && (
        <ContactInfoStep
          data={state.contactInfo}
          onChange={(data) => streams.contactInfo$.next(data)}
        />
      )}
      {state.step === 3 && (
        <PreferencesStep
          data={state.preferences}
          onChange={(data) => streams.preferences$.next(data)}
        />
      )}

      <div>
        {state.step > 1 && <button onClick={prevStep}>Back</button>}
        {state.step < 3 && <button onClick={nextStep}>Next</button>}
        {state.step === 3 && <button onClick={handleSubmit}>Submit</button>}
      </div>
    </div>
  )
}
```

## Features

- ✅ Combine multiple Streams
- ✅ Type-safe with TypeScript
- ✅ Automatic updates when any Stream changes
- ✅ Factory pattern support
- ✅ Works with existing Streams
- ✅ No additional re-renders
- ✅ Coordinated state management

## API Reference

### batch$

Combines multiple Streams into a single Stream that emits an array.

```typescript
const combined$ = batch$(stream1$, stream2$, stream3$)
// Emits: [value1, value2, value3]
```

### createStreams

Creates multiple Streams from an object of initial values.

```typescript
const { name$, age$, email$ } = createStreams({
  name: 'John',
  age: 25,
  email: 'john@example.com',
})
```

### batchWithFactory

Creates Streams and a combined Stream in one call.

```typescript
const { streams, batch$ } = batchWithFactory(() => ({
  field1: value1,
  field2: value2,
}))
```

### combineStreams

Combines existing Streams into a single Stream that emits an object.

```typescript
const combined$ = combineStreams({
  user: user$,
  settings: settings$,
})
// Emits: { user: userData, settings: settingsData }
```

## Notes

1. The combined Stream emits whenever **any** source Stream emits
2. All source Streams must have emitted at least once before the combined Stream emits
3. The combined Stream maintains the latest value from each source
4. Type inference works automatically for all functions
5. Streams created with `createStreams` have stable references

## Best Practices

### Use Factory for Complex State

```tsx
// ✅ Good - factory pattern
const { streams, batch$ } = batchWithFactory(() => ({
  user: { name: '', email: '' },
  settings: { theme: 'light' },
  ui: { sidebarOpen: false },
}))

// ❌ Bad - manual creation
const user$ = useStream({ name: '', email: '' })
const settings$ = useStream({ theme: 'light' })
const ui$ = useStream({ sidebarOpen: false })
const combined$ = combineStreams({ user: user$, settings: settings$, ui: ui$ })
```

### Destructure for Clarity

```tsx
// ✅ Good - clear destructuring
const {
  streams: { name$, email$ },
  batch$,
} = batchWithFactory(() => ({
  name: '',
  email: '',
}))

// ✅ Also good - array destructuring
const combined$ = batch$(name$, age$, email$)
const [name, age, email] = usePipel(combined$)[0]
```

## Related

- [usePipel](/core/usePipel/) - Use Stream as React state
- [useStream](/core/useStream/) - Create stable Stream
- [combineStreams](/core/batch$/#combinestreams) - Combine existing Streams
