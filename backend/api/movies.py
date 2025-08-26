from flask import Blueprint, request, jsonify, current_app
import requests, json
from functools import partial
from datetime import datetime, timedelta
from service.tmdb_service import TMDBService
from service.azure.openai_service import get_openai_service
from concurrent.futures import ThreadPoolExecutor

movies_bp = Blueprint('movies', __name__)


@movies_bp.route('/videos/<movie_ids>')
def get_movie_videos(movie_ids):
    if request.method == 'OPTIONS':
        return '', 200 
    
    try:
        movie_id_list = [int(x) for x in str(movie_ids).split(",")]
        process_func = partial(
            TMDBService.process_movie_data,
            api_key=current_app.config['TMDB_API_KEY'],
            base_url=current_app.config['TMDB_BASE_URL'],
            language=current_app.config['TMDB_MOVIE_LANGUAGE']
        )
                
        with ThreadPoolExecutor(max_workers=10) as executor:
            processed_movies = list(executor.map(process_func, movie_id_list))
            
            data = {}
            for item in processed_movies:
                data[item['id']] = item['url']
                    
            return jsonify({
                'success': True,
                'data': data
            })
    
    except Exception as e:
        current_app.custom_logger.error(f"獲取預告列表失敗: {e}")
        return jsonify({
            'success': False,
            'error': '無法獲取預告列表',
            'message': str(e)
        }), 500
        
@movies_bp.route('/coming_soon')
def get_coming_soon_movies():
    if request.method == 'OPTIONS':
        return '', 200 
    
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
        current_app.custom_logger.error(f"獲取即將上映電影失敗: {e}")
        return jsonify({
            'success': False,
            'error': '無法獲取即將上映電影',
            'message': str(e)
        }), 500
        
        
@movies_bp.route('/popular')
def get_popular_movies():
    if request.method == 'OPTIONS':
        return '', 200 
    
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
        current_app.custom_logger.error(f"獲取熱門電影失敗: {e}")
        return jsonify({
            'success': False,
            'error': '無法獲取熱門電影',
            'message': str(e)
        }), 500

@movies_bp.route('/search')
def search_movies():
    if request.method == 'OPTIONS':
        return '', 200 
    
    """搜尋電影"""
    try:
        query = request.args.get('q', '').strip()
        search_type = request.args.get('type', 'movie').strip()  # 新增搜尋類型參數
        page = request.args.get('page', 1, type=int)
        
        if not query:
            return jsonify({
                'success': False,
                'error': '搜尋關鍵字不能為空'
            }), 400
        
        # 根據搜尋類型選擇不同的搜尋方法
        if search_type == 'person':
            data = TMDBService.search_movies_by_person(query, page)
        else:
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
            
            # 如果是人物搜尋，添加額外資訊
            if search_type == 'person':
                movie_data['person_role'] = movie.get('person_role')
                movie_data['person_name'] = movie.get('person_name')
            
            movies.append(movie_data)
        
        response_data = {
            'success': True,
            'data': movies,
            'query': query,
            'search_type': search_type,
            'page': data.get('page'),
            'total_pages': data.get('total_pages'),
            'total_results': data.get('total_results')
        }
        
        # 如果是人物搜尋，添加人物資訊
        if search_type == 'person' and data.get('person_info'):
            response_data['person_info'] = data['person_info']
        
        return jsonify(response_data)
        
    except Exception as e:
        current_app.custom_logger.error(f"搜尋電影失敗: {e}")
        return jsonify({
            'success': False,
            'error': '搜尋電影失敗',
            'message': str(e)
        }), 500

@movies_bp.route('/genres')
def get_genres():
    if request.method == 'OPTIONS':
        return '', 200 
    
    """獲取電影類型列表"""
    try:
        data = TMDBService.get_genres()
        return jsonify({
            'success': True,
            'data': data.get('genres', [])
        })
        
    except Exception as e:
        current_app.custom_logger.error(f"獲取類型列表失敗: {e}")
        return jsonify({
            'success': False,
            'error': '無法獲取類型列表',
            'message': str(e)
        }), 500

@movies_bp.route('/genre/<int:genre_id>')
def get_movies_by_genre(genre_id):
    if request.method == 'OPTIONS':
        return '', 200 
    
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
        current_app.custom_logger.error(f"根據類型獲取電影失敗: {e}")
        return jsonify({
            'success': False,
            'error': '無法獲取該類型的電影',
            'message': str(e)
        }), 500

@movies_bp.route('/<int:movie_id>')
def get_movie_details(movie_id):
    if request.method == 'OPTIONS':
        return '', 200 
    
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
        current_app.custom_logger.error(f"獲取電影詳細資訊失敗: {e}")
        return jsonify({
            'success': False,
            'error': '無法獲取電影詳細資訊',
            'message': str(e)
        }), 500

@movies_bp.route('/analyze-movie-preference', methods=['POST', 'OPTIONS'])
def analyze_movie_preference():
    if request.method == 'OPTIONS':
        return '', 200 
    
    data = request.get_json(silent=True) or {}
    userInput = data.get('userInput', '').strip()
    language = data.get('language', "zh-TW").strip()
    bot_response = ''
    
    isFunctionCall, response, movie_title, movie_target = get_openai_service(current_app).azure_openai(
        userInput
    )
    
    bot_response = response
    
    if isFunctionCall:
        movie_title = call_tmdb(movie_title)
    else:
        print('round2:')
        isFunctionCall, response, movie_title, movie_target = get_openai_service(current_app).azure_openai(
            response,
            "auto",
            prompt_file = "prompts/user_prompt.json",
            message_text_file ="prompts/bot_user_message_text.json"
        )
        
        try:
            response = json.loads(response)
            if 'text' in response:
                movie_title = response['text']
            print(isFunctionCall, response, movie_title, movie_target)
            print('')
        except Exception as e:
            current_app.custom_logger.error(f"解析 OpenAI 回應失敗: {e}")
            return jsonify({
                'success': False,
                'error': '無法解析 OpenAI 回應',
                'message': str(e)
            }), 500
        
    return jsonify({
                'success': True,
                'bot_content': bot_response,
                'keywords': movie_title,
    
            })


def call_tmdb(movie_title):
    print("movie_title : ", movie_title)
    baseUrl = "https://api.themoviedb.org/3/search/movie?"
    parameters = "language=" + "zh-TW"
    parameters += "&"
    parameters += "query=" + movie_title

    headers = {
        "accept": "application/json",
        "Authorization": "Bearer " + current_app.config['TMDB_API_TOKEN'],
    }

    response = requests.get(baseUrl + parameters, headers=headers)
    result = json.loads(response.text)
    
    if len(result["results"]) != 0:
        return result["results"][0]["title"]
    else:
        return ''

