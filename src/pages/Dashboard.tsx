export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenue sur votre tableau de bord
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">CA Mensuel</h3>
          <p className="text-2xl font-bold">0,00 €</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">CA Annuel</h3>
          <p className="text-2xl font-bold">0,00 €</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Activités Actives</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Factures en Attente</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Actions Rapides</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <button className="rounded-md border border-border p-4 text-left hover:bg-accent transition-colors">
            <div className="text-2xl mb-2">📝</div>
            <h3 className="font-medium">Nouvelle Activité</h3>
            <p className="text-sm text-muted-foreground">Créer une nouvelle tâche</p>
          </button>
          <button className="rounded-md border border-border p-4 text-left hover:bg-accent transition-colors">
            <div className="text-2xl mb-2">📄</div>
            <h3 className="font-medium">Nouvelle Facture</h3>
            <p className="text-sm text-muted-foreground">Générer une facture</p>
          </button>
          <button className="rounded-md border border-border p-4 text-left hover:bg-accent transition-colors">
            <div className="text-2xl mb-2">👤</div>
            <h3 className="font-medium">Nouveau Client</h3>
            <p className="text-sm text-muted-foreground">Ajouter un client</p>
          </button>
        </div>
      </div>
    </div>
  )
}
