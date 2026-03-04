import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'

const COLS = [
  { key: 'player',  label: 'Játékos', align: 'left',   numeric: false },
  { key: 'team',    label: 'Csapat',  align: 'left',   numeric: false },
  { key: 'games',   label: 'M',       align: 'center', numeric: true  },
  { key: 'goals',   label: 'G',       align: 'center', numeric: true  },
  { key: 'assists', label: 'A',       align: 'center', numeric: true  },
  { key: 'points',  label: 'P',       align: 'center', numeric: true  },
  { key: 'pim',     label: 'PIM',     align: 'center', numeric: true  },
]

export default function PlayerStandings({ championshipId }) {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState('points')
  const [sortAsc, setSortAsc] = useState(false)
  const [teamFilter, setTeamFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    setSortKey('points')
    setSortAsc(false)
    setTeamFilter('')
    axios.get(`/api/player-standings?championship_id=${championshipId}`)
      .then(r => setPlayers(r.data))
      .finally(() => setLoading(false))
  }, [championshipId])

  const teams = useMemo(() => {
    return [...new Set(players.map(p => p.team))].sort((a, b) => a.localeCompare(b, 'hu'))
  }, [players])

  const sorted = useMemo(() => {
    const col = COLS.find(c => c.key === sortKey)
    return [...players]
      .filter(p => teamFilter === '' || p.team === teamFilter)
      .sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey]
        if (av == null) return 1
        if (bv == null) return -1
        const cmp = col?.numeric ? Number(av) - Number(bv) : String(av).localeCompare(String(bv), 'hu')
        return sortAsc ? cmp : -cmp
      })
  }, [players, sortKey, sortAsc, teamFilter])

  function handleSort(key) {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(false) }
  }

  if (loading) return <div className="text-center text-gray-500 py-12">Betöltés...</div>
  if (players.length === 0) return <div className="text-center text-gray-500 py-12">Nincs adat</div>

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <select
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          value={teamFilter}
          onChange={e => setTeamFilter(e.target.value)}
        >
          <option value="">Minden csapat</option>
          {teams.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-4 py-3 text-gray-400 font-medium w-8">#</th>
              {COLS.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-3 py-3 font-medium cursor-pointer select-none hover:text-white transition-colors ${
                    col.align === 'left' ? 'text-left px-4' : 'text-center'
                  } ${sortKey === col.key ? 'text-white' : 'text-gray-400'}`}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="ml-1 text-blue-400">{sortAsc ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
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
    </div>
  )
}
