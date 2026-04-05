import { useState, useEffect } from 'react'
import './index.css'

const XERIS_NODE = 'http://138.197.116.81'

export default function App() {
  const [wallet, setWallet] = useState(null)
  const [balance, setBalance] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)

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

  const disconnectWallet = () => {
    setWallet(null)
    setBalance(null)
  }

  useEffect(() => {
    if (!wallet) return
    fetch(`${XERIS_NODE}:56001/account/${wallet}`)
      .then(r => r.json())
      .then(d => setBalance((d?.data?.balance_xrs || d?.native_xrs / 1e9 || 0).toFixed(4)))
      .catch(() => setBalance('0'))
  }, [wallet])

  return (
    <div className="min-h-screen bg-[#05070a] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center font-black text-sm">X</div>
          <span className="font-bold text-lg tracking-tight">Xeris<span className="text-cyan-400">.Pump</span></span>
        </div>
        {wallet ? (
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg">
              {balance} XRS
            </div>
            <div className="text-sm bg-white/5 px-3 py-1.5 rounded-lg text-cyan-400">
              {wallet.slice(0,6)}...{wallet.slice(-4)}
            </div>
            <button onClick={disconnectWallet} className="text-xs text-gray-500 hover:text-red-400 transition-colors">
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            disabled={connecting}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-all disabled:opacity-50"
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
          ⚡ Built on Xeris Blockchain
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-none">
          Launch your token<br/>
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            on Xeris
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-md mb-10">
          The fairest token launchpad on Xeris. No presales, no team allocations. Just pure community-driven launches.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6 max-w-sm">
            {error}
          </div>
        )}

        {wallet ? (
          <div className="flex gap-4">
            <button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all text-sm">
              🚀 Launch Token
            </button>
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-3.5 rounded-xl transition-all text-sm">
              🔍 Explore Tokens
            </button>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            disabled={connecting}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold px-10 py-4 rounded-xl transition-all text-base disabled:opacity-50"
          >
            {connecting ? 'Connecting...' : 'Connect Wallet to Start'}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto px-6 mb-20">
        {[
          { label: 'Tokens Launched', value: '0' },
          { label: 'Total Volume', value: '0 XRS' },
          { label: 'Active Traders', value: '0' },
        ].map((s, i) => (
          <div key={i} className="bg-white/3 border border-white/5 rounded-2xl p-5 text-center">
            <div className="text-2xl font-black text-white mb-1">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
