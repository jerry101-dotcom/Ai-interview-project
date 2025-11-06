import { useState, useEffect, useRef } from "react"
import { FaArrowUp } from "react-icons/fa"
import ReactMarkdown from "react-markdown"
import { getResponseFromGemini } from "../ai"

export default function Main() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function submit(e) {
    e?.preventDefault()
    if (!inputValue.trim()) return
    if (isLoading) return

    const userMessage = {
      role: "user",
      content: inputValue,
      timestamp: new Date().toISOString()
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)


    try {

      const assistantText = await getResponseFromGemini(inputValue)

      const assistantMessage = {
        role: "assistant",
        content: <ReactMarkdown>{assistantText}</ReactMarkdown>,
        timestamp: new Date().toISOString()
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {

      const errorMessage = {
        role: "assistant",
        content: "Sorry — I couldn't get a response right now. Please try again.",
        timestamp: new Date().toISOString()
      }
      setMessages((prev) => [...prev, errorMessage])
      console.error("Submit error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <header>
        <h1>OmniHealth AI</h1>
      </header>
      <main className="main-content">
        <section className="ai-section">
          {messages.length < 1 ? (
            <div className="welcome-text">
              <h2>Welcome to OmniHealth AI</h2>
              <p>Your professional virtual medical assistant.</p>
              <p>Ask me about symptoms, differential diagnoses, suggested tests, treatment options, and more.</p>
            </div>
          ) : null}

          <div className="ai-response">
            {messages.length > 0 ? (
              messages.map((message, index) => (
                <div key={index} className={message.role === "user" ? "user-message" : "ai-message"}>
                  <p>{message.content}</p>
                </div>
              ))
            ) : (
              <div className="placeholder-text">
                <p>Describe your symptoms or medical question below to get started.</p>
              </div>
            )}

            {isLoading && (
              <div className="ai-message skeleton-loader" aria-live="polite"></div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="ai-form">
            <form onSubmit={submit} className="ai-input-div">
              <input
                aria-label="Describe your symptoms or medical question in this input"
                type="text"
                placeholder="Describe your symptoms or medical question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    submit(e)
                  }
                }}
                disabled={isLoading}
                aria-busy={isLoading}
              />
              <button
                aria-label="submit-button"
                type="submit"
                disabled={isLoading}
              >
                <FaArrowUp />
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  )
}
