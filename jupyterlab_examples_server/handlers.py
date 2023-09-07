import io
import shutil

from bottle import Bottle
from bottle import request
from jupyter_server.utils import url_path_join
from optuna.artifacts import FileSystemArtifactStore
from optuna.storages import InMemoryStorage
from tornado.web import FallbackHandler
from tornado.wsgi import WSGIContainer

from ._app import API_NAMESPACE
from ._app import wsgi
from ._bottle_util import json_api_view


_dashboard_app = wsgi(storage=InMemoryStorage())
_initializer_app = Bottle()


# @app.get("/jupyterlab-examples-server/is_initialized")
# def is_initialized():
#    global _dashboard_app
#
#    # リクエスト情報を取ってきて、 _dashboard_appをセットする
#    return {"data": "Hello World from Bottle!"}


@_initializer_app.post(f"/{API_NAMESPACE}/api/register_dashboard_app")
@json_api_view
def initialize_dashboard():
    global _dashboard_app
    storage_url = request.json.get("storage_url")
    artifact_path = request.json.get("artifact_path")

    storage = storage_url or InMemoryStorage()  # or "sqlite:///db.sqlite3"
    artifact_store = FileSystemArtifactStore(artifact_path)  # or "./artifacts")

    _dashboard_app = wsgi(storage=storage, artifact_store=artifact_store)


def initializer_app(env, start_response):
    env["CONTENT_TYPE"] = "application/json"

    print("---------------- DEBUG WSGI Environment ------------")
    print(env)

    buf = io.BytesIO()
    shutil.copyfileobj(env["wsgi.input"], buf)
    buf.seek(0)
    print("---------------- DEBUG Request Body ----------------")
    print(buf.read().decode("utf-8"))

    buf.seek(0)
    env["wsgi.input"] = buf

    return _initializer_app(env, start_response)


def dashboard_app(env, start_response):
    # Set Content-Type
    if "/api/" in env["PATH_INFO"]:
        env["CONTENT_TYPE"] = "application/json"

    print("---------------- DEBUG WSGI Environment ------------")
    print(env)

    buf = io.BytesIO()
    shutil.copyfileobj(env["wsgi.input"], buf)
    buf.seek(0)
    print("---------------- DEBUG Request Body ----------------")
    print(buf.read().decode("utf-8"))

    buf.seek(0)
    env["wsgi.input"] = buf
    return _dashboard_app(env, start_response)


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    # Prepend the base_url so that it works in a JupyterHub setting
    init_route_pattern = url_path_join(base_url, API_NAMESPACE, "api/register_dashboard_app")
    handlers = [
        (init_route_pattern, FallbackHandler, dict(fallback=WSGIContainer(initializer_app))),
    ]
    web_app.add_handlers(host_pattern, handlers)

    route_pattern = url_path_join(base_url, API_NAMESPACE, r"(.*)")
    handlers = [
        (route_pattern, FallbackHandler, dict(fallback=WSGIContainer(dashboard_app))),
    ]
    web_app.add_handlers(host_pattern, handlers)
