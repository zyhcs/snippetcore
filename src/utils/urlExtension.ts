import { MatchDecorator, Decoration, ViewPlugin, EditorView, ViewUpdate } from "@codemirror/view";
import { openUrl } from '@tauri-apps/plugin-opener';

const urlRegex = /(https?:\/\/[^\s"'<>]+)/g;

const linkDecoration = Decoration.mark({ class: "cm-clickable-url", attributes: { style: "text-decoration: underline; cursor: pointer; color: var(--theme-color);" } });

const urlDecorator = new MatchDecorator({
  regexp: urlRegex,
  decoration: linkDecoration
});

export const urlExtension = [
  ViewPlugin.fromClass(
    class {
      decorations;
      constructor(view: EditorView) {
        this.decorations = urlDecorator.createDeco(view);
      }
      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = urlDecorator.updateDeco(update, this.decorations);
        }
      }
    },
    {
      decorations: v => v.decorations
    }
  ),
  EditorView.domEventHandlers({
    mousedown(event, _view) {
        if (event.detail === 2 || event.ctrlKey || event.metaKey) {
            const target = event.target as HTMLElement;
            if (target.classList.contains("cm-clickable-url")) {
                const url = target.innerText;
                if (url) {
                    openUrl(url).catch(console.error);
                    event.preventDefault();
                    return true;
                }
            }
        }
        return false;
    }
  })
];
