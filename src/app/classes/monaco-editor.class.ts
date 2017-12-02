import { CodeEditor, CodeEditorChoiceEnum } from './code-editor.abstract';

let Monaco;
//scrollBeyondLastLine: false,
export class MonacoEditor extends CodeEditor {

  readonly vendor = CodeEditorChoiceEnum.MONACO;

  protected setters = {
    tabSize: (value) => {
      // this.instance.updateOptions({});
    },
    emmet: (enable) => {
      return false;
    },
    folding: (folding) => {
      this.instance.updateOptions({
        folding: (folding === 'always') || (folding === 'hover') || folding,
        showFoldingControls: typeof folding === 'string' ? folding : 'hover'
      });
    },
    lang: (lang: string) => {
      lang = {}[lang] || lang;
      Monaco.editor.setModelLanguage(
        this.instance.getModel(),
        lang);
      // let
      //   value = this.instance.getValue(),
      //   editor = this.instance,
      //   oldModel = editor.getModel(),
      //   newModel = monaco.editor.createModel(value, lang);
      // editor.setModel(newModel);
      // if (oldModel) {
      //   oldModel.dispose();
      // }
    },
    wrap: (wrap: boolean) => {

    },
    editable: (editable: boolean) => {
      this.instance.updateOptions({ readOnly: !editable });
    },
    fontSize: (size: number) => {
      this.instance.updateOptions({ fontSize: size });
    },
    theme: (theme: string) => {
      switch (theme) {
        case 'dark':
          Monaco.editor.setTheme('vs-dark');
          break;
        case 'light':
        case 'default':
        default:
          Monaco.editor.setTheme('vs');
          break;
      }
    },
    value: (value) => {
      this.instance.setValue(value);
    }
  };

  // https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.istandalonecodeeditor.html
  // https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditoroptions.html
  // https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html
  // 'vs' (default), 'vs-dark', 'hc-black'
  constructor() {
    super();
    requirejs(['vs/editor/editor.main'], () => {
      Monaco = window['monaco'];
      const loaded = this.loaded;
      loaded.next(true);
      loaded.complete();
    });
  }

  value(nextValue?: string): Promise<string> {
    return this.tap(() => {
      if (nextValue !== undefined) {
        this.instance.setValue(nextValue);
        return nextValue;
      } else {
        return this.instance.getValue();
      }
    });
  }

  render(elem: any, options: any): Promise<CodeEditor> {
    return this.tap(() => {
      let { rendered } = this;
      let editor = Monaco.editor.create(elem);
      editor.getModel().onDidChangeContent((e) => {
        this.changes.next({
          value: this.instance.getValue(),
          originalEvent: e
        });
      });
      this.instance = editor;
      rendered.next(true);
      rendered.complete();
      if (options) {
        this.options(options);
      }
    });
  }

  dispose(): void {
    this.disposeSubjects();
    this.instance.dispose();
    // if (this.instance) {
    //   this.instance.dispose();
    // }
  }

}