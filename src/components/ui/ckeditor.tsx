"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Bold,
  Italic,
  Essentials,
  Paragraph,
  Heading,
  List,
  Link,
  BlockQuote,
  Table,
  TableToolbar,
  Image,
  ImageUpload,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageResize,
  Alignment,
  FontColor,
  FontSize,
  CodeBlock,
  Undo,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";
import "ckeditor5/ckeditor5-content.css";

interface CKEditorComponentProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export const CKEditorComponent = ({
  value = "",
  onChange,
  disabled = false,
}: CKEditorComponentProps) => {
  return (
    <div className="ckeditor-wrapper border rounded-lg overflow-hidden">
      <style jsx global>{`
        .ck-editor__editable {
          min-height: 400px;
        }
        .ck-content {
          font-family: inherit;
        }
        .ck-content ul,
        .ck-content ol {
          padding-left: 2rem;
          margin: 1rem 0;
        }
        .ck-content ul li,
        .ck-content ol li {
          margin: 0.5rem 0;
        }
        .ck-content h1,
        .ck-content h2,
        .ck-content h3 {
          margin: 1rem 0;
        }
        .ck-content p {
          margin: 0.5rem 0;
        }
        .ck-content blockquote {
          border-left: 4px solid #ccc;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #666;
        }
        .ck-content table {
          margin: 1rem 0;
        }
      `}</style>
      <CKEditor
        editor={ClassicEditor}
        config={{
          licenseKey: "GPL",
          plugins: [
            Essentials,
            Bold,
            Italic,
            Paragraph,
            Heading,
            List,
            Link,
            BlockQuote,
            Table,
            TableToolbar,
            Image,
            ImageUpload,
            ImageToolbar,
            ImageCaption,
            ImageStyle,
            ImageResize,
            Alignment,
            FontColor,
            FontSize,
            CodeBlock,
            Undo,
          ],
          toolbar: {
            items: [
              "undo",
              "redo",
              "|",
              "heading",
              "|",
              "bold",
              "italic",
              "|",
              "fontSize",
              "fontColor",
              "|",
              "alignment",
              "|",
              "bulletedList",
              "numberedList",
              "|",
              "link",
              "uploadImage",
              "insertTable",
              "blockQuote",
              "codeBlock",
            ],
          },
          heading: {
            options: [
              {
                model: "paragraph",
                title: "Paragraph",
                class: "ck-heading_paragraph",
              },
              {
                model: "heading1",
                view: "h1",
                title: "Heading 1",
                class: "ck-heading_heading1",
              },
              {
                model: "heading2",
                view: "h2",
                title: "Heading 2",
                class: "ck-heading_heading2",
              },
              {
                model: "heading3",
                view: "h3",
                title: "Heading 3",
                class: "ck-heading_heading3",
              },
            ],
          },
          table: {
            contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
          },
          image: {
            toolbar: [
              "imageTextAlternative",
              "imageStyle:inline",
              "imageStyle:block",
              "imageStyle:side",
            ],
          },
          fontSize: {
            options: [9, 11, 13, "default", 17, 19, 21],
          },
          alignment: {
            options: ["left", "center", "right", "justify"],
          },
        }}
        data={value}
        onChange={(_event: unknown, editor: ClassicEditor) => {
          const data = editor.getData();
          onChange?.(data);
        }}
        disabled={disabled}
      />
    </div>
  );
};
