import optuna
import logging
import os.path
import textwrap
from typing import Tuple

import optuna
from optuna.artifacts import FileSystemArtifactStore
from optuna.distributions import CategoricalDistribution
from optuna.distributions import FloatDistribution
from optuna_dashboard import ObjectiveChoiceWidget
from optuna_dashboard import ObjectiveSliderWidget
from optuna_dashboard import ObjectiveTextInputWidget
from optuna_dashboard import ObjectiveUserAttrRef
from optuna_dashboard import register_objective_form_widgets
from optuna_dashboard import save_note
from optuna_dashboard import set_objective_names


def create_optuna_storage(storage):
    # Single-objective study
    study = optuna.create_study(study_name="single-objective", storage=storage)
    note = textwrap.dedent(
        """\
    ## Objective Function
    $$
    y = (x1 - 2)^{{2}} + (x2 -5)^{{2}}
    $$
    """
    )
    save_note(study, note)

    def objective_single(trial: optuna.Trial) -> float:
        x1 = trial.suggest_float("x1", 0, 10)
        x2 = trial.suggest_float("x2", 0, 10)
        x3 = trial.suggest_categorical("x3", ["foo", "bar"])

        note = textwrap.dedent(
            f"""\
        ## Trial {trial._trial_id}
        $$
        y = (x1 - 2)^{{2}} + (x2 - 5)^{{2}} = ({x1} - 2)^{{2}} + ({x2} - 5)^{{2}}
        $$
        """
        )
        save_note(trial, note)
        return (x1 - 2) ** 2 + (x2 - 5) ** 2

    study.optimize(objective_single, n_trials=100)

    # Single-objective study
    study = optuna.create_study(study_name="single-objective-user-attrs", storage=storage)

    def objective_single_user_attr(trial: optuna.Trial) -> float:
        x1 = trial.suggest_float("x1", 0, 10)
        x2 = trial.suggest_float("x2", 0, 10)
        if x1 < 5:
            trial.set_user_attr("X", "foo")
        else:
            trial.set_user_attr("X", "bar")
        trial.set_user_attr("Y", x1 + x2)
        return (x1 - 2) ** 2 + (x2 - 5) ** 2

    study.optimize(objective_single_user_attr, n_trials=100)

    # Single objective study with 'inf', '-inf', or 'nan' value
    study = optuna.create_study(study_name="single-inf", storage=storage)

    def objective_single_inf(trial: optuna.Trial) -> float:
        x = trial.suggest_float("x", -10, 10)
        if trial.number % 3 == 0:
            return float("inf")
        elif trial.number % 3 == 1:
            return float("-inf")
        else:
            return x**2

    study.optimize(objective_single_inf, n_trials=50)

    # Single objective pruned after reported 'inf', '-inf', or 'nan'
    study = optuna.create_study(study_name="single-inf-report", storage=storage)

    def objective_single_inf_report(trial: optuna.Trial) -> float:
        x = trial.suggest_float("x", -10, 10)
        if trial.number % 3 == 0:
            trial.report(float("inf"), 1)
        elif trial.number % 3 == 1:
            trial.report(float("-inf"), 1)
        else:
            trial.report(float("nan"), 1)

        if x > 0:
            raise optuna.TrialPruned()
        else:
            return x**2

    study.optimize(objective_single_inf_report, n_trials=50)

    ## Single objective with reported nan value
    # study = optuna.create_study(study_name="single-nan-report", storage=storage)

    # def objective_single_nan_report(trial: optuna.Trial) -> float:
    #    x1 = trial.suggest_float("x1", 0, 10)
    #    x2 = trial.suggest_float("x2", 0, 10)
    #    trial.report(0.5, step=0)
    #    trial.report(math.nan, step=1)
    #    return (x1 - 2) ** 2 + (x2 - 5) ** 2

    # study.optimize(objective_single_nan_report, n_trials=100)

    # Single-objective study with dynamic search space
    study = optuna.create_study(
        study_name="single-objective-dynamic", storage=storage, direction="maximize"
    )

    def objective_single_dynamic(trial: optuna.Trial) -> float:
        category = trial.suggest_categorical("category", ["foo", "bar"])
        if category == "foo":
            return (trial.suggest_float("x1", 0, 10) - 2) ** 2
        else:
            return -((trial.suggest_float("x2", -10, 0) + 5) ** 2)

    study.optimize(objective_single_dynamic, n_trials=50)

    # Single-objective study with 1 parameter
    study = optuna.create_study(
        study_name="single-objective-1-param", storage=storage, direction="maximize"
    )

    def objective_single_with_1param(trial: optuna.Trial) -> float:
        x1 = trial.suggest_float("x1", 0, 10)
        return -((x1 - 2) ** 2)

    study.optimize(objective_single_with_1param, n_trials=50)

    # Single-objective study with 1 parameter
    study = optuna.create_study(study_name="long-parameter-names", storage=storage)

    def objective_long_parameter_names(trial: optuna.Trial) -> float:
        x1 = trial.suggest_float(
            "x1_long_parameter_names_long_long_long_long_long_long_long_long_long_long", 0, 10
        )
        x2 = trial.suggest_float(
            "x2_long_parameter_names_long_long_long_long_long_long_long_long_long_long", 0, 10
        )
        return (x1 - 2) ** 2 + (x2 - 5) ** 2

    study.optimize(objective_long_parameter_names, n_trials=50)

    # Multi-objective study
    study = optuna.create_study(
        study_name="multi-objective",
        storage=storage,
        directions=["minimize", "minimize"],
    )
    set_objective_names(study, ["v0", "v1"])

    def objective_multi(trial: optuna.Trial) -> Tuple[float, float]:
        x = trial.suggest_float("x", 0, 5)
        y = trial.suggest_float("y", 0, 3)
        v0 = 4 * x**2 + 4 * y**2
        v1 = (x - 5) ** 2 + (y - 5) ** 2
        return v0, v1

    study.optimize(objective_multi, n_trials=50)

    # Multi-objective study with dynamic search space
    study = optuna.create_study(
        study_name="multi-dynamic", storage=storage, directions=["minimize", "minimize"]
    )

    def objective_multi_dynamic(trial: optuna.Trial) -> Tuple[float, float]:
        category = trial.suggest_categorical("category", ["foo", "bar"])
        if category == "foo":
            x = trial.suggest_float("x1", 0, 5)
            y = trial.suggest_float("y1", 0, 3)
            v0 = 4 * x**2 + 4 * y**2
            v1 = (x - 5) ** 2 + (y - 5) ** 2
            return v0, v1
        else:
            x = trial.suggest_float("x2", 0, 5)
            y = trial.suggest_float("y2", 0, 3)
            v0 = 2 * x**2 + 2 * y**2
            v1 = (x - 2) ** 2 + (y - 3) ** 2
            return v0, v1

    study.optimize(objective_multi_dynamic, n_trials=50)

    # Pruning with no intermediate values
    study = optuna.create_study(study_name="binh-korn-function-with-constraints", storage=storage)

    def objective_prune_with_no_trials(trial: optuna.Trial) -> float:
        x = trial.suggest_float("x", -15, 30)
        y = trial.suggest_float("y", -15, 30)
        v = x**2 + y**2
        if v > 100:
            raise optuna.TrialPruned()
        return v

    study.optimize(objective_prune_with_no_trials, n_trials=100)

    # With failed trials
    study = optuna.create_study(study_name="failed trials", storage=storage)

    def objective_sometimes_got_failed(trial: optuna.Trial) -> float:
        x = trial.suggest_float("x", -15, 30)
        y = trial.suggest_float("y", -15, 30)
        v = x**2 + y**2
        if v > 100:
            raise ValueError("unexpected error")
        return v

    study.optimize(objective_sometimes_got_failed, n_trials=100, catch=(Exception,))

    # No trials single-objective study
    optuna.create_study(study_name="no trials single-objective study", storage=storage)

    # study with waiting trials
    study = optuna.create_study(study_name="waiting-trials", storage=storage)
    study.enqueue_trial({"x": 0, "y": 10})
    study.enqueue_trial({"x": 10, "y": 20})

    # Study with Running Trials
    study = optuna.create_study(
        study_name="running-trials", storage=storage, directions=["minimize", "maximize"]
    )
    set_objective_names(study, ["auc", "val_loss"])
    study.enqueue_trial({"x": 10, "y": "Foo"})
    study.ask({"x": FloatDistribution(0, 10), "y": CategoricalDistribution(["Foo", "Bar"])})
    study.ask({"x": FloatDistribution(0, 10), "y": CategoricalDistribution(["Foo", "Bar"])})

    # Single-objective study with constraints
    def objective_constraints(trial: optuna.Trial) -> float:
        x = trial.suggest_float("x", -15, 30)
        y = trial.suggest_float("y", -15, 30)
        v0 = 4 * x**2 + 4 * y**2
        trial.set_user_attr("constraint", [1000 - v0, x - 10, y - 10])
        return v0

    def constraints(trial: optuna.Trial) -> list[float]:
        return trial.user_attrs["constraint"]

    study = optuna.create_study(
        study_name="A single objective constraint optimization study",
        storage=storage,
        sampler=optuna.samplers.TPESampler(constraints_func=constraints),
    )
    study.optimize(objective_constraints, n_trials=100)

    # Study with Running Trials
    study = optuna.create_study(
        study_name="objective-form-widgets",
        storage=storage,
        directions=["minimize", "minimize", "minimize", "minimize"],
    )
    set_objective_names(
        study, ["Slider Objective", "Good or Bad", "Text Input Objective", "Validation Loss"]
    )
    register_objective_form_widgets(
        study,
        widgets=[
            ObjectiveSliderWidget(
                min=0.0,
                max=1.0,
                step=0.1,
                labels=[(0.0, "Better"), (0.5, "0.5"), (1.0, "Worse")],
                description="Select a value.",
            ),
            ObjectiveChoiceWidget(
                choices=["Good 👍", "Bad 👎"],
                values=[-1, 1],
                description="Choose Good 👍 or Bad 👎.",
            ),
            ObjectiveTextInputWidget(
                description="Enter the objective value via TextInput.",
            ),
            ObjectiveUserAttrRef(
                key="val_loss",
            ),
        ],
    )
    trial = study.ask(
        {"x": FloatDistribution(0, 10), "y": CategoricalDistribution(["Foo", "Bar"])}
    )
    trial.set_user_attr("val_loss", 0.2)
    study.ask({"x": FloatDistribution(0, 10), "y": CategoricalDistribution(["Foo", "Bar"])})
    trial.set_user_attr("val_loss", 0.5)

    # No trials multi-objective study
    optuna.create_study(
        study_name="no trials multi-objective study",
        storage=storage,
        directions=["minimize", "maximize"],
    )

    return storage



if __name__ == "__main__":
    storage = optuna.storages.get_storage("sqlite:///db.sqlite3")
    create_optuna_storage(storage)
