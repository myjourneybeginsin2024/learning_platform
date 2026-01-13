import json
import os
from http import HTTPStatus
from app.core.config import settings
from openai import OpenAI

# Configure OpenAI Client for DashScope
client = OpenAI(
    api_key=settings.DASHSCOPE_API_KEY.strip(),
    base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
)

class LLMService:
    @staticmethod
    def generate_curriculum(text_content: str):
        """
        Send document content to Qwen (via OpenAI SDK) and expect a structured JSON response.
        Handles large documents by chunking.
        """
        # Sanitize text
        if text_content:
            try:
                text_content = text_content.encode('utf-8', 'ignore').decode('utf-8')
            except Exception as e:
                print(f"Warning: Text sanitization failed: {e}")

        # Chunking Logic
        CHUNK_SIZE = 25000  # Process 25k chars at a time to ensure output fits in token limit
        chunks = [text_content[i:i+CHUNK_SIZE] for i in range(0, len(text_content), CHUNK_SIZE)]
        
        all_modules = []
        main_topic_candidate = "Comprehensive Course"

        import re

        print(f"Processing {len(chunks)} chunks...")

        for idx, chunk in enumerate(chunks):
            print(f"Generating for Chunk {idx + 1}/{len(chunks)}...")
            
            prompt = f"""
            You are an expert, world-class educational curriculum designer.
            You are analyzing PART {idx + 1} of {len(chunks)} of a large document.
            
            Analyze THIS SPECIFIC PART detailedly and generate curriculum modules for it.
            
            CRITICAL INSTRUCTIONS:
            1. MAXIMIZE CONTENT LENGTH: Extract every detail from this specific chunk.
            2. IGNORE previous or future parts; focus only on the text provided below.
            3. STRUCTURE: 
               - Identify the "Main Topic" (only if it's the first chunk, otherwise reuse context).
               - Break it down into "Sub Topics" (Modules).
               - Output must use the EXACT TAGS defined below.

            OUTPUT FORMAT:
            <TOPIC>Title of the Main Course (Optional if not clear)</TOPIC>
            <MODULE>
            <TITLE>Sub-topic Title</TITLE>
            <CONTENT>
            ### Summary
            [Write a clear summary here]

            ### Detailed Content
            [Write EXTREMELY DETAILED content here. Use paragraphs, bullet points. Be exhaustive.]
            </CONTENT>
            </MODULE>
            
            Document Content (Part {idx + 1}):
            {chunk}
            """

            try:
                completion = client.chat.completions.create(
                    model="qwen-plus", 
                    messages=[
                        {'role': 'system', 'content': 'You are a helpful assistant.'},
                        {'role': 'user', 'content': prompt}
                    ]
                )
                
                content = completion.choices[0].message.content
                
                # Extract Top Topic only from first chunk
                if idx == 0:
                    topic_match = re.search(r'<TOPIC>(.*?)</TOPIC>', content, re.DOTALL)
                    if topic_match:
                        main_topic_candidate = topic_match.group(1).strip()

                # Extract Modules
                module_matches = re.findall(r'<MODULE>(.*?)</MODULE>', content, re.DOTALL)
                
                for mod in module_matches:
                    title_match = re.search(r'<TITLE>(.*?)</TITLE>', mod, re.DOTALL)
                    body_match = re.search(r'<CONTENT>(.*?)</CONTENT>', mod, re.DOTALL)
                    
                    if title_match and body_match:
                        all_modules.append({
                            "title": title_match.group(1).strip(),
                            "content": body_match.group(1).strip()
                        })

            except Exception as e:
                print(f"Error generating chunk {idx}: {e}")
                # Continue to next chunk instead of failing entire batch

        if not all_modules:
             return {
                 "main_topic": "Generation Failed",
                 "sub_topics": [{"title": "Error", "content": "Could not generate content."}]
             }

        return {
            "main_topic": main_topic_candidate,
            "sub_topics": all_modules
        }
