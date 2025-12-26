import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { validateEmail } from '@/utils/validation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { ROUTES } from '@/lib/constants'

export function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      setError(emailValidation.error || '')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setSuccess(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue')
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
          <p className="text-muted-foreground mt-2">Réinitialisation du mot de passe</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mot de passe oublié</CardTitle>
            <CardDescription>
              Entrez votre email pour recevoir un lien de réinitialisation
            </CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="rounded-md bg-success-50 dark:bg-success-900 p-4 text-sm text-success-700 dark:text-success-300">
                  <p className="font-medium mb-1">Email envoyé!</p>
                  <p>
                    Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser
                    votre mot de passe.
                  </p>
                </div>

                <Link to={ROUTES.LOGIN}>
                  <Button variant="secondary" className="w-full">
                    Retour à la connexion
                  </Button>
                </Link>
              </div>
            ) : (
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
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    error={error}
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" isLoading={loading}>
                  Envoyer le lien de réinitialisation
                </Button>

                {/* Back to Login */}
                <div className="text-center">
                  <Link
                    to={ROUTES.LOGIN}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    ← Retour à la connexion
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
