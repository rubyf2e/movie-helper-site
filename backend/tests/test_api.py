import pytest
from unittest.mock import patch, MagicMock

def test_health_check(client):
    """測試健康檢查端點"""
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'healthy'

def test_index_route(client):
    """測試首頁端點"""
    response = client.get('/')
    assert response.status_code == 200
    data = response.get_json()
    assert 'message' in data
    assert 'endpoints' in data

@patch('api.tmdb_service.requests.get')
def test_popular_movies(mock_get, client):
    """測試獲取熱門電影"""
    # 模擬 TMDB API 響應
    mock_response = MagicMock()
    mock_response.json.return_value = {
        'results': [
            {
                'id': 1,
                'title': '測試電影',
                'overview': '測試描述',
                'poster_path': '/test.jpg',
                'vote_average': 8.5
            }
        ],
        'page': 1,
        'total_pages': 1,
        'total_results': 1
    }
    mock_response.raise_for_status.return_value = None
    mock_get.return_value = mock_response
    
    response = client.get('/api/movies/popular')
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert len(data['data']) == 1
    assert data['data'][0]['title'] == '測試電影'

@patch('api.tmdb_service.requests.get')
def test_search_movies(mock_get, client):
    """測試搜尋電影"""
    # 模擬 TMDB API 響應
    mock_response = MagicMock()
    mock_response.json.return_value = {
        'results': [
            {
                'id': 1,
                'title': '復仇者聯盟',
                'overview': '超級英雄電影',
                'poster_path': '/avengers.jpg',
                'vote_average': 9.0
            }
        ],
        'page': 1,
        'total_pages': 1,
        'total_results': 1
    }
    mock_response.raise_for_status.return_value = None
    mock_get.return_value = mock_response
    
    response = client.get('/api/movies/search?q=復仇者')
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert data['query'] == '復仇者'

def test_search_movies_empty_query(client):
    """測試空搜尋關鍵字"""
    response = client.get('/api/movies/search')
    assert response.status_code == 400
    data = response.get_json()
    assert data['success'] is False
