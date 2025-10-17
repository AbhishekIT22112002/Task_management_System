import React, { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Bot, Send, Sparkles, MessageCircle, X, Maximize2, Minimize2, Loader2 } from 'lucide-react'
import { aiSummarize, aiAsk } from '../api'
const mockResponses = {
  summarize: "Based on your current tasks, here's a summary:\n\n• **High Priority**: 2 tasks related to authentication need immediate attention\n• **In Progress**: 2 tasks are currently being worked on\n• **Completed**: 1 documentation task was finished recently\n• **Overdue**: No tasks are currently overdue\n\nRecommendation: Focus on completing the authentication API implementation first, as it's blocking other tasks.",
  
  default: [
    "I can help you summarize your tasks, answer questions about your projects, or provide suggestions for task management.",
    "Would you like me to analyze your current project status and provide recommendations?",
    "I can help you prioritize tasks, identify bottlenecks, or suggest ways to improve team productivity.",
    "Feel free to ask me about any specific task or project - I'm here to help!"
  ]
}

export default function AIAssistant({ projectId, isOpen, onClose, autoSummarize = false }) {
  const [isMaximized, setIsMaximized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "👋 Hi! I'm your AI assistant. I can summarize tasks and answer questions about this project.",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const projects = useSelector((s) => s.projects.items || [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const runSummarize = async () => {
    if (!projectId) return
    setIsLoading(true)
    try {
      const { summary } = await aiSummarize(projectId)
      setMessages(prev => [
        ...prev,
        { id: Date.now(), type: 'user', content: 'Summarize all tasks', timestamp: new Date() },
        { id: Date.now() + 1, type: 'ai', content: summary, timestamp: new Date() }
      ])
    } catch (e) {
      console.error('AI summarize failed:', e)
      setMessages(prev => [
        ...prev,
        { id: Date.now(), type: 'ai', content: 'Failed to summarize tasks. Please try again.', timestamp: new Date() }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && autoSummarize) {
      // Trigger once on open when requested
      runSummarize()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, autoSummarize])

  const generateAIResponse = (userMessage) => {
    const message = userMessage.toLowerCase()
    
    if (message.includes('summarize') || message.includes('summary')) {
      return mockResponses.summarize
    }
    
    if (message.includes('help') || message.includes('what can you do')) {
      return "I can help you with:\n\n📊 **Task Summarization** - Get insights about your project progress\n❓ **Project Q&A** - Ask questions about specific tasks or projects\n📈 **Productivity Tips** - Receive suggestions for better task management\n🎯 **Priority Recommendations** - Help prioritize your work\n\nTry asking: 'Summarize my tasks' or 'What should I focus on next?'"
    }
    
    if (message.includes('priority') || message.includes('focus') || message.includes('next')) {
      return "Based on your current workload, I recommend focusing on:\n\n1. **Authentication API implementation** (High priority, currently in progress)\n2. **Login page design** (High priority, blocking other UI work)\n3. **Unit tests** (Medium priority, good for code quality)\n\nThese tasks appear to be on the critical path for your project."
    }
    
    if (message.includes('project') && projects.length > 0) {
      return `You currently have ${projects.length} project${projects.length !== 1 ? 's' : ''}:\n\n${projects.map(p => `• **${p.name}** - ${p.description || 'No description'}`).join('\n')}\n\nWould you like me to analyze any specific project?`
    }
    
    // Random helpful response
    const randomResponse = mockResponses.default[Math.floor(Math.random() * mockResponses.default.length)]
    return randomResponse
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const question = inputValue.trim()

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: question,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const { answer } = await aiAsk(projectId, question)
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: answer,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    } catch (e) {
      console.error('AI ask failed:', e)
      setMessages(prev => [...prev, { id: Date.now() + 2, type: 'ai', content: 'Failed to get AI response. Please try again.', timestamp: new Date() }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatMessage = (content) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('• **') && line.includes('**')) {
        const parts = line.split('**')
        return (
          <div key={index} className="message-list-item">
            <span className="bullet">•</span>
            <span className="bold">{parts[1]}</span>
            <span>{parts[2]}</span>
          </div>
        )
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={index} className="message-heading">{line.slice(2, -2)}</div>
      }
      if (line.includes('**')) {
        const parts = line.split('**')
        return (
          <div key={index}>
            {parts.map((part, i) => 
              i % 2 === 0 ? part : <span key={i} className="bold">{part}</span>
            )}
          </div>
        )
      }
      return line ? <div key={index}>{line}</div> : <br key={index} />
    })
  }

  const quickActions = [
    { label: "Summarize my tasks", action: () => setInputValue("Summarize my tasks") },
    { label: "What should I focus on?", action: () => setInputValue("What should I focus on next?") },
    { label: "Show project status", action: () => setInputValue("Show me my project status") },
  ]

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`ai-assistant ${isMaximized ? 'maximized' : ''}`} onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="ai-header">
        <div className="ai-title">
          <Bot size={20} />
          <span>AI Assistant</span>
          <div className="status-indicator online"></div>
        </div>
        
        <div className="ai-actions">
          <button
            className="btn btn-ghost btn-sm btn-icon"
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? "Minimize" : "Maximize"}
          >
            {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          
          <button
            className="btn btn-ghost btn-sm btn-icon"
            onClick={onClose}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="ai-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-avatar">
              {message.type === 'ai' ? <Bot size={16} /> : <MessageCircle size={16} />}
            </div>
            
            <div className="message-content">
              <div className="message-text">
                {formatMessage(message.content)}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai">
            <div className="message-avatar">
              <Bot size={16} />
            </div>
            <div className="message-content">
              <div className="message-text loading-message">
                <Loader2 size={16} className="spinning" />
                <span>AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="quick-actions-title">Quick actions:</div>
        <div className="quick-actions-buttons">
          <button className="btn btn-ghost btn-sm" onClick={runSummarize} disabled={isLoading}>
            <Sparkles size={14} /> Summarize All Tasks
          </button>
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="btn btn-ghost btn-sm"
              onClick={action.action}
            >
              <Sparkles size={14} />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="ai-input">
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your tasks, projects, or productivity tips..."
            rows={1}
            disabled={isLoading}
            style={{
              resize: 'none',
              overflow: 'hidden',
              minHeight: '20px',
              maxHeight: '100px'
            }}
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = e.target.scrollHeight + 'px'
            }}
          />
          
          <button
            className="btn btn-primary btn-sm btn-icon"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            title="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}
