import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'
import { exportAnalyticsCSV, type TimePeriod } from '@/lib/analytics'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get period from query params
    const searchParams = request.nextUrl.searchParams
    const period = (searchParams.get('period') || '30d') as TimePeriod

    // Validate period
    const validPeriods: TimePeriod[] = ['7d', '30d', '90d']
    const safePeriod = validPeriods.includes(period) ? period : '30d'

    // Generate CSV
    const csv = await exportAnalyticsCSV(safePeriod)

    // Return as downloadable file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-${safePeriod}-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting analytics:', error)
    return NextResponse.json(
      { error: 'Failed to export analytics' },
      { status: 500 }
    )
  }
}
