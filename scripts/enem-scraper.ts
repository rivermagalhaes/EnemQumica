import { createClient } from '@supabase/supabase-js'
import * as cheerio from 'cheerio'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

// ==================== ENEM NEWS SCRAPER ====================

async function scrapeINEPNews() {
    console.log('🔍 Scraping INEP news...')

    try {
        const response = await fetch('https://www.gov.br/inep/pt-br/assuntos/noticias')
        const html = await response.text()
        const $ = cheerio.load(html)

        const news: any[] = []

        // Scrape news items (adjust selectors based on actual HTML structure)
        $('.item-noticia, .news-item, article').each((i, elem) => {
            const title = $(elem).find('h2, h3, .titulo, .title').first().text().trim()
            const description = $(elem).find('p, .descricao, .description').first().text().trim()
            const linkElem = $(elem).find('a').first()
            const url = linkElem.attr('href')
            const dateText = $(elem).find('.data, .date, time').first().text().trim()

            if (title && title.toLowerCase().includes('enem')) {
                const fullUrl = url?.startsWith('http') ? url : `https://www.gov.br${url}`

                news.push({
                    title,
                    description: description || title,
                    source: 'INEP',
                    url: fullUrl,
                    published_date: parseDateOrDefault(dateText),
                    category: detectCategory(title),
                    is_important: isImportant(title),
                })
            }
        })

        console.log(`✅ Found ${news.length} ENEM-related news items`)
        return news
    } catch (error) {
        console.error('❌ Error scraping INEP:', error)
        return []
    }
}

async function scrapeMECNews() {
    console.log('🔍 Scraping MEC news...')

    try {
        const response = await fetch('https://www.gov.br/mec/pt-br/assuntos/noticias')
        const html = await response.text()
        const $ = cheerio.load(html)

        const news: any[] = []

        $('.item-noticia, .news-item, article').each((i, elem) => {
            const title = $(elem).find('h2, h3, .titulo').first().text().trim()
            const description = $(elem).find('p, .descricao').first().text().trim()
            const url = $(elem).find('a').first().attr('href')

            if (title && title.toLowerCase().includes('enem')) {
                const fullUrl = url?.startsWith('http') ? url : `https://www.gov.br${url}`

                news.push({
                    title,
                    description: description || title,
                    source: 'MEC',
                    url: fullUrl,
                    published_date: new Date().toISOString(),
                    category: detectCategory(title),
                    is_important: isImportant(title),
                })
            }
        })

        console.log(`✅ Found ${news.length} ENEM-related news items from MEC`)
        return news
    } catch (error) {
        console.error('❌ Error scraping MEC:', error)
        return []
    }
}

// ==================== HELPER FUNCTIONS ====================

function detectCategory(title: string): string {
    const titleLower = title.toLowerCase()

    if (titleLower.match(/inscri(ç|c)(õ|o)es?|prazo|cadastro/i)) return 'inscricoes'
    if (titleLower.match(/prova|exame|aplica(ç|c)(ã|a)o|data/i)) return 'provas'
    if (titleLower.match(/resultado|nota|gabarito|correção/i)) return 'resultados'

    return 'geral'
}

function isImportant(title: string): boolean {
    const keywords = [
        'prazo',
        'último dia',
        'atenção',
        'importante',
        'urgente',
        'inscrição',
        'resultado',
        'gabarito',
        'divulgação',
    ]
    const titleLower = title.toLowerCase()
    return keywords.some((kw) => titleLower.includes(kw))
}

function parseDateOrDefault(dateText: string): string {
    if (!dateText) return new Date().toISOString()

    // Try to parse Brazilian date format (DD/MM/YYYY)
    const match = dateText.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
    if (match) {
        const [, day, month, year] = match
        return new Date(`${year}-${month}-${day}`).toISOString()
    }

    return new Date().toISOString()
}

// ==================== DATABASE INSERTION ====================

async function saveNewsToDatabase(newsItems: any[]) {
    console.log(`💾 Saving ${newsItems.length} news items to database...`)

    let successCount = 0
    let errorCount = 0

    for (const item of newsItems) {
        const { error } = await supabase.from('enem_news').upsert(item, {
            onConflict: 'url',
            ignoreDuplicates: false,
        })

        if (error) {
            console.error(`❌ Error inserting "${item.title}":`, error.message)
            errorCount++
        } else {
            console.log(`✅ Saved: ${item.title}`)
            successCount++
        }
    }

    console.log(`\n📊 Summary: ${successCount} successful, ${errorCount} errors`)
    return { successCount, errorCount }
}

// ==================== MAIN BOT FUNCTION ====================

export async function runENEMBot() {
    console.log('\n🤖 ENEM Content Bot Started!')
    console.log('⏰ Timestamp:', new Date().toISOString())
    console.log('─'.repeat(50))

    try {
        // Scrape from multiple sources
        const [inepNews, mecNews] = await Promise.all([scrapeINEPNews(), scrapeMECNews()])

        // Combine all news
        const allNews = [...inepNews, ...mecNews]

        console.log(`\n📰 Total news items found: ${allNews.length}`)

        if (allNews.length > 0) {
            // Save to database
            const { successCount, errorCount } = await saveNewsToDatabase(allNews)

            console.log('\n✅ ENEM Bot finished successfully!')
            console.log(`📊 Final Stats:`)
            console.log(`   - Total scraped: ${allNews.length}`)
            console.log(`   - Saved: ${successCount}`)
            console.log(`   - Errors: ${errorCount}`)

            return {
                success: true,
                totalScraped: allNews.length,
                saved: successCount,
                errors: errorCount,
            }
        } else {
            console.log('⚠️ No ENEM news found')
            return { success: true, totalScraped: 0, saved: 0, errors: 0 }
        }
    } catch (error) {
        console.error('\n❌ ENEM Bot failed:', error)
        return { success: false, error: String(error) }
    }
}

// Run if executed directly
if (require.main === module) {
    runENEMBot()
        .then((result) => {
            console.log('\n� Bot execution completed')
            process.exit(result.success ? 0 : 1)
        })
        .catch((error) => {
            console.error('\n❌ Fatal error:', error)
            process.exit(1)
        })
}
