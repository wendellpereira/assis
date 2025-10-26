import json

import streamlit as st

from config import model_options, system_presets


def render_sidebar(storage):
  with st.sidebar:
    st.header('💬 Conversations')

    # New conversation button
    col1, col2 = st.columns([3, 1])
    with col1:
        if st.button('➕ New Conversation', use_container_width=True):
            # Create new conversation
            new_id = storage.create_conversation('New Conversation')
            st.session_state.current_conversation_id = new_id
            st.session_state.messages = []
            st.session_state.token_usage = {'input_tokens': 0, 'output_tokens': 0}
            st.session_state.model_used = None
            st.rerun()

    with col2:
        if st.button('🗑️', use_container_width=True, help='Clear current conversation'):
            st.session_state.messages = []
            st.session_state.token_usage = {'input_tokens': 0, 'output_tokens': 0}
            st.session_state.model_used = None
            if 'current_conversation_id' in st.session_state:
                del st.session_state.current_conversation_id
            st.rerun()

    # List existing conversations
    conversations = storage.get_all_conversations()
    if conversations:
        st.write('**Recent Conversations:**')
        for conv in conversations[:10]:  # Show last 10
            col1, col2 = st.columns([4, 1])
            with col1:
                # Truncate title if too long
                display_title = conv['title'][:30] + '...' if len(conv['title']) > 30 else conv['title']
                is_current = st.session_state.get('current_conversation_id') == conv['id']
                button_label = f"{'▶ ' if is_current else ''}{display_title}"

                if st.button(button_label, key=f"load_{conv['id']}", use_container_width=True):
                    # Load conversation
                    st.session_state.current_conversation_id = conv['id']
                    messages = storage.get_messages(conv['id'])
                    st.session_state.messages = [
                        {'role': msg['role'], 'content': msg['content']}
                        for msg in messages
                    ]
                    st.session_state.token_usage = {
                        'input_tokens': conv['total_input_tokens'],
                        'output_tokens': conv['total_output_tokens']
                    }
                    st.session_state.model_used = conv['model_used']
                    st.rerun()

            with col2:
                if st.button('❌', key=f"del_{conv['id']}", help='Delete conversation'):
                    storage.delete_conversation(conv['id'])
                    if st.session_state.get('current_conversation_id') == conv['id']:
                        st.session_state.messages = []
                        st.session_state.token_usage = {'input_tokens': 0, 'output_tokens': 0}
                        del st.session_state.current_conversation_id
                    st.rerun()

    st.divider()

    # Rename current conversation
    if 'current_conversation_id' in st.session_state:
        current_conv = storage.get_conversation(st.session_state.current_conversation_id)
        if current_conv:
            new_title = st.text_input(
                'Conversation Title',
                value=current_conv['title'],
                key='conv_title'
            )
            if new_title != current_conv['title'] and st.button('💾 Save Title', use_container_width=True):
                storage.update_conversation_title(st.session_state.current_conversation_id, new_title)
                st.rerun()

    # Export options
    st.write('**Export:**')
    col1, col2 = st.columns(2)
    with col1:
        if st.session_state.current_conversation_id:
            markdown_export = storage.export_conversation_to_markdown(st.session_state.current_conversation_id)
            current_conv = storage.get_conversation(st.session_state.current_conversation_id)
            file_name = f"{current_conv['title']}.md" if current_conv else 'conversation.md'
            st.download_button(
                '📄 Markdown',
                markdown_export,
                file_name=file_name,
                mime='text/markdown',
                use_container_width=True
            )
        else:
            st.button('📄 Markdown', disabled=True, use_container_width=True, help='No conversation to export')
    with col2:
        if st.session_state.current_conversation_id:
            json_export = storage.export_conversation_to_json(st.session_state.current_conversation_id)
            current_conv = storage.get_conversation(st.session_state.current_conversation_id)
            file_name = f"{current_conv['title']}.json" if current_conv else 'conversation.json'
            st.download_button(
                '📋 JSON',
                json.dumps(json_export, indent=2),
                file_name=file_name,
                mime='application/json',
                use_container_width=True
            )
        else:
            st.button('📋 JSON', disabled=True, use_container_width=True, help='No conversation to export')

    st.divider()

    st.header('⚙️ Configuration')

    # Load saved settings
    saved_model = storage.get_setting('model', model_options[0])
    saved_temp = storage.get_setting('temperature', 0.7)
    saved_max_tokens = storage.get_setting('max_tokens', 1024)
    saved_preset = storage.get_setting('preset', 'Default')

    # Model selection
    model = st.selectbox(
        'Model',
        model_options,
        index=model_options.index(saved_model) if saved_model in model_options else 0
    )

    preset_selection = st.selectbox(
        'System Message Preset',
        options=list(system_presets.keys()),
        index=list(system_presets.keys()).index(saved_preset) if saved_preset in system_presets else 0
    )

    system_message = st.text_area(
        'System Message',
        value=system_presets[preset_selection],
        help='Set the behavior and context for the AI assistant'
    )

    # Temperature slider
    temperature = st.slider(
        'Temperature',
        min_value=0.0,
        max_value=1.0,
        value=float(saved_temp),
        step=0.1,
        help='Higher = more creative, Lower = more focused'
    )

    # Max tokens
    max_tokens = st.number_input(
        'Max Tokens',
        min_value=100,
        max_value=4096,
        value=int(saved_max_tokens),
        step=100
    )

    # Save settings button
    if st.button('💾 Save Settings', use_container_width=True):
        storage.save_setting('model', model)
        storage.save_setting('temperature', temperature)
        storage.save_setting('max_tokens', max_tokens)
        storage.save_setting('preset', preset_selection)
        st.success('Settings saved!')

    st.divider()

    # Stats
    if 'messages' in st.session_state:
        msg_count = len(st.session_state.messages)
        st.metric('Messages', msg_count)

    if 'token_usage' in st.session_state:
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric('Input Tokens', st.session_state.token_usage['input_tokens'])
        with col2:
            st.metric('Output Tokens', st.session_state.token_usage['output_tokens'])
        with col3:
          st.metric('Total Tokens', st.session_state.token_usage['input_tokens'] + st.session_state.token_usage['output_tokens'])

    st.divider()

    # Add this in the sidebar stats section to display the model used
    if 'model_used' in st.session_state and st.session_state.model_used:
        st.metric('Last model used', st.session_state.model_used)

    st.divider()

    # Return configuration values
    return {
        'model': model,
        'temperature': temperature,
        'max_tokens': max_tokens,
        'system_message': system_message
    }
