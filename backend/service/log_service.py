import logging
import os
from datetime import datetime

class LogService:
    def __init__(self, app=None, log_dir='logs'):
        self.app = app
        self.log_dir = log_dir
        self.loggers = {}
        
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
            
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """初始化 Flask app 的 logging"""
        self.app = app
        self.setup_app_logger()
        
    def setup_app_logger(self):
        """設定 Flask app 的主要 logger"""
        if not self.app:
            return

        self.app.logger.handlers.clear()
        
        error_handler = self._create_file_handler(
            filename='flask_error.log',
            level=logging.ERROR,
            filter_level=logging.ERROR
        )
        self.app.logger.addHandler(error_handler)
        
        info_handler = self._create_file_handler(
            filename='flask_info.log', 
            level=logging.INFO,
            filter_level=logging.INFO
        )
        self.app.logger.addHandler(info_handler)
        
        warning_handler = self._create_file_handler(
            filename='flask_warning.log',
            level=logging.WARNING,
            filter_level=logging.WARNING
        )
        self.app.logger.addHandler(warning_handler)
        
        self.app.logger.setLevel(logging.INFO)
        
    def _create_file_handler(self, filename, level, filter_level=None):
        """建立檔案 handler"""
        filepath = os.path.join(self.log_dir, filename)
        handler = logging.FileHandler(filepath, encoding='utf-8')
        handler.setLevel(level)
        
        # 設定格式
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        
        if filter_level:
            handler.addFilter(self._create_level_filter(filter_level))
            
        return handler
    
    def _create_level_filter(self, target_level):
        """建立只允許特定等級 log 的 filter"""
        class LevelFilter(logging.Filter):
            def filter(self, record):
                return record.levelno == target_level
        return LevelFilter()
    
    def get_custom_logger(self, name, filename=None):
        """取得自訂 logger"""
        if name in self.loggers:
            return self.loggers[name]
            
        # 建立新的 logger
        logger = logging.getLogger(name)
        logger.setLevel(logging.INFO)
        
        # 檔案名稱
        if not filename:
            filename = f"{name}.log"
            
        # 建立 handler
        handler = self._create_file_handler(filename, logging.INFO)
        logger.addHandler(handler)
        
        # 避免重複 log（不傳播到父 logger）
        logger.propagate = False
        
        self.loggers[name] = logger
        return logger
    
    def log_info(self, message, logger_name=None):
        """記錄 INFO 等級 log"""
        if logger_name and logger_name in self.loggers:
            self.loggers[logger_name].info(message)
        elif self.app:
            self.app.logger.info(message)
            
    def log_error(self, message, logger_name=None):
        """記錄 ERROR 等級 log"""
        if logger_name and logger_name in self.loggers:
            self.loggers[logger_name].error(message)
        elif self.app:
            self.app.logger.error(message)
            
    def log_warning(self, message, logger_name=None):
        """記錄 WARNING 等級 log"""
        if logger_name and logger_name in self.loggers:
            self.loggers[logger_name].warning(message)
        elif self.app:
            self.app.logger.warning(message)
    
    def clear_old_logs(self, days=7):
        """清除舊的 log 檔案"""
        import glob
        import time
        
        pattern = os.path.join(self.log_dir, "*.log")
        now = time.time()
        cutoff = now - (days * 24 * 60 * 60)
        
        for log_file in glob.glob(pattern):
            if os.path.getmtime(log_file) < cutoff:
                try:
                    os.remove(log_file)
                    print(f"已刪除舊 log 檔: {log_file}")
                except Exception as e:
                    print(f"無法刪除 log 檔 {log_file}: {e}")
