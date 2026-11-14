// Lets specs import component templates as text: `import tpl from './x.html' with { loader: 'text' };`
declare module '*.html' {
  const content: string;
  export default content;
}
