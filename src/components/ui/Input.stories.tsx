import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './Input'
import { Label } from './Label'

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
    disabled: {
      control: 'boolean',
    },
    error: {
      control: 'text',
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
}

export const WithError: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="email-error">Email</Label>
      <Input
        id="email-error"
        type="email"
        placeholder="you@example.com"
        error="Please enter a valid email address"
      />
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
    value: 'Cannot edit this',
  },
}

export const Password: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="password">Password</Label>
      <Input id="password" type="password" placeholder="Enter your password" />
    </div>
  ),
}

export const Number: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="amount">Amount (€)</Label>
      <Input id="amount" type="number" placeholder="0.00" step="0.01" />
    </div>
  ),
}

export const WithHelperText: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="siret">SIRET</Label>
      <Input id="siret" placeholder="12345678901234" maxLength={14} />
      <p className="text-xs text-muted-foreground">14 digits required for French businesses</p>
    </div>
  ),
}

export const FormExample: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <div className="space-y-2">
        <Label htmlFor="company">Company Name</Label>
        <Input id="company" placeholder="Acme Corp" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstname">First Name</Label>
          <Input id="firstname" placeholder="John" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastname">Last Name</Label>
          <Input id="lastname" placeholder="Doe" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-email">Email</Label>
        <Input id="contact-email" type="email" placeholder="john@acme.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" type="tel" placeholder="+33 1 23 45 67 89" />
      </div>
    </div>
  ),
}

export const AllStates: Story = {
  render: () => (
    <div className="w-[400px] space-y-6">
      <div className="space-y-2">
        <Label>Default State</Label>
        <Input placeholder="Enter text..." />
      </div>
      <div className="space-y-2">
        <Label>With Value</Label>
        <Input value="Some text content" readOnly />
      </div>
      <div className="space-y-2">
        <Label>With Error</Label>
        <Input error="This field is required" />
      </div>
      <div className="space-y-2">
        <Label>Disabled</Label>
        <Input disabled placeholder="Cannot edit" />
      </div>
    </div>
  ),
}
