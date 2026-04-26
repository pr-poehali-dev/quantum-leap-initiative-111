import json
import os
import psycopg


def handler(event: dict, context) -> dict:
    """Записывает клик по ссылке и возвращает общий счётчик кликов."""
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    with psycopg.connect(os.environ['DATABASE_URL']) as conn:
        if event.get('httpMethod') == 'POST':
            body = json.loads(event.get('body') or '{}')
            url = body.get('url', '')
            if url:
                conn.execute("INSERT INTO link_clicks (url) VALUES (%s)", (url,))
                conn.commit()

        row = conn.execute("SELECT COUNT(*) FROM link_clicks").fetchone()
        total = row[0] if row else 0

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'total': int(total)})
    }
