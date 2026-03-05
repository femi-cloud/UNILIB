# test_gemini.py
import google.generativeai as genai

# ✅ Remplace par ta NOUVELLE clé API
genai.configure(api_key="AIzaSyAbs6_xlR6vqSUmAIIkqz0_hPEVRVzdxWc")

# Test 1 : gemini-1.5-pro
try:
    print("🧪 Test gemini-1.5-pro...")
    model = genai.GenerativeModel('gemini-1.5-pro')
    response = model.generate_content("Dis bonjour")
    print(f"✅ gemini-1.5-pro fonctionne : {response.text}\n")
except Exception as e:
    print(f"❌ gemini-1.5-pro erreur : {e}\n")

# Test 2 : gemini-pro
try:
    print("🧪 Test gemini-pro...")
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("Dis bonjour")
    print(f"✅ gemini-pro fonctionne : {response.text}\n")
except Exception as e:
    print(f"❌ gemini-pro erreur : {e}\n")

# Test 3 : gemini-2.5-flash (pour vérifier si quota épuisé)
try:
    print("🧪 Test gemini-2.5-flash...")
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content("Dis bonjour")
    print(f"✅ gemini-2.5-flash fonctionne : {response.text}\n")
except Exception as e:
    print(f"❌ gemini-2.5-flash erreur : {e}\n")

# Test 4 : Lister tous les modèles disponibles
try:
    print("📋 Modèles Gemini disponibles avec ta clé :")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"  ✅ {m.name}")
except Exception as e:
    print(f"❌ Erreur liste modèles : {e}")