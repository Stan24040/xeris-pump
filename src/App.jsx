import { useState, useEffect } from 'react'
import './index.css'

const XERIS_NODE = 'http://138.197.116.81'

export default function App() {
  const [wallet, setWallet] = useState(null)
  const [balance, setBalance] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState('home') // home | launch | explore
  const [tokens, setTokens] = useState([])
  const [launching, setLaunching] = useState(false)
  const [form, setForm] = useState({ name: '', symbol: '', supply: '', description: '', image: '' })
  const [launchSuccess, setLaunchSuccess] = useState(null)

  const connectWallet = async () => {
    setConnecting(true)
    setError(null)
    try {
      if (!window.xeris) throw new Error('Xeris wallet not found. Please install the Xeris extension.')
      const accounts = await window.xeris.connect()
      setWallet(accounts.address || accounts[0])
    } catch (e) {
      setError(e.message)
    }
    setConnecting(false)
  }

  const disconnectWallet = () => { setWallet(null); setBalance(null) }

  useEffect(() => {
    if (!wallet) return
    fetch(`${XERIS_NODE}:56001/account/${wallet}`)
      .then(r => r.json())
      .then(d => setBalance((d?.data?.balance_xrs || d?.native_xrs / 1e9 || 0).toFixed(4)))
      .catch(() => setBalance('0'))
  }, [wallet])

  useEffect(() => {
    if (page !== 'explore') return
    fetch(`${XERIS_NODE}:56001/tokens`)
      .then(r => r.json())
      .then(d => setTokens(d?.data || d?.tokens || []))
      .catch(() => setTokens([]))
  }, [page])

  const launchToken = async (e) => {
    e.preventDefault()
    if (!wallet) return setError('Connect wallet first')
    setLaunching(true)
    setError(null)
    try {
      if (!window.xeris) throw new Error('Xeris wallet not found')
      const result = await window.xeris.createToken({
        name: form.name,
        symbol: form.symbol,
        supply: parseInt(form.supply),
        description: form.description,
      })
      setLaunchSuccess(result)
      setForm({ name: '', symbol: '', supply: '', description: '', image: '' })
    } catch (e) {
      setError(e.message)
    }
    setLaunching(false)
  }

  const NavBar = () => (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
      <div className="flex items-center gap-6">
        <button onClick={() => setPage('home')} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center font-black text-sm">X</div>
          <span className="font-bold text-lg tracking-tight">Xeris<span className="text-cyan-400">.Pump</span></span>
        </button>
        <div className="hidden md:flex gap-4 text-sm">
          <button onClick={() => setPage('explore')} className={`transition-colors ${page==='explore' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}>Explore</button>
          <button onClick={() => wallet ? setPage('launch') : connectWallet()} className={`transition-colors ${page==='launch' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}>Launch</button>
        </div>
      </div>
      {wallet ? (
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg">{balance} XRS</div>
          <div className="text-sm bg-white/5 px-3 py-1.5 rounded-lg text-cyan-400">{wallet.slice(0,6)}...{wallet.slice(-4)}</div>
          <button onClick={disconnectWallet} className="text-xs text-gray-500 hover:text-red-400 transition-colors">Disconnect</button>
        </div>
      ) : (
        <button onClick={connectWallet} disabled={connecting}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-all disabled:opacity-50">
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </nav>
  )

  if (page === 'launch') return (
    <div className="min-h-screen bg-[#05070a] text-white">
      <NavBar />
      <div className="max-w-lg mx-auto px-6 py-16">
        <h2 className="text-3xl font-black mb-2">🚀 Launch Token</h2>
        <p className="text-gray-400 text-sm mb-8">Create your token on Xeris blockchain</p>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>}
        {launchSuccess && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-xl mb-6">
            ✅ Token launched! TX: {launchSuccess?.signature || launchSuccess?.tx || JSON.stringify(launchSuccess).slice(0,40)}
          </div>
        )}

        <form onSubmit={launchToken} className="space-y-4">
          {[
            { key: 'name', label: 'Token Name', placeholder: 'e.g. Xeris Dog' },
            { key: 'symbol', label: 'Symbol', placeholder: 'e.g. XDOG' },
            { key: 'supply', label: 'Total Supply', placeholder: 'e.g. 1000000000' },
            { key: 'description', label: 'Description', placeholder: 'Tell us about your token...' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">{f.label}</label>
              <input
                type={f.key === 'supply' ? 'number' : 'text'}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors text-sm"
              />
            </div>
          ))}
          <button type="submit" disabled={launching || !wallet}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 mt-4">
            {launching ? 'Launching...' : '🚀 Launch Token'}
          </button>
          {!wallet && <p className="text-center text-xs text-gray-500">Connect wallet to launch</p>}
        </form>
      </div>
    </div>
  )

  if (page === 'explore') return (
    <div className="min-h-screen bg-[#05070a] text-white">
      <NavBar />
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black mb-2">🔍 Explore Tokens</h2>
        <p className="text-gray-400 text-sm mb-8">All tokens launched on Xeris</p>
        {tokens.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <div className="text-5xl mb-4">🪙</div>
            <p>No tokens yet. Be the first to launch!</p>
            <button onClick={() => wallet ? setPage('launch') : connectWallet()}
              className="mt-6 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold px-6 py-3 rounded-xl text-sm">
              Launch First Token
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tokens.map((t, i) => (
              <div key={i} className="bg-white/3 border border-white/5 rounded-2xl p-5 hover:border-cyan-500/20 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center font-black text-sm">
                    {(t.symbol || t.name || '?').slice(0,2)}
                  </div>
                  <div>
                    <div className="font-bold">{t.name || t.symbol}</div>
                    <div className="text-xs text-gray-500">{t.symbol}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 truncate">{t.token_id || t.id}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      <NavBar />
      <div className="flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
          ⚡ Built on Xeris Blockchain
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-none">
          Launch your token<br/>
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">on Xeris</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-md mb-10">
          The fairest token launchpad on Xeris. No presales, no team allocations. Just pure community-driven launches.
        </p>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6 max-w-sm">{error}</div>}
        <div className="flex gap-4 flex-wrap justify-center">
          <button onClick={() => wallet ? setPage('launch') : connectWallet()}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all text-sm">
            🚀 Launch Token
          </button>
          <button onClick={() => setPage('explore')}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-3.5 rounded-xl transition-all text-sm">
            🔍 Explore Tokens
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto px-6 mb-20">
        {[{label:'Tokens Launched',value:'0'},{label:'Total Volume',value:'0 XRS'},{label:'Active Traders',value:'0'}].map((s,i)=>(
          <div key={i} className="bg-white/3 border border-white/5 rounded-2xl p-5 text-center">
            <div className="text-2xl font-black text-white mb-1">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
