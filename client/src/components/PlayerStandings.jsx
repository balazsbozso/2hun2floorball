import { useState, useEffect } from 'react'
import axios from 'axios'

export default function PlayerStandings({ championshipId }) {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    axios.get(`/api/player-standings?championship_id=${championshipId}`)
      .then(r => setPlayers(r.data))
      .finally(() => setLoading(false))
  }, [championshipId])

  if (loading) return <div className="text-center text-gray-500 py-12">Betöltés...</div>
  if (players.length === 0) return <div className="text-center text-gray-500 py-12">Nincs adat</div>

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-x-auto">
      <table className="w-full text-sm min-w-[520px]">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left px-4 py-3 text-gray-400 font-medium w-8">#</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Játékos</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Csapat</th>
            <th className="text-center px-3 py-3 text-gray-400 font-medium">M</th>
            <th className="text-center px-3 py-3 text-gray-400 font-medium">G</th>
            <th className="text-center px-3 py-3 text-gray-400 font-medium">A</th>
            <th className="text-center px-3 py-3 text-white font-bold">P</th>
            <th className="text-center px-3 py-3 text-gray-400 font-medium">PIM</th>
          </tr>
        </thead>
        <tbody>
          {players.map((row, i) => (
            <tr key={i} className="border-b border-gray-800 last:border-0 hover:bg-gray-800 transition-colors">
              <td className="px-4 py-3 text-gray-500 text-center">{i + 1}</td>
              <td className="px-4 py-3 font-medium text-white">{row.player}</td>
              <td className="px-4 py-3 text-gray-400">{row.team}</td>
              <td className="px-3 py-3 text-center text-gray-300">{row.games}</td>
              <td className="px-3 py-3 text-center text-green-400">{row.goals}</td>
              <td className="px-3 py-3 text-center text-blue-400">{row.assists}</td>
              <td className="px-3 py-3 text-center font-bold text-white text-base">{row.points}</td>
              <td className="px-3 py-3 text-center text-red-400">{row.pim}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
