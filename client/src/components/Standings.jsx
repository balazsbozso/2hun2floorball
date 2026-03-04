import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Standings({ championshipId }) {
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    axios.get(`/api/standings?championship_id=${championshipId}`)
      .then(r => setStandings(r.data))
      .finally(() => setLoading(false))
  }, [championshipId])

  if (loading) return <div className="text-center text-gray-500 py-12">Betöltés...</div>
  if (standings.length === 0) return <div className="text-center text-gray-500 py-12">Nincs adat</div>

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left px-4 py-3 text-gray-400 font-medium w-8">#</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Csapat</th>
            <th className="text-center px-3 py-3 text-gray-400 font-medium">M</th>
            <th className="text-center px-3 py-3 text-gray-400 font-medium">GY</th>
            <th className="text-center px-3 py-3 text-gray-400 font-medium">D</th>
            <th className="text-center px-3 py-3 text-gray-400 font-medium">V</th>
            <th className="text-center px-3 py-3 text-gray-400 font-medium">G+</th>
            <th className="text-center px-3 py-3 text-gray-400 font-medium">G-</th>
            <th className="text-center px-3 py-3 text-gray-400 font-medium">GK</th>
            <th className="text-center px-3 py-3 text-white font-bold">P</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, i) => (
            <tr key={row.team} className="border-b border-gray-800 last:border-0 hover:bg-gray-800 transition-colors">
              <td className="px-4 py-3 text-gray-500 text-center">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
              </td>
              <td className="px-4 py-3 font-medium text-white">{row.team}</td>
              <td className="px-3 py-3 text-center text-gray-300">{row.played}</td>
              <td className="px-3 py-3 text-center text-green-400">{row.won}</td>
              <td className="px-3 py-3 text-center text-gray-400">{row.drawn}</td>
              <td className="px-3 py-3 text-center text-red-400">{row.lost}</td>
              <td className="px-3 py-3 text-center text-gray-300">{row.goals_for}</td>
              <td className="px-3 py-3 text-center text-gray-300">{row.goals_against}</td>
              <td className={`px-3 py-3 text-center font-medium ${row.goal_diff > 0 ? 'text-green-400' : row.goal_diff < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {row.goal_diff > 0 ? `+${row.goal_diff}` : row.goal_diff}
              </td>
              <td className="px-3 py-3 text-center font-bold text-white text-base">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}