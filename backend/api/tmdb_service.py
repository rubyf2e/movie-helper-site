import requests
from flask import current_app

class TMDBService:
    """TMDB API 服務類"""
    
    @staticmethod
    def _make_request(endpoint, params=None):
        """統一的 API 請求方法"""
        base_url = current_app.config['TMDB_BASE_URL']
        api_key = current_app.config['TMDB_API_KEY']
        language = current_app.config['TMDB_MOVIE_LANGUAGE']
        
        if not api_key:
            raise ValueError("TMDB API Key 未設置")
        
        # 基本參數
        request_params = {
            'api_key': api_key,
            'language': language
        }
        
        # 合併額外參數
        if params:
            request_params.update(params)
        
        url = f"{base_url}{endpoint}"
        
        try:
            response = requests.get(url, params=request_params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"TMDB API 請求失敗: {e}")
            raise
    
    @classmethod
    def get_popular_movies(cls, page=1):
        """獲取熱門電影"""
        endpoint = "/discover/movie"
        params = {
            'sort_by': 'popularity.desc',
            'page': page
        }
        return cls._make_request(endpoint, params)
    
    @classmethod
    def search_movies(cls, query, page=1):
        """搜尋電影"""
        endpoint = "/search/movie"
        params = {
            'query': query,
            'page': page
        }
        return cls._make_request(endpoint, params)
    
    @classmethod
    def get_movies_by_genre(cls, genre_id, page=1):
        """根據類型獲取電影"""
        endpoint = "/discover/movie"
        params = {
            'with_genres': genre_id,
            'sort_by': 'popularity.desc',
            'page': page
        }
        return cls._make_request(endpoint, params)
    
    @classmethod
    def get_movie_details(cls, movie_id):
        """獲取電影詳細資訊"""
        endpoint = f"/movie/{movie_id}"
        params = {
            'append_to_response': 'credits'
        }
        return cls._make_request(endpoint, params)
    
    @classmethod
    def get_genres(cls):
        """獲取電影類型列表"""
        endpoint = "/genre/movie/list"
        return cls._make_request(endpoint)
    
    @staticmethod
    def get_image_url(poster_path):
        """獲取圖片完整 URL"""
        if not poster_path:
            return "https://placehold.co/500x750/1f2937/6b7280?text=無圖片"
        
        img_base_url = current_app.config['TMDB_IMG_URL']
        return f"{img_base_url}{poster_path}"
    
    @staticmethod
    def get_rating_color(vote_average):
        """根據評分獲取顏色類別"""
        if vote_average >= 8:
            return "high"  # 高分
        elif vote_average >= 6:
            return "medium"  # 中等
        else:
            return "low"  # 低分
