import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { FRENCH_LEGAL } from '@/lib/constants'
import { formatCurrency } from '@/utils/format'
import type { UserSettings } from '@/types/database.types'

export function LegalSettings() {
  const { user } = useAuth()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [formData, setFormData] = useState<Partial<UserSettings>>({
    tva_applicable: false,
    taux_cotisations: FRENCH_LEGAL.TAUX_COTISATIONS_BNC,
    plafond_ca_annuel: FRENCH_LEGAL.PLAFOND_CA,
  })

  const loadUserSettings = useCallback(async () => {
    if (!user) {
      setLoadingData(false)
      return
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('user_settings')
        .select('tva_applicable, taux_cotisations, plafond_ca_annuel')
        .eq('user_id', user.id)
        .single()

      if (fetchError) throw fetchError

      if (data) {
        setFormData(data)
      }
    } catch (err) {
      console.error('Error loading settings:', err)
    } finally {
      setLoadingData(false)
    }
  }, [user])

  useEffect(() => {
    loadUserSettings()
  }, [loadUserSettings])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    setLoading(true)

    try {
      const { error: updateError } = await supabase
        .from('user_settings')
        // @ts-expect-error - Supabase type issue with Database generic
        .update({
          tva_applicable: formData.tva_applicable,
          taux_cotisations: formData.taux_cotisations,
          plafond_ca_annuel: formData.plafond_ca_annuel,
        })
        .eq('user_id', user.id)

      if (updateError) throw updateError

      success('Paramètres mis à jour', 'Vos paramètres fiscaux ont été enregistrés')
    } catch (err) {
      error('Erreur', err instanceof Error ? err.message : 'Impossible de mettre à jour les paramètres')
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Paramètres Fiscaux</CardTitle>
          <CardDescription>Configuration pour le régime micro-entrepreneur français</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* TVA */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  id="tva_applicable"
                  name="tva_applicable"
                  type="checkbox"
                  checked={formData.tva_applicable || false}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-4 w-4 rounded border-border"
                />
                <Label htmlFor="tva_applicable" className="cursor-pointer">
                  TVA applicable
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Cochez si vous dépassez le seuil de {formatCurrency(FRENCH_LEGAL.TVA_THRESHOLD)}
              </p>
            </div>

            {/* Taux Cotisations */}
            <div className="space-y-2">
              <Label htmlFor="taux_cotisations">
                Taux de cotisations sociales (%) - URSSAF
              </Label>
              <Input
                id="taux_cotisations"
                name="taux_cotisations"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.taux_cotisations || FRENCH_LEGAL.TAUX_COTISATIONS_BNC}
                onChange={handleChange}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                Par défaut: {FRENCH_LEGAL.TAUX_COTISATIONS_BNC}% pour BNC en 2025
              </p>
            </div>

            {/* Plafond CA */}
            <div className="space-y-2">
              <Label htmlFor="plafond_ca_annuel">Plafond de CA annuel (€)</Label>
              <Input
                id="plafond_ca_annuel"
                name="plafond_ca_annuel"
                type="number"
                step="0.01"
                min="0"
                value={formData.plafond_ca_annuel || FRENCH_LEGAL.PLAFOND_CA}
                onChange={handleChange}
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                Plafond micro-entrepreneur: {formatCurrency(FRENCH_LEGAL.PLAFOND_CA)}
              </p>
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

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informations Légales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">Article 293B du CGI</h4>
            <p className="text-muted-foreground">{FRENCH_LEGAL.ARTICLE_293B}</p>
          </div>

          <div>
            <h4 className="font-medium mb-1">Seuils à surveiller</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>
                Seuil TVA: {formatCurrency(FRENCH_LEGAL.TVA_THRESHOLD)} (obligation de facturer la
                TVA)
              </li>
              <li>
                Plafond CA: {formatCurrency(FRENCH_LEGAL.PLAFOND_CA)} (limite micro-entrepreneur)
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-1">Taux de cotisations 2025</h4>
            <p className="text-muted-foreground">
              {FRENCH_LEGAL.TAUX_COTISATIONS_BNC}% pour les BNC (Bénéfices Non Commerciaux) -
              Services, conseil, prestations intellectuelles
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
