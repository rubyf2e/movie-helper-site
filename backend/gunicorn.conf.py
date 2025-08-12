import multiprocessing

# 工作進程數
workers = multiprocessing.cpu_count() * 2 + 1

# 使用 gevent worker
worker_class = 'gevent'

# 綁定地址
bind = '0.0.0.0:5000'

# 超時設置
timeout = 120

# 保持連線
keepalive = 65

# 日誌設置
accesslog = '-'
errorlog = '-'
loglevel = "debug"

reload = True
reload_extra_files = [
    "config.ini"
]

# 支援 SSE 串流
worker_connections = 1000