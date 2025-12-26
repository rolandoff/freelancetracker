import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card'
import { Button } from './Button'

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardContent className="p-6">
        <p>This is a basic card with just content.</p>
      </CardContent>
    </Card>
  ),
}

export const WithHeader: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>This is a card with a header and description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here. You can put any content inside the card body.</p>
      </CardContent>
    </Card>
  ),
}

export const WithFooter: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Confirm Action</CardTitle>
        <CardDescription>Are you sure you want to proceed?</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This action cannot be undone. Please confirm your choice.</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Confirm</Button>
      </CardFooter>
    </Card>
  ),
}

export const FormCard: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Login Form</CardTitle>
        <CardDescription>Enter your credentials to continue</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="primary">
          Sign In
        </Button>
      </CardFooter>
    </Card>
  ),
}

export const StatsCard: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardHeader>
        <CardDescription>Total Revenue</CardDescription>
        <CardTitle className="text-3xl">€24,500</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          <span className="text-green-600">+12.5%</span> from last month
        </p>
      </CardContent>
    </Card>
  ),
}

export const ClientCard: Story = {
  render: () => (
    <Card className="w-[400px] hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Acme Corp</CardTitle>
            <CardDescription>contact@acme.com</CardDescription>
          </div>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            Active
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">SIRET:</span>
          <span className="font-medium">123 456 789 01234</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">City:</span>
          <span>Paris</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Projects:</span>
          <span>3 active</span>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="ghost" size="sm" className="flex-1">
          Edit
        </Button>
        <Button variant="ghost" size="sm" className="flex-1">
          View Details
        </Button>
      </CardFooter>
    </Card>
  ),
}
