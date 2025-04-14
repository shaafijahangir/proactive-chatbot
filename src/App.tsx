import { useState } from 'react'
import ChatWindow from './components/ChatWindow'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        <header className="bg-blue-600 text-white p-4">
          <h1 className="text-2xl font-bold">Proactive AI Chatbot</h1>
          <p className="text-blue-100">Ask me anything and I'll suggest follow-up questions</p>
        </header>
        <ChatWindow />
      </div>
    </div>
  )
}

export default App
