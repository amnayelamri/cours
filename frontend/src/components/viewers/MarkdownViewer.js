import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const MarkdownViewer = ({ content }) => (
  <div className="markdown-viewer">
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
      {content || ''}
    </ReactMarkdown>
  </div>
);

export default MarkdownViewer;
