import pytest
import sys
import os

# 添加 backend 目錄到 Python 路徑
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app

@pytest.fixture
def app():
    """創建測試應用"""
    app = create_app('testing')
    app.config.update({
        "TESTING": True,
        "TMDB_API_KEY": "test_key"
    })
    return app

@pytest.fixture
def client(app):
    """創建測試客戶端"""
    return app.test_client()

@pytest.fixture
def runner(app):
    """創建測試命令行執行器"""
    return app.test_cli_runner()
