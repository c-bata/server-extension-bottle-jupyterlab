from ._app import run_server  # noqa
from ._app import wsgi  # noqa
from ._form_widget import ChoiceWidget  # noqa
from ._form_widget import ObjectiveChoiceWidget  # noqa
from ._form_widget import ObjectiveSliderWidget  # noqa
from ._form_widget import ObjectiveTextInputWidget  # noqa
from ._form_widget import ObjectiveUserAttrRef  # noqa
from ._form_widget import SliderWidget  # noqa
from ._form_widget import TextInputWidget  # noqa
from ._form_widget import dict_to_form_widget  # noqa
from ._form_widget import register_objective_form_widgets  # noqa
from ._form_widget import register_user_attr_form_widgets  # noqa
from .handlers import setup_handlers
from ._named_objectives import set_objective_names  # noqa
from ._note import get_note  # noqa
from ._note import save_note  # noqa
from ._version import __version__


def _jupyter_labextension_paths():
    return [{"src": "labextension", "dest": "@jupyterlab-examples/server-extension"}]


def _jupyter_server_extension_points():
    return [{"module": "jupyterlab_examples_server"}]


def _load_jupyter_server_extension(server_app):
    """Registers the API handler to receive HTTP requests from the frontend extension.

    Parameters
    ----------
    server_app: jupyterlab.labapp.LabApp
        JupyterLab application instance
    """
    setup_handlers(server_app.web_app)
    name = "jupyterlab_examples_server"
    server_app.log.info(f"Registered {name} server extension")


# For backward compatibility with notebook server - useful for Binder/JupyterHub
load_jupyter_server_extension = _load_jupyter_server_extension
