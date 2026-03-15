from supabase import create_client, Client
from dotenv import load_dotenv

import os
supabase = "Potet"
try:

    load_dotenv()
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

except:
    print('Supashit no availabel')
    for i in range(10):
        print('Mangler .env for å koble til supabase!!!')

