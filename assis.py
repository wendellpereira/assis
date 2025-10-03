import streamlit as st
import anthropic
import os
from dotenv import load_dotenv
from config import model_options, system_presets

# environment variable for Anthropic API key
load_dotenv()  # Load variables from .env file if present to os.environ (apparently this loads to the OS)
envVars = os.environ
api_key = envVars["ANTHROPIC_API_KEY"]

# Page configuration
st.set_page_config(
    page_title="My AI Assistant",
    page_icon="🤖",
    layout="wide"
)

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
with st.sidebar:
    st.header("⚙️ Configuration")
        
    # Model selection
    model = st.selectbox(
        "Model",
        model_options,
        index=0
    )
    
    preset_selection = st.selectbox(
        "System Message Preset",
        options=list(system_presets.keys()),
        index=0
    )

    system_message = st.text_area(
        "System Message",
        value=system_presets[preset_selection],
        help="Set the behavior and context for the AI assistant"
    )

    # Temperature slider
    temperature = st.slider(
        "Temperature",
        min_value=0.0,
        max_value=1.0,
        value=0.7,
        step=0.1,
        help="Higher = more creative, Lower = more focused"
    )
    
    # Max tokens
    max_tokens = st.number_input(
        "Max Tokens",
        min_value=100,
        max_value=4096,
        value=1024,
        step=100
    )
    
    st.divider()
    
    # Clear conversation button
    if st.button("🗑️ Clear Conversation", use_container_width=True):
        st.session_state.messages = []
        st.session_state.token_usage = {"input_tokens": 0, "output_tokens": 0}
        st.rerun()
    
    # Stats
    if "messages" in st.session_state:
        msg_count = len(st.session_state.messages)
        st.metric("Messages", msg_count)
        
    if "token_usage" in st.session_state:
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Input Tokens", st.session_state.token_usage["input_tokens"])
        with col2:
            st.metric("Output Tokens", st.session_state.token_usage["output_tokens"])
        with col3:
          st.metric("Total Tokens", st.session_state.token_usage["input_tokens"] + st.session_state.token_usage["output_tokens"])

    st.divider()

    # Add this in the sidebar stats section to display the model used
    if "model_used" in st.session_state and st.session_state.model_used:
        st.metric("Last model Used", st.session_state.model_used)

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

# Create Anthropic client
client = anthropic.Anthropic(api_key=api_key)

# Chat input
if prompt := st.chat_input("Ask me anything about AI, coding, or help building this app!"):
    
    # Check if API key is provided
    if not api_key:
        st.error("⚠️ Please enter your Anthropic API key in the sidebar!")
        st.stop()
    
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
            )
            
            with message_stream as stream:
                for chunk in stream:
                    if hasattr(chunk, 'delta') and hasattr(chunk.delta, 'text'):
                        # Add the new text chunk to the response
                        full_response += chunk.delta.text
                        message_placeholder.markdown(full_response + "▌")
                    # Capture model information
                    elif hasattr(chunk.message, 'model'):
                        st.session_state.model_used = chunk.message.model
                    # get token counts
                    elif hasattr(chunk, 'message') and hasattr(chunk.message, 'usage'):
                        # Update token usage when we get the final message
                        usage = chunk.message.usage
                        st.session_state.token_usage["input_tokens"] += usage.input_tokens
                        st.session_state.token_usage["output_tokens"] += usage.output_tokens
            
            # Display final response
            message_placeholder.markdown(full_response)

            # Auto scroll to bottom
            auto_scroll()
            
            # Add assistant response to history
            st.session_state.messages.append({
                "role": "assistant",
                "content": full_response
            })
            
        except anthropic.APIError as e:
            st.error(f"API Error: {str(e)}")
        except Exception as e:
            st.error(f"Error: {str(e)}")

# Help section in expander
with st.expander("ℹ️ How to use this assistant"):
    st.markdown("""
    ### Getting Started
    1. **Get API Key**: Visit [Anthropic Console](https://console.anthropic.com/) and create an API key
    2. **Enter Key**: Paste it in the sidebar (it's stored only in this session)
    3. **Start Chatting**: Ask questions about AI, get help with code, or discuss ideas!
    
    ### Tips for Learning
    - Ask the assistant to explain AI concepts step by step
    - Request code examples and explanations
    - Use it to debug and improve this very app!
    - Experiment with temperature settings to see different response styles
    
    ### Meta-Learning Ideas
    - Ask: "How can I add memory to this chat app?"
    - Ask: "Explain how streaming responses work in this code"
    - Ask: "What features should I add next?"
    - Ask: "How do I save conversations to a file?"
    """)

# Footer
st.divider()
st.caption("Built with ❤️ while learning AI Engineering | Powered by Claude")