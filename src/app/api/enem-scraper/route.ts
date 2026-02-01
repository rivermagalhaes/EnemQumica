import { runENEMBot } from '@/scripts/enem-scraper'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const result = await runENEMBot()

        return NextResponse.json({
            success: true,
            message: 'ENEM bot executed successfully',
            ...result,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Error running ENEM bot:', error)

        return NextResponse.json(
            {
                success: false,
                error: String(error),
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        )
    }
}

// Allow manual trigger for testing (remove secret check on local env)
export async function POST(request: Request) {
    if (process.env.NODE_ENV === 'development') {
        const result = await runENEMBot()
        return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Only available in development' }, { status: 403 })
}
