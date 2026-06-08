import base64
from google import genai
from google.genai import types

try:
    client = genai.Client(api_key="fake_key")
    image_bytes = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=")
    prompt_text = "test"
    
    safety_settings = [
        types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="BLOCK_NONE"),
        types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="BLOCK_NONE"),
        types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="BLOCK_NONE"),
        types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="BLOCK_NONE"),
    ]
    
    response = client.models.generate_content(
        model='gemini-1.5-flash',
        contents=[prompt_text, types.Part.from_bytes(data=image_bytes, mime_type="image/png")],
        config=types.GenerateContentConfig(response_mime_type="application/json", safety_settings=safety_settings)
    )
except Exception as e:
    import traceback
    traceback.print_exc()
