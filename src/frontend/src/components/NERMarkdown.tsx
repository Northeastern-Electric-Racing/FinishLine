import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import { Box } from '@mui/material';

interface NERMarkdownProps {
  markdown: string;
}

const NERMarkdown = ({ markdown }: NERMarkdownProps) => {
  // make all links open in new tabs
  const components: Components = {
    a: ({ node, children, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer">{children}</a>
  };

  return (
    <Box
      sx={{
        fontSize: '16px',
        lineHeight: 1.3,
        '& h1': {
          fontSize: '1.4em',
          margin: '0.8em 0 0.4em 0',
          fontWeight: 600
        },
        '& h2': {
          fontSize: '1.2em',
          margin: '0.7em 0 0.3em 0',
          fontWeight: 600
        },
        '& h3': {
          fontSize: '1.1em',
          margin: '0.6em 0 0.2em 0',
          fontWeight: 600
        },
        '& h4, & h5, & h6': {
          fontSize: '1em',
          margin: '0.5em 0 0.2em 0',
          fontWeight: 600
        },
        '& p': {
          margin: '0.3em 0'
        },
        '& ul, & ol': {
          margin: '0.4em 0',
          paddingLeft: '1.5em'
        },
        '& li': {
          margin: '0.1em 0'
        },
        '& li > ul, & li > ol': {
          margin: '0.2em 0'
        },
        '& a': {
          color: '#dc2626',
          textDecoration: 'underline',
          '&:hover': {
            color: '#b91c1c',
            textDecoration: 'none'
          }
        },
        '& code': {
          backgroundColor: '#f3f4f6',
          color: '#374151',
          padding: '0.1em 0.3em',
          borderRadius: '3px',
          fontSize: '0.9em'
        },
        '& pre': {
          backgroundColor: '#f3f4f6',
          color: '#374151',
          padding: '0.5em',
          borderRadius: '4px',
          overflowX: 'auto',
          margin: '0.4em 0'
        },
        '& pre code': {
          background: 'none',
          color: 'inherit',
          padding: 0
        },
        '& blockquote': {
          borderLeft: '3px solid #d1d5db',
          paddingLeft: '0.8em',
          margin: '0.4em 0',
          fontStyle: 'italic',
          color: '#6b7280'
        },
        '& table': {
          borderCollapse: 'collapse',
          margin: '0.4em 0',
          fontSize: '0.9em'
        },
        '& th, & td': {
          border: '1px solid #d1d5db',
          padding: '0.3em 0.5em',
          textAlign: 'left'
        },
        '& th': {
          backgroundColor: '#f9fafb',
          fontWeight: 600
        },
        '& hr': {
          border: 'none',
          borderTop: '1px solid #e5e7eb',
          margin: '0.6em 0'
        },
        '& img': {
          maxWidth: '100%',
          height: 'auto',
          margin: '0.3em 0'
        }
      }}
    >
      <ReactMarkdown components={components}>{markdown}</ReactMarkdown>
    </Box>
  );
};

export default NERMarkdown;
