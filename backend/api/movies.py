from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
from service.tmdb_service import TMDBService

movies_bp = Blueprint('movies', __name__)

@movies_bp.route('/coming_soon')
def get_coming_soon_movies():
    """獲取即將上映電影"""
    try:
        page = request.args.get('page', 1, type=int)
        # 今天日期
        today = datetime.today()
        # 一個月後日期
        one_month_later = today + timedelta(days=30)

        # 格式化成字串
        min_date = today.strftime("%Y-%m-%d")
        max_date = one_month_later.strftime("%Y-%m-%d")

        min_date = request.args.get('min_date', min_date)
        max_date = request.args.get('max_date', max_date)

        data = TMDBService.get_coming_soon_movies(min_date, max_date, page)
        
        # 處理電影資料，添加圖片 URL
        movies = []
        for movie in data.get('results', []):
            movie_data = {
                'id': movie.get('id'),
                'title': movie.get('title'),
                'overview': movie.get('overview'),
                'poster_path': TMDBService.get_image_url(movie.get('poster_path')),
                'backdrop_path': TMDBService.get_image_url(movie.get('backdrop_path')),
                'release_date': movie.get('release_date'),
                'vote_average': movie.get('vote_average'),
                'vote_count': movie.get('vote_count'),
                'genre_ids': movie.get('genre_ids', []),
                'adult': movie.get('adult'),
                'original_language': movie.get('original_language'),
                'popularity': movie.get('popularity'),
                'rating_color': TMDBService.get_rating_color(movie.get('vote_average', 0))
            }
            movies.append(movie_data)
        
        return jsonify({
            'success': True,
            'data': movies,
            'page': data.get('page'),
            'total_pages': data.get('total_pages'),
            'total_results': data.get('total_results')
        })
        
    except Exception as e:
        current_app.logger.error(f"獲取即將上映電影失敗: {e}")
        return jsonify({
            'success': False,
            'error': '無法獲取即將上映電影',
            'message': str(e)
        }), 500
        
        
@movies_bp.route('/popular')
def get_popular_movies():
    """獲取熱門電影"""
    try:
        page = request.args.get('page', 1, type=int)
        data = TMDBService.get_popular_movies(page)
        
        # 處理電影資料，添加圖片 URL
        movies = []
        for movie in data.get('results', []):
            movie_data = {
                'id': movie.get('id'),
                'title': movie.get('title'),
                'overview': movie.get('overview'),
                'poster_path': TMDBService.get_image_url(movie.get('poster_path')),
                'backdrop_path': TMDBService.get_image_url(movie.get('backdrop_path')),
                'release_date': movie.get('release_date'),
                'vote_average': movie.get('vote_average'),
                'vote_count': movie.get('vote_count'),
                'genre_ids': movie.get('genre_ids', []),
                'adult': movie.get('adult'),
                'original_language': movie.get('original_language'),
                'popularity': movie.get('popularity'),
                'rating_color': TMDBService.get_rating_color(movie.get('vote_average', 0))
            }
            movies.append(movie_data)
        
        return jsonify({
            'success': True,
            'data': movies,
            'page': data.get('page'),
            'total_pages': data.get('total_pages'),
            'total_results': data.get('total_results')
        })
        
    except Exception as e:
        current_app.logger.error(f"獲取熱門電影失敗: {e}")
        return jsonify({
            'success': False,
            'error': '無法獲取熱門電影',
            'message': str(e)
        }), 500

@movies_bp.route('/search')
def search_movies():
    """搜尋電影"""
    try:
        query = request.args.get('q', '').strip()
        page = request.args.get('page', 1, type=int)
        
        if not query:
            return jsonify({
                'success': False,
                'error': '搜尋關鍵字不能為空'
            }), 400
        
        data = TMDBService.search_movies(query, page)
        
        # 處理搜尋結果
        movies = []
        for movie in data.get('results', []):
            movie_data = {
                'id': movie.get('id'),
                'title': movie.get('title'),
                'overview': movie.get('overview'),
                'poster_path': TMDBService.get_image_url(movie.get('poster_path')),
                'backdrop_path': TMDBService.get_image_url(movie.get('backdrop_path')),
                'release_date': movie.get('release_date'),
                'vote_average': movie.get('vote_average'),
                'vote_count': movie.get('vote_count'),
                'genre_ids': movie.get('genre_ids', []),
                'adult': movie.get('adult'),
                'original_language': movie.get('original_language'),
                'popularity': movie.get('popularity'),
                'rating_color': TMDBService.get_rating_color(movie.get('vote_average', 0))
            }
            movies.append(movie_data)
        
        return jsonify({
            'success': True,
            'data': movies,
            'query': query,
            'page': data.get('page'),
            'total_pages': data.get('total_pages'),
            'total_results': data.get('total_results')
        })
        
    except Exception as e:
        current_app.logger.error(f"搜尋電影失敗: {e}")
        return jsonify({
            'success': False,
            'error': '搜尋電影失敗',
            'message': str(e)
        }), 500

@movies_bp.route('/genres')
def get_genres():
    """獲取電影類型列表"""
    try:
        data = TMDBService.get_genres()
        return jsonify({
            'success': True,
            'data': data.get('genres', [])
        })
        
    except Exception as e:
        current_app.logger.error(f"獲取類型列表失敗: {e}")
        return jsonify({
            'success': False,
            'error': '無法獲取類型列表',
            'message': str(e)
        }), 500

@movies_bp.route('/genre/<int:genre_id>')
def get_movies_by_genre(genre_id):
    """根據類型獲取電影"""
    try:
        page = request.args.get('page', 1, type=int)
        data = TMDBService.get_movies_by_genre(genre_id, page)
        
        # 處理電影資料
        movies = []
        for movie in data.get('results', []):
            movie_data = {
                'id': movie.get('id'),
                'title': movie.get('title'),
                'overview': movie.get('overview'),
                'poster_path': TMDBService.get_image_url(movie.get('poster_path')),
                'backdrop_path': TMDBService.get_image_url(movie.get('backdrop_path')),
                'release_date': movie.get('release_date'),
                'vote_average': movie.get('vote_average'),
                'vote_count': movie.get('vote_count'),
                'genre_ids': movie.get('genre_ids', []),
                'adult': movie.get('adult'),
                'original_language': movie.get('original_language'),
                'popularity': movie.get('popularity'),
                'rating_color': TMDBService.get_rating_color(movie.get('vote_average', 0))
            }
            movies.append(movie_data)
        
        return jsonify({
            'success': True,
            'data': movies,
            'genre_id': genre_id,
            'page': data.get('page'),
            'total_pages': data.get('total_pages'),
            'total_results': data.get('total_results')
        })
        
    except Exception as e:
        current_app.logger.error(f"根據類型獲取電影失敗: {e}")
        return jsonify({
            'success': False,
            'error': '無法獲取該類型的電影',
            'message': str(e)
        }), 500

@movies_bp.route('/<int:movie_id>')
def get_movie_details(movie_id):
    """獲取電影詳細資訊"""
    try:
        data = TMDBService.get_movie_details(movie_id)
        
        # 處理電影詳細資料
        movie_details = {
            'id': data.get('id'),
            'title': data.get('title'),
            'original_title': data.get('original_title'),
            'overview': data.get('overview'),
            'poster_path': TMDBService.get_image_url(data.get('poster_path')),
            'backdrop_path': TMDBService.get_image_url(data.get('backdrop_path')),
            'release_date': data.get('release_date'),
            'runtime': data.get('runtime'),
            'vote_average': data.get('vote_average'),
            'vote_count': data.get('vote_count'),
            'genres': data.get('genres', []),
            'production_companies': data.get('production_companies', []),
            'production_countries': data.get('production_countries', []),
            'spoken_languages': data.get('spoken_languages', []),
            'budget': data.get('budget'),
            'revenue': data.get('revenue'),
            'adult': data.get('adult'),
            'homepage': data.get('homepage'),
            'imdb_id': data.get('imdb_id'),
            'original_language': data.get('original_language'),
            'popularity': data.get('popularity'),
            'status': data.get('status'),
            'tagline': data.get('tagline'),
            'credits': data.get('credits', {}),
            'rating_color': TMDBService.get_rating_color(data.get('vote_average', 0))
        }
        
        return jsonify({
            'success': True,
            'data': movie_details
        })
        
    except Exception as e:
        current_app.logger.error(f"獲取電影詳細資訊失敗: {e}")
        return jsonify({
            'success': False,
            'error': '無法獲取電影詳細資訊',
            'message': str(e)
        }), 500

@movies_bp.route('/analyze-movie-preference', methods=['POST', 'OPTIONS'])
def analyze_movie_preference():
    """電影 API 總覽"""
    return jsonify({
        'message': '電影小幫手 API',
        'available_endpoints': {
            'popular': '/api/movies/popular - 獲取熱門電影',
            'search': '/api/movies/search?q=關鍵字 - 搜尋電影',
            'genres': '/api/movies/genres - 獲取類型列表',
            'by_genre': '/api/movies/genre/{genre_id} - 根據類型獲取電影',
            'details': '/api/movies/{movie_id} - 獲取電影詳細資訊'
        }
    })
    
       
    # def call_tmdb(movie_title, movie_target):
    #     print("[call_tmdb] in")
    #     print("movie_title : ", movie_title)
    #     print("movie_target : ", movie_target)
    #     baseUrl = "https://api.themoviedb.org/3/search/movie?"
    #     parameters = "language=" + "zh-TW"
    #     parameters += "&"
    #     parameters += "query=" + movie_title

    #     headers = {
    #         "accept": "application/json",
    #         "Authorization": "Bearer " + current_app.config['TMDB_API_TOKEN'],
    #     }

    #     response = requests.get(baseUrl + parameters, headers=headers)
    #     result = json.loads(response.text)
    #     print(result)
    #     if len(result["results"]) != 0:
    #         if movie_target == "overview":
    #             if "overview" in result["results"][0] and len(result["results"][0]["overview"])!=0:
    #                 return TextMessage(text=result["results"][0]["title"]), TextMessage(text=result["results"][0]["overview"])
    #             else:
    #                 return TextMessage(text=result["results"][0]["title"]), TextMessage(text="該電影沒有簡介")
    #         elif movie_target == "poster":
    #             if "poster_path" in result["results"][0]:
    #                 imageUri = "https://image.tmdb.org/t/p/original" + result["results"][0]["poster_path"]
    #                 return TextMessage(text=result["results"][0]["title"]), ImageMessage(
    #                     originalContentUrl=imageUri, previewImageUrl=imageUri
    #                 )
    #             else:
    #                 return TextMessage(text=result["results"][0]["title"]), TextMessage(text="該電影沒有海報")
    #         else:
    #             if "overview" in result["results"][0]:
    #                 return TextMessage(text=result["results"][0]["title"]), TextMessage(text=result["results"][0]["overview"])
    #             else:
    #                 return TextMessage(text=result["results"][0]["title"]), TextMessage(text="該電影沒有簡介")
    #     else:
    #         return TextMessage(text="N/A"), TextMessage(text="很抱歉，系統內並無相關電影")


