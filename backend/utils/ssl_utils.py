"""
SSL 配置管理工具

提供統一的 SSL 配置管理功能，支援動態切換 HTTP/HTTPS 協議
"""

import configparser
from typing import List

def get_ssl_enabled(config_path: str = 'config.ini') -> bool:
    """取得 SSL_ENABLED 設定值"""
    config = configparser.ConfigParser()
    config.read(config_path)
    return config.getboolean('Base', 'SSL_ENABLED', fallback=False)

def set_ssl_enabled(enabled: bool, config_path: str = 'config.ini') -> None:
    """設定 SSL_ENABLED 值"""
    config = configparser.ConfigParser()
    config.read(config_path)
    
    if 'Base' not in config:
        config['Base'] = {}
    
    config['Base']['SSL_ENABLED'] = str(enabled).lower()
    
    with open(config_path, 'w') as configfile:
        config.write(configfile)

def get_protocol(ssl_enabled: bool = None, config_path: str = 'config.ini') -> str:
    """根據 SSL_ENABLED 設定回傳對應的協議"""
    if ssl_enabled is None:
        ssl_enabled = get_ssl_enabled(config_path)
    return 'https' if ssl_enabled else 'http'

def convert_url_protocol(url: str, ssl_enabled: bool = None, config_path: str = 'config.ini') -> str:
    """轉換 URL 的協議"""
    protocol = get_protocol(ssl_enabled, config_path)
    
    # 移除現有協議
    if url.startswith('http://') or url.startswith('https://'):
        url = url.split('://', 1)[1]
    
    return f"{protocol}://{url}"

def get_urls_with_protocol(urls: List[str], ssl_enabled: bool = None, config_path: str = 'config.ini') -> List[str]:
    """批量轉換 URL 列表的協議"""
    return [convert_url_protocol(url, ssl_enabled, config_path) for url in urls]

def update_config_urls(config_path: str = 'config.ini') -> None:
    """更新配置文件中的所有 URL，根據 SSL_ENABLED 設定統一協議"""
    config = configparser.ConfigParser()
    config.read(config_path)
    
    ssl_enabled = config.getboolean('Base', 'SSL_ENABLED', fallback=False)
    protocol = get_protocol(ssl_enabled)
    
    # 更新需要協議的配置項目
    sections_to_update = {
        'URL': ['FRONTEND_URL', 'PRODUCTION_FRONTEND_URL'],
        'LineLogin': ['REDIRECT_URI'],
        'CORS': ['ALLOWED_ORIGINS'],
        'OllamaLLM': ['OLLAMA_CLIENT']
    }
    
    for section, keys in sections_to_update.items():
        if section in config:
            for key in keys:
                if key in config[section]:
                    if key == 'ALLOWED_ORIGINS':
                        # 處理逗號分隔的多個 URL
                        urls = [url.strip() for url in config[section][key].split(',')]
                        updated_urls = get_urls_with_protocol(urls, ssl_enabled)
                        config[section][key] = ','.join(updated_urls)
                    else:
                        # 處理單個 URL
                        config[section][key] = convert_url_protocol(
                            config[section][key], ssl_enabled
                        )
    
    with open(config_path, 'w') as configfile:
        config.write(configfile)

if __name__ == "__main__":
    # 示例使用
    print(f"當前 SSL 狀態: {get_ssl_enabled()}")
    print(f"當前協議: {get_protocol()}")
    