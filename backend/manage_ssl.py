#!/usr/bin/env python3
"""
SSL 配置管理腳本

用法:
  python manage_ssl.py status         # 檢查當前 SSL 狀態
  python manage_ssl.py enable         # 啟用 SSL (切換到 HTTPS)
  python manage_ssl.py disable        # 停用 SSL (切換到 HTTP)
  python manage_ssl.py update         # 根據當前設定更新所有 URL
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from utils.ssl_utils import (
    get_ssl_enabled, 
    set_ssl_enabled, 
    update_config_urls,
    get_protocol
)

def show_status():
    """顯示當前 SSL 狀態"""
    ssl_enabled = get_ssl_enabled()
    protocol = get_protocol()
    
    print(f"SSL 狀態: {'啟用' if ssl_enabled else '停用'}")
    print(f"當前協議: {protocol}")
    
    # 顯示一些關鍵 URL 的當前狀態
    import configparser
    config = configparser.ConfigParser()
    config.read('config.ini')
    
    print("\n當前 URL 配置:")
    if 'URL' in config:
        for key in ['FRONTEND_URL', 'PRODUCTION_FRONTEND_URL']:
            if key in config['URL']:
                print(f"  {key}: {config['URL'][key]}")
    
    if 'LineLogin' in config and 'REDIRECT_URI' in config['LineLogin']:
        print(f"  LINE_LOGIN_REDIRECT_URI: {config['LineLogin']['REDIRECT_URI']}")
    
    if 'OllamaLLM' in config and 'OLLAMA_CLIENT' in config['OllamaLLM']:
        print(f"  OLLAMA_CLIENT: {config['OllamaLLM']['OLLAMA_CLIENT']}")

def enable_ssl():
    """啟用 SSL"""
    print("正在啟用 SSL...")
    set_ssl_enabled(True)
    update_config_urls()
    print("✅ SSL 已啟用，所有 URL 已更新為 HTTPS")
    show_status()

def disable_ssl():
    """停用 SSL"""
    print("正在停用 SSL...")
    set_ssl_enabled(False)
    update_config_urls()
    print("✅ SSL 已停用，所有 URL 已更新為 HTTP")
    show_status()

def update_urls():
    """根據當前設定更新 URL"""
    print("正在更新 URL...")
    update_config_urls()
    print("✅ URL 已根據當前 SSL 設定更新")
    show_status()

def main():
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command == 'status':
        show_status()
    elif command == 'enable':
        enable_ssl()
    elif command == 'disable':
        disable_ssl()
    elif command == 'update':
        update_urls()
    else:
        print(f"未知命令: {command}")
        print(__doc__)
        sys.exit(1)

if __name__ == "__main__":
    main()
