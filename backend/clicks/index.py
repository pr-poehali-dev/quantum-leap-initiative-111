import json
import os
import psycopg
from datetime import datetime


def handler(event: dict, context) -> dict:
    """Записывает клик по ссылке и возвращает счётчик + историю переходов."""
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

        history_rows = conn.execute(
            "SELECT url, clicked_at FROM link_clicks ORDER BY clicked_at DESC LIMIT 50"
        ).fetchall()

    history = [
        {
            'url': r[0],
            'clicked_at': r[1].strftime('%d.%m.%Y %H:%M:%S') if isinstance(r[1], datetime) else str(r[1])
        }
        for r in history_rows
    ]

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'total': int(total), 'history': history})
    }
