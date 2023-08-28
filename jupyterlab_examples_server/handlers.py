import io
import os
import shutil

from bottle import Bottle
from jupyter_server.utils import url_path_join
from optuna.artifacts import FileSystemArtifactStore
from tornado.web import FallbackHandler
from tornado.web import StaticFileHandler
from tornado.wsgi import WSGIContainer

from ._app import wsgi


app = Bottle()


@app.get("/jupyterlab-examples-server/hello")
def hello():
    return {"data": "Hello World from Bottle!"}


@app.post("/jupyterlab-examples-server/hello")
def hello():
    return {"data": "Hello World again from Bottle!"}


storage = "sqlite:///db.sqlite3"
_dashboard_app = wsgi(storage=storage)


def dashboard_app(env, start_response):
    # Set Content-Type
    if "/api/" in env["PATH_INFO"]:
        env["CONTENT_TYPE"] = "application/json"
    return _dashboard_app(env, start_response)


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    # Prepend the base_url so that it works in a JupyterHub setting
    route_pattern = url_path_join(base_url, "jupyterlab-examples-server", r"(.*)")

    handlers = [(route_pattern, FallbackHandler, dict(fallback=WSGIContainer(dashboard_app)))]
    web_app.add_handlers(host_pattern, handlers)

    # Prepend the base_url so that it works in a JupyterHub setting
    doc_url = url_path_join(base_url, "jupyterlab-examples-server", "public")
    doc_dir = os.getenv(
        "JLAB_SERVER_EXAMPLE_STATIC_DIR",
        os.path.join(os.path.dirname(__file__), "public"),
    )
    handlers = [("{}/(.*)".format(doc_url), StaticFileHandler, {"path": doc_dir})]
    web_app.add_handlers(host_pattern, handlers)
