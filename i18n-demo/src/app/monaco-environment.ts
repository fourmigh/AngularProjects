/**
 * 由宿主项目负责 Monaco 的 worker 资源（库内的编辑器组件不硬编码路径）。
 * 必须在创建编辑器之前调用。
 */
export function setupMonacoEnvironment(): void {
  (globalThis as { MonacoEnvironment?: { getWorker: (moduleId: string, label: string) => Worker } })
    .MonacoEnvironment = {
    getWorker(_moduleId: string, label: string) {
      if (label === 'json') {
        return new Worker(
          new URL('../../node_modules/monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url),
          { type: 'module' },
        );
      }
      return new Worker(
        new URL('../../node_modules/monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
        { type: 'module' },
      );
    },
  };
}
