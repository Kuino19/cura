import { HomePage } from '@/components/HomePage'
import { getQuestions } from '@/app/actions'

export const dynamic = 'force-dynamic'

export default async function Page() {
  console.log('Server Page: Starting render...')
  try {
    const questions = await getQuestions()
    console.log('Server Page: Fetched questions', questions?.length)
    return <HomePage questions={questions} />
  } catch (e) {
    console.error('Server Page: Error fetching questions', e)
    return <div>Error loading questions</div>
  }
}
