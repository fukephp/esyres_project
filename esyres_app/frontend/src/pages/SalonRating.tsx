import { gql, useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Spinner } from '../components/ui'
import type { MeData } from '../graphql/auth'
import {
  CUSTOMER_CARD,
  CUSTOMER_CARD_TITLE,
  CUSTOMER_LINK,
  CUSTOMER_SMALL_BUTTON,
  CUSTOMER_SMALL_PRIMARY,
} from '../lib/customerUi'
import { formatCivilDate } from '../lib/format'

const RATINGS_QUERY = gql`
  query SalonRatings($id: ID!) {
    salon(id: $id) {
      id
        ratings {
          id
          authorId
          authorName
          score
          comment
          day
          replies {
            id
            authorName
            body
          }
        }
    }
  }
`

const REPLY_TO_RATING = gql`
  mutation ReplyToRating($ratingId: ID!, $body: String!) {
    replyToRating(ratingId: $ratingId, body: $body) {
      id
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
  authorId: string
  authorName: string
  score: number
  comment: string | null
  day: string
  replies: { id: string; authorName: string; body: string }[]
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
  const [replyBody, setReplyBody] = useState('')
  const [sendReply, { loading: replying }] = useMutation(REPLY_TO_RATING)
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
          <button type="submit" disabled={loading} className={`mt-3 ${CUSTOMER_SMALL_PRIMARY}`}>
            {loading ? <Spinner /> : null}
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
              {row.comment
                ? row.replies.map((reply) => (
                    <p key={reply.id} className="mt-2 text-body">
                      {reply.authorName} {reply.body}
                    </p>
                  ))
                : null}
              {row.comment && me != null && me.id !== row.authorId && mayRate ? (
                <form
                  className="mt-2"
                  onSubmit={(event) => {
                    event.preventDefault()
                    const body = replyBody.trim()
                    if (body === '') {
                      return
                    }
                    void sendReply({ variables: { ratingId: row.id, body } }).then(() => {
                      setReplyBody('')
                      void ratings.refetch()
                    })
                  }}
                >
                  <input
                    value={replyBody}
                    maxLength={500}
                    onChange={(event) => setReplyBody(event.target.value)}
                    className="w-full rounded-full border border-hairline bg-canvas px-3 py-2 text-sm"
                  />
                  <button type="submit" disabled={replying} className={`mt-2 ${CUSTOMER_SMALL_BUTTON}`}>
                    {replying ? <Spinner /> : null}
                    {t('salon.reply')}
                  </button>
                </form>
              ) : null}
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
    <section className={CUSTOMER_CARD}>
      <h2 className={`${CUSTOMER_CARD_TITLE} border-b border-hairline pb-3`}>{t('profile.ratings')}</h2>
      {rows.length === 0 ? (
        <p className="pt-3 text-sm text-body">{t('profile.ratingsEmpty')}</p>
      ) : (
        <ul className="pt-3">
          {rows.map((row) => (
            <li key={row.id} className="border-t border-hairline py-3 text-sm text-ink first:border-t-0 first:pt-0">
              <div className="flex items-center justify-between gap-4">
                <Link to={`/salon/${row.salon.id}`} className={CUSTOMER_LINK}>
                  {row.salon.name}
                </Link>
                <span className="shrink-0">
                  <span className="sr-only">{row.score}</span>
                  <Stars filled={row.score} />
                </span>
              </div>
              {row.comment ? <p className="mt-1 text-body">{row.comment}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
