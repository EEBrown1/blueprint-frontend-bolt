-- Enable RLS on all tables
ALTER TABLE pdf_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotation_history ENABLE ROW LEVEL SECURITY;

-- pdf_documents policies
CREATE POLICY "Users can view documents they own"
ON pdf_documents
FOR SELECT
USING (
  auth.uid() = uploaded_by
  OR EXISTS (
    SELECT 1 FROM document_shares
    WHERE document_shares.document_id = pdf_documents.id
    AND document_shares.shared_with = auth.uid()
  )
  OR access_level = 'public'
);

CREATE POLICY "Users can insert their own documents"
ON pdf_documents
FOR INSERT
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own documents"
ON pdf_documents
FOR UPDATE
USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own documents"
ON pdf_documents
FOR DELETE
USING (auth.uid() = uploaded_by);

-- pdf_annotations policies
CREATE POLICY "Users can view annotations on documents they have access to"
ON pdf_annotations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pdf_documents
    WHERE pdf_documents.id = pdf_annotations.document_id
    AND (
      pdf_documents.uploaded_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM document_shares
        WHERE document_shares.document_id = pdf_documents.id
        AND document_shares.shared_with = auth.uid()
      )
      OR pdf_documents.access_level = 'public'
    )
  )
);

CREATE POLICY "Users can insert annotations on documents they have access to"
ON pdf_annotations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pdf_documents
    WHERE pdf_documents.id = pdf_annotations.document_id
    AND (
      pdf_documents.uploaded_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM document_shares
        WHERE document_shares.document_id = pdf_documents.id
        AND document_shares.shared_with = auth.uid()
        AND document_shares.permission_level IN ('write', 'admin')
      )
    )
  )
  AND auth.uid() = created_by
);

CREATE POLICY "Users can update their own annotations"
ON pdf_annotations
FOR UPDATE
USING (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM pdf_documents
    WHERE pdf_documents.id = pdf_annotations.document_id
    AND (
      pdf_documents.uploaded_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM document_shares
        WHERE document_shares.document_id = pdf_documents.id
        AND document_shares.shared_with = auth.uid()
        AND document_shares.permission_level IN ('write', 'admin')
      )
    )
  )
);

CREATE POLICY "Users can delete their own annotations"
ON pdf_annotations
FOR DELETE
USING (auth.uid() = created_by);

-- document_shares policies
CREATE POLICY "Document owners can view shares"
ON document_shares
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pdf_documents
    WHERE pdf_documents.id = document_shares.document_id
    AND pdf_documents.uploaded_by = auth.uid()
  )
  OR shared_with = auth.uid()
);

CREATE POLICY "Document owners can insert shares"
ON document_shares
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pdf_documents
    WHERE pdf_documents.id = document_shares.document_id
    AND pdf_documents.uploaded_by = auth.uid()
  )
);

CREATE POLICY "Document owners can update shares"
ON document_shares
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM pdf_documents
    WHERE pdf_documents.id = document_shares.document_id
    AND pdf_documents.uploaded_by = auth.uid()
  )
);

CREATE POLICY "Document owners can delete shares"
ON document_shares
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM pdf_documents
    WHERE pdf_documents.id = document_shares.document_id
    AND pdf_documents.uploaded_by = auth.uid()
  )
);

-- annotation_history policies
CREATE POLICY "Users can view history of annotations they have access to"
ON annotation_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pdf_annotations
    WHERE pdf_annotations.id = annotation_history.annotation_id
    AND EXISTS (
      SELECT 1 FROM pdf_documents
      WHERE pdf_documents.id = pdf_annotations.document_id
      AND (
        pdf_documents.uploaded_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM document_shares
          WHERE document_shares.document_id = pdf_documents.id
          AND document_shares.shared_with = auth.uid()
        )
        OR pdf_documents.access_level = 'public'
      )
    )
  )
);

CREATE POLICY "System can insert annotation history"
ON annotation_history
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- No update/delete policies for annotation_history as it should be immutable 