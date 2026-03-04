import { useState, useEffect } from 'react'
import axios from 'axios'
import Standings from './components/Standings'
import Matches from './components/Matches'

export default function App() {
  const [seasons, setSeasons] = useState([])
  const [championships, setChampionships] = useState([])
  const [selectedSeason, setSelectedSeason] = useState(null)
  const [selectedChampionship, setSelectedChampionship] = useState(null)
  const [activeTab, setActiveTab] = useState('standings')

  useEffect(() => {
    axios.get('/api/seasons').then(r => {
      setSeasons(r.data)
      if (r.data.length > 0) setSelectedSeason(r.data[0])
    })
  }, [])

  useEffect(() => {
    if (!selectedSeason) return
    setSelectedChampionship(null)
    setChampionships([])
    axios.get(`/api/championships?season_id=${selectedSeason.id}`).then(r => {
      setChampionships(r.data)
      if (r.data.length > 0) setSelectedChampionship(r.data[0])
    })
  }, [selectedSeason])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <h1 className="text-xl font-bold text-white tracking-tight">Hunfloorball Stats</h1>
          <span className="text-gray-500 text-sm ml-auto">Magyar Floorball Statisztikák</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* Szűrők */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Szezon</label>
            <select
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 min-w-[160px]"
              value={selectedSeason?.id || ''}
              onChange={e => setSelectedSeason(seasons.find(s => s.id === parseInt(e.target.value)))}
            >
              {seasons.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Bajnokság</label>
            <select
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 min-w-[240px]"
              value={selectedChampionship?.id || ''}
              onChange={e => setSelectedChampionship(championships.find(c => c.id === parseInt(e.target.value)))}
              disabled={championships.length === 0}
            >
              {championships.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabok */}
        {selectedChampionship && (
          <>
            <div className="flex gap-1 mb-4 border-b border-gray-800">
              {[
                { key: 'standings', label: 'Tabella' },
                { key: 'matches', label: 'Mérkőzések' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'standings' && (
              <Standings championshipId={selectedChampionship.id} />
            )}
            {activeTab === 'matches' && (
              <Matches championshipId={selectedChampionship.id} />
            )}
          </>
        )}

        {!selectedChampionship && (
          <div className="text-center text-gray-500 py-20">
            Válassz szezont és bajnokságot a statisztikák megtekintéséhez
          </div>
        )}
      </main>
    </div>
  )
}