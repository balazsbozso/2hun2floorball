import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Matches({ championshipId }) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    axios.get(`/api/matches?championship_id=${championshipId}`)
      .then(r => setMatches(r.data))
      .finally(() => setLoading(false))
  }, [championshipId])

  if (loading) return <div className="text-center text-gray-500 py-12">Betöltés...</div>
  if (matches.length === 0) return <div className="text-center text-gray-500 py-12">Nincs meccs</div>

  return (
    <div className="flex flex-col gap-2">
      {matches.map(m => (
        <div key={m.id} className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 flex items-center gap-4 hover:border-gray-700 transition-colors">
          <div className="text-xs text-gray-500 w-24 shrink-0">
            {m.match_date ? new Date(m.match_date).toLocaleDateString('hu-HU') : '—'}
            {m.round && <div className="text-gray-600">{m.round}. forduló</div>}
          </div>
          <div className="flex-1 flex items-center justify-between gap-4">
            <span className="text-white font-medium text-right flex-1">{m.home_team}</span>
            <div className="text-center shrink-0">
              {m.is_finished ? (
                <span className="bg-gray-800 rounded-lg px-4 py-1 font-bold text-white text-lg">
                  {m.home_score} – {m.away_score}
                </span>
              ) : (
                <span className="bg-gray-800 rounded-lg px-4 py-1 text-gray-500 text-sm">
                  {m.match_time ? m.match_time.slice(0,5) : 'vs'}
                </span>
              )}
            </div>
            <span className="text-white font-medium flex-1">{m.away_team}</span>
          </div>
        </div>
      ))}
    </div>
  )
}