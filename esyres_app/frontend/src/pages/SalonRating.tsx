import { gql, useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { MeData } from '../graphql/auth'
import { formatCivilDate } from '../lib/format'

const RATINGS_QUERY = gql`
  query SalonRatings($id: ID!) {
    salon(id: $id) {
      id
      ratings {
        id
        authorName
        score
        comment
        day
      }
    }
  }
`

const RATE_SALON = gql`
  mutation RateSalon($salonId: ID!, $score: Int!, $comment: String) {
    rateSalon(salonId: $salonId, score: $score, comment: $comment) {
      id
      ratingAverage
      ratingCount
    }
  }
`

type RatingRow = {
  id: string
  authorName: string
  score: number
  comment: string | null
  day: string
}

function Stars({ filled }: { filled: number }) {
  return (
    <span className="text-[#2F6FED]" aria-hidden>
      {'★'.repeat(filled)}
      {'☆'.repeat(5 - filled)}
    </span>
  )
}

export function SalonRatingBlock({
  salonId,
  average,
  count,
  me,
  onRated,
}: {
  salonId: string
  average: string | null
  count: number
  me: MeData['me'] | null
  onRated: () => void
}) {
  const { t } = useTranslation()
  const mayRate = me != null && !me.salons.some((salon) => salon.id === salonId)
  const ratings = useQuery<{ salon: { ratings: RatingRow[] } | null }>(RATINGS_QUERY, {
    variables: { id: salonId },
    skip: me == null,
  })
  const [score, setScore] = useState(0)
  const [comment, setComment] = useState('')
  const [rate, { loading }] = useMutation(RATE_SALON)
  const rows = ratings.data?.salon?.ratings ?? []

  if (count === 0 && !mayRate) {
    return null
  }

  return (
    <section className="mt-8">
      {count > 0 && average != null ? (
        <p className="text-sm text-ink">
          {average} ({count}) <Stars filled={Math.round(Number(average))} />
        </p>
      ) : null}
      {mayRate ? (
        <form
          className="mt-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (score < 1) {
              return
            }
            void rate({
              variables: { salonId, score, comment: comment.trim() === '' ? null : comment },
            }).then(() => {
              onRated()
              void ratings.refetch()
            })
          }}
        >
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={score === value}
                className="text-[#2F6FED]"
                onClick={() => setScore(value)}
              >
                {value <= score ? '★' : '☆'}
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            maxLength={500}
            onChange={(event) => setComment(event.target.value)}
            className="mt-3 w-full rounded-2xl border border-hairline bg-canvas px-3 py-2 text-sm text-ink"
          />
          <button type="submit" disabled={loading} className="mt-3 text-sm font-semibold text-ink">
            {t('salon.rate')}
          </button>
        </form>
      ) : null}
      {rows.length > 0 ? (
        <ul className="mt-4">
          {rows.map((row) => (
            <li key={row.id} className="border-t border-hairline py-3 text-sm text-ink">
              <p className="font-semibold">{row.authorName}</p>
              <p>
                {row.score} · {formatCivilDate(row.day)}
              </p>
              {row.comment ? <p className="mt-1 text-body">{row.comment}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

export function MyRatingsList({
  rows,
}: {
  rows: { id: string; score: number; comment: string | null; salon: { id: string; name: string } }[]
}) {
  const { t } = useTranslation()
  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold text-ink">{t('profile.ratings')}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-body">{t('profile.ratingsEmpty')}</p>
      ) : (
        <ul className="mt-3">
          {rows.map((row) => (
            <li key={row.id} className="border-t border-hairline py-3 text-sm text-ink">
              <Link to={`/salon/${row.salon.id}`} className="font-semibold">
                {row.salon.name}
              </Link>
              <p>{row.score}</p>
              {row.comment ? <p className="text-body">{row.comment}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
