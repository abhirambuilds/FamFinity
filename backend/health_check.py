import os


def main():
    url = os.getenv('SUPABASE_URL')
    anon = os.getenv('SUPABASE_ANON_KEY')
    srv = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    if not url:
        print('[warn] SUPABASE_URL is not set')
    if not anon:
        print('[warn] SUPABASE_ANON_KEY is not set (frontend/dev reads will fail)')
    if not srv:
        print('[warn] SUPABASE_SERVICE_ROLE_KEY is not set (server writes will fail)')
    if url and srv:
        print('[ok] Supabase server configuration detected')


if __name__ == '__main__':
    main()


