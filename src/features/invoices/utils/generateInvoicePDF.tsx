import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// Register fonts (optional - using default Helvetica for now)
// Font.register({
//   family: 'Roboto',
//   src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf'
// })

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyInfo: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  invoiceNumber: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  clientInfo: {
    fontSize: 10,
    marginBottom: 3,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 5,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  col1: { width: '50%' },
  col2: { width: '15%', textAlign: 'center' },
  col3: { width: '20%', textAlign: 'right' },
  col4: { width: '15%', textAlign: 'right' },
  totalsSection: {
    marginTop: 30,
    marginLeft: 'auto',
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  totalLabel: {
    fontSize: 10,
  },
  totalValue: {
    fontSize: 10,
    textAlign: 'right',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#666',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 10,
  },
  legalMention: {
    marginTop: 5,
    fontSize: 8,
    fontStyle: 'italic',
  },
  notes: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notesText: {
    fontSize: 9,
    lineHeight: 1.4,
  },
})

interface InvoicePDFProps {
  invoice: {
    invoice_number: string
    invoice_date: string
    due_date?: string
    subtotal: number
    discount_amount: number
    discount_type?: 'fixed' | 'percentage'
    discount_percentage?: number
    total_amount: number
    notes?: string
    status: string
    client?: {
      name: string
      email?: string
      siret?: string
      address?: string
      postal_code?: string
      city?: string
      country?: string
    }
    activities?: Array<{
      id: string
      description: string
      total_hours?: number
      hourly_rate?: number
      total_amount?: number
      project?: {
        name: string
      }
    }>
  }
  userSettings: {
    company_name?: string
    siret?: string
    address?: string
    postal_code?: string
    city?: string
    email?: string
    phone?: string
    tva_number?: string
    is_tva_applicable?: boolean
  }
}

export const InvoicePDF = ({ invoice, userSettings }: InvoicePDFProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr })
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - Company Info */}
        <View style={styles.header}>
          <Text style={styles.companyName}>
            {userSettings.company_name || 'Votre Entreprise'}
          </Text>
          {userSettings.siret && (
            <Text style={styles.companyInfo}>SIRET: {userSettings.siret}</Text>
          )}
          {userSettings.tva_number && (
            <Text style={styles.companyInfo}>
              N° TVA: {userSettings.tva_number}
            </Text>
          )}
          {userSettings.address && (
            <Text style={styles.companyInfo}>{userSettings.address}</Text>
          )}
          {(userSettings.postal_code || userSettings.city) && (
            <Text style={styles.companyInfo}>
              {userSettings.postal_code} {userSettings.city}
            </Text>
          )}
          {userSettings.email && (
            <Text style={styles.companyInfo}>{userSettings.email}</Text>
          )}
          {userSettings.phone && (
            <Text style={styles.companyInfo}>{userSettings.phone}</Text>
          )}
        </View>

        {/* Invoice Title */}
        <Text style={styles.invoiceTitle}>FACTURE</Text>
        <Text style={styles.invoiceNumber}>N° {invoice.invoice_number}</Text>

        {/* Client Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facturé à :</Text>
          <Text style={styles.clientInfo}>{invoice.client?.name}</Text>
          {invoice.client?.siret && (
            <Text style={styles.clientInfo}>SIRET: {invoice.client.siret}</Text>
          )}
          {invoice.client?.address && (
            <Text style={styles.clientInfo}>{invoice.client.address}</Text>
          )}
          {(invoice.client?.postal_code || invoice.client?.city) && (
            <Text style={styles.clientInfo}>
              {invoice.client.postal_code} {invoice.client.city}
            </Text>
          )}
          {invoice.client?.email && (
            <Text style={styles.clientInfo}>{invoice.client.email}</Text>
          )}
        </View>

        {/* Invoice Details */}
        <View style={styles.section}>
          <Text style={styles.clientInfo}>
            <Text style={{ fontWeight: 'bold' }}>Date d'émission:</Text>{' '}
            {formatDate(invoice.invoice_date)}
          </Text>
          {invoice.due_date && (
            <Text style={styles.clientInfo}>
              <Text style={{ fontWeight: 'bold' }}>Date d'échéance:</Text>{' '}
              {formatDate(invoice.due_date)}
            </Text>
          )}
        </View>

        {/* Activities Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Désignation</Text>
            <Text style={styles.col2}>Quantité</Text>
            <Text style={styles.col3}>Prix unitaire</Text>
            <Text style={styles.col4}>Total HT</Text>
          </View>

          {invoice.activities?.map((activity) => (
            <View key={activity.id} style={styles.tableRow}>
              <View style={styles.col1}>
                <Text>{activity.description}</Text>
                {activity.project && (
                  <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>
                    {activity.project.name}
                  </Text>
                )}
              </View>
              <Text style={styles.col2}>{activity.total_hours || 0}h</Text>
              <Text style={styles.col3}>
                {formatCurrency(activity.hourly_rate || 0)}
              </Text>
              <Text style={styles.col4}>
                {formatCurrency(activity.total_amount || 0)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total HT</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
          </View>

          {invoice.discount_amount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Remise
                {invoice.discount_type === 'percentage' &&
                  ` (${invoice.discount_percentage}%)`}
              </Text>
              <Text style={styles.totalValue}>
                -{formatCurrency(invoice.discount_amount)}
              </Text>
            </View>
          )}

          {!userSettings.is_tva_applicable && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { fontSize: 8, fontStyle: 'italic' }]}>
                TVA non applicable, art. 293 B du CGI
              </Text>
            </View>
          )}

          <View style={styles.grandTotalRow}>
            <Text>Total TTC</Text>
            <Text>{formatCurrency(invoice.total_amount)}</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Notes :</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer - Legal Mentions */}
        <View style={styles.footer}>
          <Text style={styles.legalMention}>
            Conditions de paiement : Paiement à réception de facture
          </Text>
          {!userSettings.is_tva_applicable && (
            <Text style={styles.legalMention}>
              TVA non applicable, article 293 B du Code général des impôts
            </Text>
          )}
          <Text style={styles.legalMention}>
            En cas de retard de paiement, seront exigibles, conformément à
            l'article L 441-6 du code de commerce, une indemnité calculée sur la
            base de trois fois le taux de l'intérêt légal en vigueur ainsi qu'une
            indemnité forfaitaire pour frais de recouvrement de 40 euros.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
