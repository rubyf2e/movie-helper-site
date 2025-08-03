import requests
from flask import current_app
from concurrent.futures import ThreadPoolExecutor


class TMDBService:
    """TMDB API 服務類"""
    YOUTUBE_EMBED_URL = 'https://www.youtube.com/embed/'

    @staticmethod
    def _make_request(endpoint, params=None, api_key=None, base_url=None, language=None):
        """統一的 API 請求方法"""
        base_url = base_url or current_app.config['TMDB_BASE_URL']
        api_key = api_key or current_app.config['TMDB_API_KEY']
        language = language or current_app.config['TMDB_MOVIE_LANGUAGE']

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


    def find_best_trailer_key(videos):
        if not videos:
            return None

        # 定義優先順序
        type_priority = ['Trailer', 'Teaser']
        
        # 篩選官方 YouTube 影片
        youtube_videos = [v for v in videos if v.get('site') == 'YouTube' and v.get('official')]
        
        for video_type in type_priority:
            candidates = [v for v in youtube_videos if v.get('type') == video_type]
            if candidates:
                # 依日期排序，取得最新的
                candidates.sort(key=lambda x: x.get('published_at', ''), reverse=True)
                # 優先找台灣地區
                tw_version = next((c for c in candidates if c.get('iso_3166_1') == 'TW'), None)
                return tw_version['key'] if tw_version else candidates[0]['key']

        # 如果官方影片都找不到，退而求其次找任何 YouTube 影片
        any_youtube_video = next((v for v in videos if v.get('site') == 'YouTube'), None)
        if any_youtube_video:
            return any_youtube_video.get('key')
            
        return None

    @classmethod
    def process_movie_data(cls, movie, api_key=None, base_url=None, language=None):
        videos = cls.fetch_movie_videos(movie,
                api_key=api_key,
                base_url=base_url,
                language=language)

        trailer_key = cls.find_best_trailer_key(videos['results'])
        url = f"{cls.YOUTUBE_EMBED_URL}{trailer_key}" if trailer_key else None

        return {'id': movie, 'url':  url}        

    @classmethod
    def fetch_movie_videos(cls, movie_id, api_key=None, base_url=None, language=None):
        """取得電影預告片/影片資訊"""
        endpoint = f"/movie/{movie_id}/videos"
        return cls._make_request(endpoint, api_key=api_key, base_url=base_url, language=language)

    @classmethod
    def get_coming_soon_movies(cls,min_date, max_date, page=1):
        """獲取熱門電影"""
        endpoint = "/discover/movie"
        params = {
            'region':'TW',
            'sort_by': 'popularity.desc',
            'with_release_type':'2|3',
            'release_date.gte':min_date,
            'release_date.lte':max_date,
            'page': page
        }
        return cls._make_request(endpoint, params)

     
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
