import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { validateEmail, validateRequired } from '@/utils/validation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { ROUTES } from '@/lib/constants'

export function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.error || ''
    }

    const passwordValidation = validateRequired(formData.password, 'Mot de passe')
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.error || ''
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      if (data.user) {
        navigate(ROUTES.DASHBOARD)
      }
    } catch (error: any) {
      setErrors({ submit: error.message || 'Email ou mot de passe incorrect' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 rounded-lg bg-primary-500 flex items-center justify-center text-white text-2xl font-bold mb-4">
            FT
          </div>
          <h1 className="text-3xl font-bold">FreelanceTracker</h1>
          <p className="text-muted-foreground mt-2">Connexion à votre compte</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" required>
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" required>
                    Mot de passe
                  </Label>
                  <Link
                    to={ROUTES.FORGOT_PASSWORD}
                    className="text-xs text-primary-600 hover:underline"
                  >
                    Mot de passe oublié?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="rounded-md bg-error-50 dark:bg-error-900 p-3 text-sm text-error-700 dark:text-error-300">
                  {errors.submit}
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" isLoading={loading}>
                Se connecter
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Pas encore de compte? </span>
              <Link to={ROUTES.REGISTER} className="text-primary-600 hover:underline font-medium">
                S'inscrire
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
