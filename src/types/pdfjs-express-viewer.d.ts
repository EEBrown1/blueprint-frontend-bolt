declare module '@pdftron/pdfjs-express-viewer' {
  interface WebViewerInstance {
    docViewer: {
      on: (event: string, callback: () => void) => void;
    };
    annotManager: any;
  }

  interface WebViewerOptions {
    path: string;
    initialDoc: string;
    licenseKey?: string;
  }

  type WebViewerFunction = (
    options: WebViewerOptions,
    element: HTMLElement
  ) => Promise<WebViewerInstance>;

  const WebViewer: WebViewerFunction;
  export default WebViewer;
} 