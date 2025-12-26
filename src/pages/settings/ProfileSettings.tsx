import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/lib/supabase'
import { validateSIRET } from '@/utils/validation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import type { UserSettings } from '@/types/database.types'

export function ProfileSettings() {
  const { user } = useAuth()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<Partial<UserSettings>>({
    company_name: '',
    siret: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'FR',
  })

  const loadUserSettings = useCallback(async () => {
    if (!user) {
      setLoadingData(false)
      return
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError) throw fetchError

      if (data) {
        setFormData(data)
      }
    } catch (err) {
      console.error('Error loading user settings:', err)
    } finally {
      setLoadingData(false)
    }
  }, [user])

  useEffect(() => {
    loadUserSettings()
  }, [loadUserSettings])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (formData.siret) {
      const siretValidation = validateSIRET(formData.siret)
      if (!siretValidation.valid) {
        newErrors.siret = siretValidation.error || ''
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate() || !user) {
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase
        .from('user_settings')
        // @ts-expect-error - Supabase type issue with Database generic
        .update({
          company_name: formData.company_name,
          siret: formData.siret,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postal_code,
          country: formData.country,
        })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      success('Profil mis à jour', 'Vos informations ont été enregistrées avec succès')
    } catch (err) {
      error('Erreur', err instanceof Error ? err.message : 'Impossible de mettre à jour le profil')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations de Profil</CardTitle>
        <CardDescription>
          Configurez vos informations d'entreprise et de facturation
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="company_name">Nom de l'entreprise</Label>
            <Input
              id="company_name"
              name="company_name"
              value={formData.company_name || ''}
              onChange={handleChange}
              placeholder="Mon Entreprise SARL"
              disabled={loading}
            />
          </div>

          {/* SIRET */}
          <div className="space-y-2">
            <Label htmlFor="siret">SIRET</Label>
            <Input
              id="siret"
              name="siret"
              value={formData.siret || ''}
              onChange={handleChange}
              placeholder="12345678901234"
              maxLength={14}
              error={errors.siret}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              14 chiffres - Requis pour la facturation légale en France
            </p>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              placeholder="123 Rue de la Paix"
              disabled={loading}
            />
          </div>

          {/* City & Postal Code */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="postal_code">Code postal</Label>
              <Input
                id="postal_code"
                name="postal_code"
                value={formData.postal_code || ''}
                onChange={handleChange}
                placeholder="75001"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                name="city"
                value={formData.city || ''}
                onChange={handleChange}
                placeholder="Paris"
                disabled={loading}
              />
            </div>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">Pays</Label>
            <Input
              id="country"
              name="country"
              value={formData.country || 'FR'}
              onChange={handleChange}
              placeholder="FR"
              maxLength={2}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Code ISO 2 lettres (ex: FR, BE, CH)</p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button type="submit" isLoading={loading}>
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
