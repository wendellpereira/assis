import streamlit as st
import anthropic
import os
from dotenv import load_dotenv
from storage import ConversationStorage
from datetime import datetime
from sidebar import renderSideBar

# environment variable for Anthropic API key
load_dotenv()  # Load variables from .env file if present to os.environ (apparently this loads to the OS)
api_key = os.environ.get("ANTHROPIC_API_KEY")

# Page Configuration
st.set_page_config(
    page_title="My AI Assistant",
    page_icon="🤖",
    layout="wide"
)

# Initialize storage
storage = ConversationStorage()

st.title("🤖 My AI Learning Assistant")
st.caption("Built while learning AI - Meta learning in action!")

def auto_scroll():
    js = '''
    <script>
        function scroll() {
            window.scrollTo(0, document.body.scrollHeight);
        }
        scroll();
    </script>
    '''
    st.components.v1.html(js, height=0)

# Sidebar for API key and settings
renderSideBar(storage)

# Initialize session state for conversation history and token tracking
if "messages" not in st.session_state:
    st.session_state.messages = []
if "token_usage" not in st.session_state:
    st.session_state.token_usage = {"input_tokens": 0, "output_tokens": 0}
if "model_used" not in st.session_state:
    st.session_state.model_used = None

# Display conversation history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

if not api_key:
    st.error("⚠️ Please enter your Anthropic API key in the sidebar!")
    st.stop()
# Create Anthropic client
client = anthropic.Anthropic(api_key=api_key)

# Chat input
if prompt := st.chat_input("Ask me anything about AI, coding, or help building this app!"):
    
    # Check if API key is provided
    
    # Add user message to history
    st.session_state.messages.append({"role": "user", "content": prompt})
    
    # Display user message
    with st.chat_message("user"):
        st.markdown(prompt)
        auto_scroll()
    
    # Get AI response
    with st.chat_message("assistant"):
        message_placeholder = st.empty()
        full_response = ""
        
        try:
            # Prepare messages for API (convert session state format to API format)
            api_messages = [
                {"role": msg["role"], "content": msg["content"]}
                for msg in st.session_state.messages
            ]
            
            # Stream the response
            message_stream = client.messages.stream(
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=api_messages, 
                system=system_message,
            )
            
            with message_stream as stream:
                # Auto scroll to bottom
                auto_scroll()
                for chunk in stream:
                    delta = getattr(chunk, "delta", None)
                    if delta is not None and getattr(delta, "text", None):
                        # Add the new text chunk to the response
                        full_response += chunk.delta.text
                        message_placeholder.markdown(full_response + "▌")
                    # Capture model information
                    modelUsed = getattr(getattr(chunk, 'message', None), 'model', None)
                    if modelUsed:
                        st.session_state.model_used = chunk.message.model
                    # token usage (if present)
                    usage = getattr(getattr(chunk, "message", None), "usage", None)
                    if usage:
                        # Update token usage when we get the final message
                        usage = chunk.message.usage
                        st.session_state.token_usage["input_tokens"] += usage.input_tokens
                        st.session_state.token_usage["output_tokens"] += usage.output_tokens
                      
            
            # Display final response
            message_placeholder.markdown(full_response)

            
            # Add assistant response to history
            st.session_state.messages.append({
                "role": "assistant",
                "content": full_response
            })
            
            # Save to database
            if "current_conversation_id" not in st.session_state:
                # Create new conversation with first user message as title
                first_msg = st.session_state.messages[0]["content"][:50]
                conv_id = storage.create_conversation(first_msg)
                st.session_state.current_conversation_id = conv_id
            
            # Save the user message and assistant response
            storage.add_message(
                st.session_state.current_conversation_id,
                "user",
                prompt,
                input_tokens=0,
                output_tokens=0
            )
            storage.add_message(
                st.session_state.current_conversation_id,
                "assistant",
                full_response,
                input_tokens=usage.input_tokens if usage else 0,
                output_tokens=usage.output_tokens if usage else 0
            )
            
            # Update model used
            if modelUsed:
                storage.update_conversation_model(
                    st.session_state.current_conversation_id,
                    modelUsed
                )
            
        except anthropic.APIError as e:
            st.error(f"API Error: {str(e)}")
        except Exception as e:
            st.error(f"Error: {str(e)}")

# Help section in expander
with st.expander("ℹ️ How to use this assistant"):
    st.markdown("""
    ### Getting Started
    1. **Get API Key**: Visit [Anthropic Console](https://console.anthropic.com/) and create an API key
    2. **Configure Settings**: Choose your model, temperature, and system message in the sidebar
    3. **Start Chatting**: Ask questions about AI, get help with code, or discuss ideas!
    
    ### New Features: Conversation Management
    - **Auto-Save**: All conversations are automatically saved to a local database
    - **Load History**: Click on any past conversation to resume it
    - **Rename**: Edit conversation titles for better organization
    - **Export**: Download conversations as Markdown or JSON files
    - **Settings Persistence**: Your preferred settings are remembered across sessions
    
    ### Tips for Learning
    - Ask the assistant to explain AI concepts step by step
    - Request code examples and explanations
    - Use it to debug and improve this very app!
    - Experiment with temperature settings to see different response styles
    - Your conversation history is saved locally in `assis_data.db`
    
    ### Meta-Learning Ideas
    - Ask: "Explain how the conversation storage works in this app"
    - Ask: "How does SQLite handle concurrent connections?"
    - Ask: "What features should I add next to improve the UX?"
    - Ask: "How can I add search functionality to find past conversations?"
    """)

# Footer
st.divider()
st.caption("Built with ❤️ while learning AI Engineering | Powered by Claude | 💾 All conversations auto-saved")