import ReactMarkdown from 'react-markdown';

export default function AiText({ text }) {
  console.info('text', text);
  return <ReactMarkdown>{text}</ReactMarkdown>;
}
