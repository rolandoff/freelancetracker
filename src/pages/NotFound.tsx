import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Home, ArrowLeft } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="text-8xl font-bold text-primary-500 mb-4">404</div>
          <h1 className="text-3xl font-bold mb-2">Page introuvable</h1>
          <p className="text-muted-foreground">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="secondary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <Button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            variant="primary"
          >
            <Home className="w-4 h-4 mr-2" />
            Accueil
          </Button>
        </div>
      </div>
    </div>
  )
}
