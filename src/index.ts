import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette } from '@jupyterlab/apputils';


import { ILauncher } from '@jupyterlab/launcher';


import { MainAreaWidget } from '@jupyterlab/apputils';
import { reactIcon } from '@jupyterlab/ui-components';
import { OptunaDashboardWidget } from './widget';


/**
 * The command IDs used by the server extension plugin.
 */
namespace CommandIDs {
  export const get = 'server:get-file';
  export const ui = 'server:dashboard-ui';
}

/**
 * Initialization data for the @jupyterlab-examples/server-extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@jupyterlab-examples/server-extension:plugin',
  description:
    'A minimal JupyterLab extension with backend and frontend parts.',
  autoStart: true,
  optional: [ILauncher],
  requires: [ICommandPalette],
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    launcher: ILauncher | null
  ) => {
    console.log(
      'JupyterLab extension @jupyterlab-examples/server-extension is activated!'
    );
    console.log('ICommandPalette:', palette);


    const { commands, shell } = app;

    commands.addCommand(CommandIDs.ui, {
      caption: 'Create a new React Widget',
      label: 'React Widget',
      icon: args => (args['isPalette'] ? undefined : reactIcon),
      execute: () => {
        const content = new OptunaDashboardWidget();
        const widget = new MainAreaWidget<OptunaDashboardWidget>({ content });
        widget.title.label = 'Optuna Dashboard Widget';
        widget.title.icon = reactIcon;
        shell.add(widget, 'main');
      }
    });
    if (launcher) {
      launcher.add({
        command: CommandIDs.ui,
      });
    }
  }
};

export default plugin;

