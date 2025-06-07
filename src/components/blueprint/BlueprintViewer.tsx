// Add type declaration for the module
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

import WebViewer from '@pdftron/pdfjs-express-viewer';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface BlueprintViewerProps {
  blueprintId: string;
}

const BlueprintViewer = ({ blueprintId }: BlueprintViewerProps) => {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<any>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch signed URL from Supabase
  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        // Get the storage path from the blueprints table
        const { data: blueprintData, error: fetchError } = await supabase
          .from('pdf_documents')
          .select('storage_path')
          .eq('id', blueprintId)
          .single();

        if (fetchError || !blueprintData) {
          throw new Error(fetchError?.message || 'Blueprint not found');
        }

        // Get a signed URL for the file
        const { data, error: urlError } = await supabase.storage
          .from('blueprints')
          .createSignedUrl(blueprintData.storage_path, 300);

        if (urlError || !data?.signedUrl) {
          throw new Error(urlError?.message || 'Failed to generate signed URL');
        }

        setSignedUrl(data.signedUrl);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch signed URL:', err);
        setError(err instanceof Error ? err.message : 'Failed to load blueprint');
        setSignedUrl(null);
      }
    };

    if (blueprintId) {
      fetchSignedUrl();
    }
  }, [blueprintId]);

  // Initialize WebViewer when we have a signed URL
  useEffect(() => {
    if (!viewerRef.current || !signedUrl) {
      return;
    }

    // Clean up previous instance if it exists
    if (instanceRef.current) {
      instanceRef.current.dispose();
      instanceRef.current = null;
    }

    WebViewer(
      {
        path: '/webviewer/lib',
        initialDoc: signedUrl,
      },
      viewerRef.current
    ).then((instance) => {
      console.log('✅ WebViewer loaded');
      instanceRef.current = instance;
      const { docViewer } = instance;

      docViewer.on('documentLoaded', () => {
        console.log('✅ Document rendered');
      });
    }).catch((error: Error) => {
      console.error('❌ WebViewer error:', error);
      setError(error.message);
    });

    // Cleanup function
    return () => {
      if (instanceRef.current) {
        instanceRef.current.dispose();
        instanceRef.current = null;
      }
    };
  }, [signedUrl]);

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px] bg-white">
      <div 
        ref={viewerRef} 
        className="absolute inset-0"
        style={{
          width: '100%',
          height: '100%'
        }}
      />
      {!signedUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default BlueprintViewer;